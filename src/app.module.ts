import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        "mongodb://root:example@localhost:27017/moji?authSource=admin"
    ),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
