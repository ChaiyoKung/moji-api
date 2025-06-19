import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on("finish", () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(`[${method}] ${originalUrl} ${statusCode} (${ms}ms)`);
    });

    next();
  }
}
