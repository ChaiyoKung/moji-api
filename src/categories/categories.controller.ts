import { Controller, Post, Body, Get, UseGuards, Req } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req: Request) {
    return this.categoriesService.findAllForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("income")
  async getIncome(@Req() req: Request) {
    return this.categoriesService.findByTypeForUser(req.user.userId, "income");
  }

  @UseGuards(JwtAuthGuard)
  @Get("expense")
  async getExpense(@Req() req: Request) {
    return this.categoriesService.findByTypeForUser(req.user.userId, "expense");
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
