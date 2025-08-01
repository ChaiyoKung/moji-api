import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./schemas/category.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAllForUser(userId: string) {
    return this.categoryModel
      .find({ $or: [{ userId: null }, { userId }] })
      .sort({ _id: 1 })
      .exec();
  }

  async findByTypeForUser(userId: string, type: "income" | "expense") {
    return this.categoryModel
      .find({ $or: [{ userId: null }, { userId }], type })
      .sort({ _id: 1 })
      .exec();
  }
}
