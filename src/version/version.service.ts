import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "node:path";
import { packageJsonSchema } from "./schemas/packageJson.schema";

@Injectable()
export class VersionService {
  private readonly version: string;

  constructor() {
    const packageJsonPath = join(__dirname, "../../package.json");
    const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
    const packageJson = packageJsonSchema.parse(JSON.parse(packageJsonContent));
    this.version = packageJson.version ?? "unknown";
  }

  getVersion() {
    return {
      version: this.version,
    };
  }
}
