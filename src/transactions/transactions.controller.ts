import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./schemas/transaction.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }
}
