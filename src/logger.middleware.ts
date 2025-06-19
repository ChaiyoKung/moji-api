import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on("finish", () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      // Simple log format: [METHOD] URL STATUS (ms ms)
      console.log(`[${method}] ${originalUrl} ${statusCode} (${ms}ms)`);
    });

    next();
  }
}
