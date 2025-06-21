import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
