import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, required: true, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  balance?: number;

  @Prop({ required: true })
  currency: string;

  @Prop()
  icon?: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
