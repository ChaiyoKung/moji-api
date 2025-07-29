import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Req,
  Delete,
  Param,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";
import { Request } from "express";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("ids-by-date")
  async getIdsByDate(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("timezone") timezone: string,
    @Req() req: Request
  ) {
    return this.transactionsService.getIdsByDate({
      startDate,
      endDate,
      timezone,
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
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request) {
    return this.transactionsService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: Request) {
    return this.transactionsService.findOne(id, req.user.userId);
  }
}
