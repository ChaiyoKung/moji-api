import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    pass: string
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findOne({ email: username });
    if (!user) {
      return null;
    }

    const isPasswordMatch = await bcrypt.compare(pass, user.password);
    if (isPasswordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  login(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload = { username: user._doc.email, sub: user._doc._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
