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
  Put,
  ParseArrayPipe,
  BadRequestException,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FindTransactionsQueryDto } from "./dto/find-transactions-query.dto";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService
  ) {}

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
  @Post("batch")
  async createMany(
    @Body(new ParseArrayPipe({ items: CreateTransactionDto }))
    createTransactionDtos: CreateTransactionDto[]
  ) {
    const maxBatchSize = this.configService.get<number>(
      "TRANSACTION_INSERT_MAX_BATCH_SIZE",
      10
    );
    if (createTransactionDtos.length > maxBatchSize) {
      throw new BadRequestException(
        `Batch size exceeds the maximum limit of ${maxBatchSize}`
      );
    }

    return this.transactionsService.createMany(createTransactionDtos);
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

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Req() req: Request,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionsService.update(
      id,
      req.user.userId,
      updateTransactionDto
    );
  }
}
