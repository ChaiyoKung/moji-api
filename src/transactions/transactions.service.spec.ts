import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TransactionsService } from "./transactions.service";
import { Transaction } from "./schemas/transaction.schema";
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

function makeAiResponse(overrides: Record<string, unknown> = {}) {
  return {
    type: "expense",
    amount: 150,
    date: "2024-01-15",
    note: "Lunch",
    categoryId: "cat-123",
    ...overrides,
  };
}

function makeCompletionResponse(content: unknown) {
  return {
    choices: [{ message: { content } }],
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
          OPENAI_MODEL: "test-model",
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

  it("happy path (text input) — create() called with correct args and status draft", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(makeAiResponse())
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as Transaction);

    await service.autoCreate(baseDto, null, "user-001");

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
      })
    );
  });

  it("happy path (image input) — AI returns valid data and create() is called", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(
        makeAiResponse({ categoryId: "cat-456", type: "income" })
      )
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as Transaction);

    const imageBuffer = Buffer.from("fake-image-data");
    await service.autoCreate(baseDto, imageBuffer, "user-001");

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat-456",
        type: "income",
        status: "draft",
      })
    );
  });

  it("date fallback — AI returns date: null, date falls back to today in dto.timezone", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(makeAiResponse({ date: null }))
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as Transaction);

    const expectedDate = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD");

    await service.autoCreate(baseDto, null, "user-001");

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ date: expectedDate })
    );
  });

  it("amount omitted — AI returns amount: null, createDto has no amount field", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(makeAiResponse({ amount: null }))
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as Transaction);

    await service.autoCreate(baseDto, null, "user-001");

    const calledWith = createSpy.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty("amount");
  });

  it("note omitted — AI returns note: null, createDto has no note field", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(makeAiResponse({ note: null }))
    );
    const createSpy = jest
      .spyOn(service, "create")
      .mockResolvedValue({} as Transaction);

    await service.autoCreate(baseDto, null, "user-001");

    const calledWith = createSpy.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty("note");
  });

  it("categoryId not in categories — throws UnprocessableEntityException", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse(makeAiResponse({ categoryId: "cat-unknown" }))
    );
    jest.spyOn(service, "create").mockResolvedValue({} as Transaction);

    await expect(service.autoCreate(baseDto, null, "user-001")).rejects.toThrow(
      UnprocessableEntityException
    );
  });

  it("Zod parse error — AI returns invalid JSON structure, throws UnprocessableEntityException", async () => {
    mockChatCompletionsCreate.mockResolvedValue(
      makeCompletionResponse({ amount: 100 })
    );
    jest.spyOn(service, "create").mockResolvedValue({} as Transaction);

    await expect(service.autoCreate(baseDto, null, "user-001")).rejects.toThrow(
      UnprocessableEntityException
    );
  });
});
