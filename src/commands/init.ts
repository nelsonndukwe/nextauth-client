import fs from "fs";
import path from "path";
import { Command } from "commander";
import { scaffoldAppRouter, scaffoldPagesRouter } from "../helpers";
import { askSetupQuestions } from "../inquiery";

export default new Command("init")
  .description("Initialize NextAuth in your Next.js project")
  .action(async () => {

    try {
      const answers = await askSetupQuestions();

      const options = {
        app: answers.routerType === "App Router",
        pages: answers.routerType === "Pages Router",
        src: answers.isSrc,
        providers: answers.providers,
        storage: answers.storage,
      };

      // Scaffold files
      if (options.app) {
        scaffoldAppRouter(options.src, options.providers, options.storage);
      }
      if (options.pages) {
        scaffoldPagesRouter(options.providers, options.storage);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "isTtyError" in error && (error as any).isTtyError) {
        console.error("Interactive mode not supported in this terminal.");
      } else {
        console.error(error);
      }
    }
  });
