import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QuerySelector, RootFilterQuery } from "mongoose";
import { Transaction } from "./schemas/transaction.schema";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";
import { Account } from "../accounts/schemas/account.schema";

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

  async create(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      // Create transaction
      const createdTransaction = new this.transactionModel(
        createTransactionDto
      );
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

  async findAll(
    query: FindTransactionsQueryWithUserId
  ): Promise<Transaction[]> {
    const { startDate, endDate, userId } = query;

    const filter: RootFilterQuery<Transaction> = { userId };

    if (startDate || endDate) {
      const dateFilter: QuerySelector<Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      filter.date = dateFilter;
    }

    return this.transactionModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .exec();
  }
}
