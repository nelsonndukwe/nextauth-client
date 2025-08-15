#!/usr/bin/env node
import { Command } from "commander";
import init from "./commands/init";

const program = new Command();

program
  .name("NextAuth-client")
  .description("CLI to some JavaScript string utilities")
  .version("0.8.0");

  program.addCommand(init);

program.parse(process.argv);
