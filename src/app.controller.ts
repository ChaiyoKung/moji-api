import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { LocalAuthGuard } from "./auth/local-auth.guard";
import { AuthService } from "./auth/auth.service";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { Request } from "express";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post("auth/login")
  login(@Req() req: { user: { accessToken: string } }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    console.log("User profile accessed:", req.user);
    return req.user;
  }
}
