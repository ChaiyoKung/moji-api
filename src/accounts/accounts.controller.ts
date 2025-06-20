import { Controller, Post, Body, UseGuards, Get, Req } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { Account } from "./schemas/account.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req) {
    return this.accountsService.findAllByUserId(req.user.userId);
  }
}
