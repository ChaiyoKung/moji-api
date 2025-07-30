import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  userId: mongoose.Types.ObjectId | null;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // "income" or "expense"

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  })
  parentId?: mongoose.Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ userId: 1, type: 1 });
