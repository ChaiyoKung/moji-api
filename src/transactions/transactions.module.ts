import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { Transaction, TransactionSchema } from "./schemas/transaction.schema";
import { Account, AccountSchema } from "../accounts/schemas/account.schema";
import { ConfigModule } from "@nestjs/config";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [
    ConfigModule,
    CategoriesModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
