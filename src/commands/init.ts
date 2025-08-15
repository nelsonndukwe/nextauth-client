import path from "path";
import { Command } from "commander";
import { scaffoldAppRouter, scaffoldPagesRouter } from "../helpers";
import { askSetupQuestions } from "../inquiery";

export default new Command("init")
  .description("Initialize NextAuth in your Next.js project")
  .action(() => {
    const cwd = process.cwd();
    const envPath = path.join(cwd, ".env.local");
    askSetupQuestions()
      .then((answers) => {
        const options = {
          app: answers.routerType === "App Router",
          pages: answers.routerType === "Pages Router",
          src: answers.isSrc,
          providers: answers.providers,
          storage: answers.storage,
        };
        if (options.app)
          scaffoldAppRouter(options.src, options.providers, options.storage);
        if (options.pages)
          scaffoldPagesRouter(options.providers, options.storage);
      })
      .catch((error) => {
        if (error.isTtyError) {
          console.log(`error`, error);
        } else {
          // Something else went wrong
        }
      });
  });
