import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Transaction } from "../transactions/schemas/transaction.schema";
import { z } from "zod/v4";
import dayjs from "dayjs";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>
  ) {}

  async getSummary(
    userId: string,
    type: "income" | "expense",
    /**
     * Date is in 'YYYY-MM-DD' format
     */
    date: string,
    timezone: string
  ) {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type,
          date: dayjs.tz(date, timezone).utc().toDate(),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          count: 1,
        },
      },
    ]);

    const parsedResult = z
      .array(
        z.object({
          total: z.number(),
          count: z.number(),
        })
      )
      .parse(result);

    if (parsedResult.length === 0) {
      return { type, date, total: 0, count: 0 };
    }

    if (parsedResult.length > 1) {
      throw new NotFoundException(
        "Unexpected result: more than one summary found."
      );
    }

    const { total, count } = parsedResult[0];
    return { type, date, total, count };
  }
}
