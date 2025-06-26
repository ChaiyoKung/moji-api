import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("refresh")
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("google")
  async googleLogin(@Body("idToken") idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @Body("refreshToken") refreshToken: string
  ) {
    return this.authService.logout(req.user.userId, refreshToken);
  }
}
