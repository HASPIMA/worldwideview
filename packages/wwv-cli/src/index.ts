import { Command } from "commander";

const program = new Command();

program
  .name("wwv")
  .description("WorldWideView Plugin CLI")
  .version("1.0.0");

program.parse();
