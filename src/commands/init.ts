import fs from "fs";
import path from "path";
import { Command } from "commander";
import { scaffoldAppRouter, scaffoldPagesRouter } from "../helpers";
import { askSetupQuestions } from "../inquiery";

export default new Command("init")
  .description("Initialize NextAuth in your Next.js project")
  .action(async () => {
    const envPath = path.resolve(".env");

    try {
      const answers = await askSetupQuestions();

      const options = {
        app: answers.routerType === "App Router",
        pages: answers.routerType === "Pages Router",
        src: answers.isSrc,
        providers: answers.providers,
        storage: answers.storage,
      };

      // Base AUTH_SECRET
      fs.writeFileSync(
        envPath,
        `AUTH_SECRET=${Math.random().toString(36).substring(2, 15)}\n`
      );

      // Storage variables
      if (options.storage) {
        fs.writeFileSync(envPath, `UPSTASH_REDIS_URL=your-upstash-url\n`, {
          flag: "a",
        });
        fs.writeFileSync(envPath, `UPSTASH_REDIS_TOKEN=your-upstash-token\n`, {
          flag: "a",
        });
      }

      // Provider credentials
      options.providers.forEach((provider: string) => {
        const upper = provider.toUpperCase();
        fs.writeFileSync(
          envPath,
          `AUTH_${upper}_ID=dummy-${Math.random()
            .toString(36)
            .substring(2, 15)}\n` +
            `AUTH_${upper}_SECRET=dummy-${Math.random()
              .toString(36)
              .substring(2, 15)}\n`,
          { flag: "a" }
        );
      });

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
