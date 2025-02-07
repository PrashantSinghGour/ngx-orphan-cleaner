#!/usr/bin/env node
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { processDirectoryForFindOrphans, processDirectoryForRemoveOrphans } from "../lib/index.js";


// Ensure the script is executed with proper arguments
const args = process.argv.slice(2);

// Function to display help message
function showHelp() {
  console.log(
    chalk.blueBright(`
Usage: unused-members <command> [options]

Commands:
  find <directory-path>     Find unused class members in Angular components.
  remove <directory-path>   Remove unused class members from Angular components.

Options:
  --help                    Show this help message and exit.

Examples:
  unused-members find ./src/app/components
  unused-members remove ./src/app/components
  unused-members --help
  `)
  );
}

// If --help flag is provided, display help and exit
if (args.includes("--help") || args.length === 0) {
  showHelp();
  process.exit(0);
}

const command = args[0];
const dirPath = args[1] ? path.resolve(args[1]) : process.cwd(); // Default to current directory if not provided

// Validate directory path
if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
  console.error(
    chalk.red(
      "Error: Invalid directory path. Please provide a valid folder containing .component.ts files."
    )
  );
  process.exit(1);
}

if (command === "find") {
  console.log(chalk.green(`🔍 Scanning for unused members in: ${dirPath}`));
  processDirectoryForFindOrphans(dirPath);
} else if (command === "remove") {
  console.log(chalk.green(`🗑 Removing unused members from: ${dirPath}`));
  processDirectoryForRemoveOrphans(dirPath);
} else {
  console.error(
    chalk.red("Error: Invalid command. Use 'find', 'remove', or '--help'.")
  );
  showHelp();
  process.exit(1);
}
