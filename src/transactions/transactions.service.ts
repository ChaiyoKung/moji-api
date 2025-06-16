import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QuerySelector, RootFilterQuery } from "mongoose";
import { Transaction } from "./schemas/transaction.schema";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";

export interface FindTransactionsQueryWithUserId
  extends FindTransactionsQueryDto {
  userId: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    const createdTransaction = new this.transactionModel(createTransactionDto);
    return createdTransaction.save();
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
