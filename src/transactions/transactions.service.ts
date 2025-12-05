import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, {
  FilterQuery,
  Model,
  PipelineStage,
  QuerySelector,
  RootFilterQuery,
} from "mongoose";
import { Transaction } from "./schemas/transaction.schema";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";
import { Account } from "../accounts/schemas/account.schema";
import { CategoryDocument } from "../categories/schemas/category.schema";
import dayjs from "dayjs";

export interface FindTransactionsQueryWithUserId
  extends FindTransactionsQueryDto {
  userId: string;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>
  ) {}

  private async insertTransactionWithBalanceUpdate(
    dto: CreateTransactionDto,
    session: mongoose.ClientSession
  ): Promise<Transaction> {
    // Convert date string and timezone to Date object
    const { date, timezone, status = "confirmed", ...rest } = dto;
    const dateObj = dayjs.tz(date, timezone).utc().toDate();

    // Create transaction
    const createdTransaction = new this.transactionModel({
      ...rest,
      date: dateObj,
      status,
    });
    const savedTransaction = await createdTransaction.save({ session });

    // Only update account balance if status is "confirmed"
    if (status === "confirmed") {
      const { accountId, amount, type } = dto;
      if (!amount) {
        throw new BadRequestException(
          "Amount must be provided for confirmed transactions"
        );
      }

      const account = await this.accountModel
        .findById(accountId)
        .session(session);

      if (!account) {
        throw new NotFoundException("Account not found");
      }

      let newBalance = account.balance || 0;
      if (type === "income") {
        newBalance += amount;
      } else if (type === "expense") {
        newBalance -= amount;
      }

      account.balance = newBalance;
      await account.save({ session });
    }

    return savedTransaction;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      const savedTransaction = await this.insertTransactionWithBalanceUpdate(
        createTransactionDto,
        session
      );

      await session.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async createMany(createTransactionDtos: CreateTransactionDto[]) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    const results: Transaction[] = [];
    try {
      for (const dto of createTransactionDtos) {
        const savedTransaction = await this.insertTransactionWithBalanceUpdate(
          dto,
          session
        );
        results.push(savedTransaction);
      }

      await session.commitTransaction();

      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getIdsByDate(query: FindTransactionsQueryWithUserId) {
    const { startDate, endDate, timezone, userId } = query;

    const match: FilterQuery<Transaction> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate || endDate) {
      const dateFilter: QuerySelector<Date> = {};
      if (startDate)
        dateFilter.$gte = dayjs.tz(startDate, timezone).utc().toDate();
      if (endDate) dateFilter.$lte = dayjs.tz(endDate, timezone).utc().toDate();
      match.date = dateFilter;
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $project: {
          formattedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone,
            },
          },
          _id: 1,
        },
      },
      {
        $group: {
          _id: "$formattedDate",
          ids: { $push: { $toString: "$_id" } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    return this.transactionModel.aggregate(pipeline).exec();
  }

  async findAll(query: FindTransactionsQueryWithUserId) {
    const { startDate, endDate, timezone, userId } = query;

    const filter: RootFilterQuery<Transaction> = { userId };

    if (startDate || endDate) {
      const dateFilter: QuerySelector<Date> = {};
      if (startDate)
        dateFilter.$gte = dayjs.tz(startDate, timezone).utc().toDate();
      if (endDate) dateFilter.$lte = dayjs.tz(endDate, timezone).utc().toDate();
      filter.date = dateFilter;
    }

    return this.transactionModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate<{ categoryId: CategoryDocument }>("categoryId")
      .exec();
  }

  async remove(id: string, userId: string) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      // Find the transaction to be deleted
      const transaction = await this.transactionModel
        .findOne({ _id: id, userId })
        .session(session);

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      // Only reverse balance if transaction is confirmed
      const status = transaction.status || "confirmed";
      if (status === "confirmed") {
        if (!transaction.amount) {
          throw new BadRequestException(
            "Transaction amount is missing, cannot adjust balance"
          );
        }

        // Get the associated account
        const account = await this.accountModel
          .findById(transaction.accountId)
          .session(session);

        if (!account) {
          throw new NotFoundException("Associated account not found");
        }

        // Reverse the transaction effect on account balance
        let newBalance = account.balance || 0;
        if (transaction.type === "income") {
          newBalance -= transaction.amount; // Subtract income
        } else if (transaction.type === "expense") {
          newBalance += transaction.amount; // Add back expense
        }

        account.balance = newBalance;
        await account.save({ session });
      }

      // Delete the transaction
      await this.transactionModel
        .deleteOne({ _id: id, userId })
        .session(session);

      await session.commitTransaction();

      return { message: "Transaction deleted successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionModel
      .findOne({ _id: id, userId })
      .populate<{ categoryId: CategoryDocument }>("categoryId")
      .exec();

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      const transaction = await this.transactionModel
        .findOne({ _id: id, userId })
        .session(session);

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      const account = await this.accountModel
        .findById(transaction.accountId)
        .session(session);

      if (!account) {
        throw new NotFoundException("Associated account not found");
      }

      const txnStatus = transaction.status || "confirmed";
      const dtoStatus = dto.status || "confirmed";
      // If status changes from draft to confirmed, apply balance
      if (txnStatus === "draft" && dtoStatus === "confirmed") {
        this.logger.log(
          `Applying balance for transaction ${id} as it is confirmed`
        );

        if (!dto.amount) {
          throw new BadRequestException(
            "Amount must be provided when confirming a transaction"
          );
        }

        if (transaction.type === "income") {
          account.balance = (account.balance || 0) + dto.amount;
        } else if (transaction.type === "expense") {
          account.balance = (account.balance || 0) - dto.amount;
        }
        await account.save({ session });
      }
      // If status is confirmed and amount changes, adjust balance
      else if (
        txnStatus === "confirmed" &&
        dtoStatus === "confirmed" &&
        transaction.amount !== dto.amount
      ) {
        this.logger.log(
          `Adjusting balance for transaction ${id} due to amount change from ${transaction.amount} to ${dto.amount}`
        );

        if (!dto.amount) {
          throw new BadRequestException(
            "Amount must be provided for confirmed transactions"
          );
        }

        if (!transaction.amount) {
          throw new BadRequestException(
            "Original transaction amount is missing, cannot adjust balance"
          );
        }

        if (transaction.type === "income") {
          account.balance =
            (account.balance || 0) - transaction.amount + dto.amount;
        } else if (transaction.type === "expense") {
          account.balance =
            (account.balance || 0) + transaction.amount - dto.amount;
        }
        await account.save({ session });
      }

      // Update transaction fields
      transaction.categoryId = new mongoose.Types.ObjectId(dto.categoryId);
      transaction.amount = dto.amount;
      transaction.note = dto.note;
      transaction.status = dtoStatus;

      await transaction.save({ session });

      await session.commitTransaction();

      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
