import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("summary")
  async getSummary(
    @Req() req,
    @Query("type") type: "income" | "expense",
    @Query("date") date: string
  ) {
    return this.analyticsService.getExpenseSummaryByDate(
      req.user.userId,
      type,
      date
    );
  }
}
