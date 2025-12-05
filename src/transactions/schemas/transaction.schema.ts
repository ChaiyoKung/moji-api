import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" })
  userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account",
  })
  accountId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  type: string; // "income" or "expense"

  @Prop()
  amount?: number;

  @Prop({ required: true })
  currency: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: String, default: "confirmed" })
  status?: "draft" | "confirmed";
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
