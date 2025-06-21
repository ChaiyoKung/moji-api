import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
} from "@nestjs/common";
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
  @Get(":type")
  async getByType(
    @Param("type") type: "income" | "expense",
    @Req() req: Request
  ) {
    return this.categoriesService.findByTypeForUser(req.user.userId, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
