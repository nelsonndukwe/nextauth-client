#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("NextAuth-client")
  .description("CLI to some JavaScript string utilities")
  .version("0.8.0");

program
  .command("split")
  .description("Split a string into substrings and display as an array")
  .argument("<string>", "string to split")
  .option("--first", "display just the first substring")
  .option("-s, --separator <char>", "separator character", ",")
  .action(
    (
      str: string,
      options: {
        first?: boolean;
        separator?: string;
      }
    ) => {
      const limit = options.first ? 1 : undefined;

      if (options.first && options.separator && options.separator?.length > 1) {
        console.error(
          "Error: --first option can only be used with a single character separator."
        );
        process.exit(1);
      } else if (options.separator && options.separator.length > 1) {
        console.error(
          "Error: --separator option can only be used with a single character."
        );
        process.exit(1);
      } else {
        const substrings = str.split(options.separator || ",", limit);
        console.log(substrings);
      }
    }
  );

program.parse(process.argv);
