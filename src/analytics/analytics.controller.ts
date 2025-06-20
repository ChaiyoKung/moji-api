import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";

@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("summary")
  async getSummary(
    @Req() req: Request,
    @Query("type") type: "income" | "expense",
    @Query("date") date: string
  ) {
    return this.analyticsService.getSummary(req.user.userId, type, date);
  }
}
