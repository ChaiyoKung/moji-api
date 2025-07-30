import { Injectable, NotFoundException } from "@nestjs/common";
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
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      // Convert date string and timezone to Date object
      const { date, timezone, ...rest } = createTransactionDto;
      const dateObj = dayjs.tz(date, timezone).utc().toDate();

      // Create transaction
      const createdTransaction = new this.transactionModel({
        ...rest,
        date: dateObj,
      });
      const savedTransaction = await createdTransaction.save({ session });

      // Update account balance
      const { accountId, amount, type } = createTransactionDto;
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

      await session.commitTransaction();

      return savedTransaction;
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
}
