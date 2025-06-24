import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, RootFilterQuery } from "mongoose";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(filter: RootFilterQuery<User>) {
    return this.userModel.findOne(filter).exec();
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    if (!createUserDto.password) {
      throw new ConflictException("Password is required for registration");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userToSave = {
      ...createUserDto,
      password: hashedPassword,
    };
    const createdUser = new this.userModel(userToSave);
    return createdUser.save();
  }

  async createGoogleUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      return existingUser;
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async updateRefreshTokenById(userId: string, refreshToken: string) {
    return this.userModel
      .updateOne(
        { _id: userId },
        {
          $push: {
            refreshTokens: {
              $each: [refreshToken],
              $slice: -5,
            },
          },
        }
      )
      .exec();
  }
}
