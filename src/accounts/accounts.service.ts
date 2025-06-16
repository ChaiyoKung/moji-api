import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Account } from "./schemas/account.schema";
import { CreateAccountDto } from "./dto/create-account.dto";

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const createdAccount = new this.accountModel(createAccountDto);
    return createdAccount.save();
  }

  async findAllByUserId(userId: string): Promise<Account[]> {
    return this.accountModel.find({ userId }).exec();
  }
}
