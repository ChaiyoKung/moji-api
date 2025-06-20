import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Transaction } from "./schemas/transaction.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";
import { Request } from "express";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("ids-by-date")
  async getIdsByRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Req() req: Request
  ) {
    return this.transactionsService.getIdsByRange({
      startDate,
      endDate,
      userId: req.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: FindTransactionsQueryDto, @Req() req: Request) {
    return this.transactionsService.findAll({
      ...query,
      userId: req.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }
}
