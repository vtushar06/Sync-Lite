import type { DeviceType } from "@prisma/client";
import { HttpError } from "../../utils/httpError.js";
import { AppleWatchJsonParser } from "./appleWatchJsonParser.js";
import { CsvParser } from "./csvParser.js";
import { FitbitJsonParser } from "./fitbitJsonParser.js";
import type { DeviceParserStrategy, UploadFormat, UploadPayload } from "./types.js";

export class ParserFactory {
  private readonly strategies: DeviceParserStrategy[];

  constructor(strategies?: DeviceParserStrategy[]) {
    this.strategies =
      strategies ?? [new AppleWatchJsonParser(), new FitbitJsonParser(), new CsvParser()];
  }

  parse(deviceType: DeviceType, format: UploadFormat, payload: UploadPayload) {
    const strategy = this.strategies.find((candidate) => candidate.supports(deviceType, format));

    if (!strategy) {
      throw new HttpError(400, `No parser found for deviceType=${deviceType} format=${format}`);
    }

    return strategy.parse(payload);
  }
}
