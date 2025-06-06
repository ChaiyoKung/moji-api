import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Account' })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // "income" or "expense"

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  date: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
