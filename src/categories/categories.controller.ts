import { Controller, Post, Body, Get, UseGuards, Req } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./schemas/category.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req) {
    return this.categoriesService.findAllForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("income")
  async getIncome(@Req() req) {
    return this.categoriesService.findIncomeForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("expense")
  async getExpense(@Req() req) {
    return this.categoriesService.findExpenseForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }
}
