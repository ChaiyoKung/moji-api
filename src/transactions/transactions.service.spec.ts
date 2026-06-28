import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TransactionsService } from "./transactions.service";
import { Transaction, TransactionDocument } from "./schemas/transaction.schema";
import { Account } from "../accounts/schemas/account.schema";
import { CategoriesService } from "../categories/categories.service";

dayjs.extend(utc);
dayjs.extend(timezone);

jest.mock("openai");

import OpenAI from "openai";

const mockChatCompletionsCreate = jest.fn();
const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

beforeEach(() => {
  MockOpenAI.mockImplementation(
    () =>
      ({
        chat: {
          completions: {
            create: mockChatCompletionsCreate,
          },
        },
      }) as unknown as OpenAI
  );
});

const mockCategories = [
  { _id: "cat-123", name: "Food", type: "expense" },
  { _id: "cat-456", name: "Salary", type: "income" },
];

const baseDto = {
  accountId: "acc-789",
  currency: "THB",
  timezone: "Asia/Bangkok",
  text: "lunch at restaurant",
};

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    type: "expense",
    amount: 150,
    date: "2024-01-15",
    note: "Lunch",
    categoryId: "cat-123",
    ...overrides,
  };
}

function makeCompletionResponse(items: unknown[]) {
  return {
    choices: [{ message: { content: JSON.stringify({ items }) } }],
  };
}

describe("TransactionsService.autoCreate", () => {
  let service: TransactionsService;
  let categoriesService: { findAllForUser: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    categoriesService = {
      findAllForUser: jest.fn().mockResolvedValue(mockCategories),
    };
    configService = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
        const map: Record<string, string> = {
          OPENAI_BASE_URL: "https://api.example.com",
          OPENAI_API_KEY: "test-key",
          TRANSACTION_AUTO_OPENAI_MODEL: "test-model",
        };
        return map[key] ?? defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: CategoriesService, useValue: categoriesService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getModelToken(Transaction.name),
          useValue: {},
        },
        {
          provide: getModelToken(Account.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    mockChatCompletionsCreate.mockReset();
  });

  it("happy path (text input) — single item, create() called with correct args and status draft", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([makeItem()])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    const result = await service.autoCreate(baseDto, null, "user-001");

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-001",
        accountId: "acc-789",
        categoryId: "cat-123",
        type: "expense",
        currency: "THB",
        date: "2024-01-15",
        timezone: "Asia/Bangkok",
        status: "draft",
        amount: 150,
        note: "Lunch",
        aiModel: "test-model",
      })
    );
    expect(result.created).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
  });

  it("happy path (image input) — AI returns valid data and create() is called", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([
        makeItem({ categoryId: "cat-456", type: "income" }),
      ])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    const imageBuffer = Buffer.from("fake-image-data");
    const result = await service.autoCreate(baseDto, imageBuffer, "user-001");

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat-456",
        type: "income",
        status: "draft",
        aiModel: "test-model",
      })
    );
    expect(result.created).toHaveLength(1);
  });

  it("multi-item happy path — all items created, failed is empty", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([
        makeItem({ note: "Pad Thai", amount: 80 }),
        makeItem({
          categoryId: "cat-456",
          type: "income",
          note: "Refund",
          amount: 50,
        }),
      ])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    const result = await service.autoCreate(baseDto, null, "user-001");

    expect(createSpy).toHaveBeenCalledTimes(2);
    expect(result.created).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });

  it("partial failure — valid item created, invalid item reported in failed", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([
        makeItem({ note: "Pad Thai" }),
        makeItem({ categoryId: "cat-unknown", note: "Unknown item" }),
      ])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    const result = await service.autoCreate(baseDto, null, "user-001");

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(result.created).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].item).toBe(2);
    expect(typeof result.failed[0].reason).toBe("string");
  });

  it("all items fail — throws UnprocessableEntityException", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([
        makeItem({ categoryId: "cat-unknown" }),
        makeItem({ categoryId: "cat-unknown-2" }),
      ])
    );
    jest.spyOn(service, "create").mockResolvedValue({} as TransactionDocument);

    await expect(service.autoCreate(baseDto, null, "user-001")).rejects.toThrow(
      UnprocessableEntityException
    );
  });

  it("empty items array — throws UnprocessableEntityException", async () => {
    mockChatCompletionsCreate.mockResolvedValue(makeCompletionResponse([]));
    jest.spyOn(service, "create").mockResolvedValue({} as TransactionDocument);

    await expect(service.autoCreate(baseDto, null, "user-001")).rejects.toThrow(
      UnprocessableEntityException
    );
  });

  it("date fallback — AI returns date: null, falls back to today in dto.timezone", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([makeItem({ date: null })])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    const expectedDate = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD");

    await service.autoCreate(baseDto, null, "user-001");

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ date: expectedDate, aiModel: "test-model" })
    );
  });

  it("amount omitted — AI returns amount: null, createDto has no amount field", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([makeItem({ amount: null })])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    await service.autoCreate(baseDto, null, "user-001");

    const calledWith = createSpy.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty("amount");
  });

  it("note omitted — AI returns note: null, createDto has no note field", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse([makeItem({ note: null })])
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as TransactionDocument);

    await service.autoCreate(baseDto, null, "user-001");

    const calledWith = createSpy.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty("note");
  });

  it("Zod parse error — AI returns invalid JSON structure, throws UnprocessableEntityException", async () => {
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ amount: 100 }) } }],
    });
    jest.spyOn(service, "create").mockResolvedValue({} as TransactionDocument);

    await expect(service.autoCreate(baseDto, null, "user-001")).rejects.toThrow(
      UnprocessableEntityException
    );
  });

  describe("system prompt — time-aware meal disambiguation", () => {
    beforeEach(() => {
      mockChatCompletionsCreate.mockReset();
    });

    async function getSystemPrompt(): Promise<string> {
      mockChatCompletionsCreate.mockResolvedValue(
        makeCompletionResponse([makeItem()])
      );
      jest
        .spyOn(service, "create")
        .mockResolvedValue({} as TransactionDocument);

      await service.autoCreate(baseDto, null, "user-001");

      const calls = mockChatCompletionsCreate.mock.calls as Array<
        [{ messages: Array<{ content: string }> }]
      >;
      return calls[0][0].messages[0].content;
    }

    it("prompt includes timezone", async () => {
      const systemPrompt = await getSystemPrompt();
      expect(systemPrompt).toContain("Timezone: Asia/Bangkok");
    });

    it("prompt includes current local datetime", async () => {
      const expectedNow = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm");
      const systemPrompt = await getSystemPrompt();
      expect(systemPrompt).toContain(`Current local date/time: ${expectedNow}`);
    });

    it("prompt includes all meal window rules", async () => {
      const systemPrompt = await getSystemPrompt();
      expect(systemPrompt).toContain("breakfast: 05:00-11:59");
      expect(systemPrompt).toContain("lunch: 12:00-16:59");
      expect(systemPrompt).toContain("dinner: 17:00-23:59");
      expect(systemPrompt).toContain("00:00-04:59");
    });
  });
});
