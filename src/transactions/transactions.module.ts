import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }])
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
