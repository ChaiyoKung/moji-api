import { Controller, Post, Body, Req, UseGuards, Get } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("refresh")
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post("google")
  async googleLogin(@Body("idToken") idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @Post("logout")
  async logout(@Body("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Req() req: Request) {
    return this.authService.getProfile(req.user.userId);
  }
}
