import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  avatarUrl?: string;

  @Prop([
    {
      provider: { type: String, required: true },
      providerId: { type: String, required: true },
      linkedAt: { type: Date, required: true },
    },
  ])
  providers: {
    provider: string;
    providerId: string;
    linkedAt: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
