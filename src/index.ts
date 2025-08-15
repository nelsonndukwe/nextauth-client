#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("NextAuth-client")
  .description("CLI to some JavaScript string utilities")
  .version("0.8.0");

program.action((self) => {
  console.log(`Hello world Sir`);
});

program.parse(process.argv);
