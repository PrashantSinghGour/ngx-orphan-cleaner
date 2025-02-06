#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import {
  processDirectoryForFindOrphans,
  processDirectoryForRemoveOrphans,
} from '../lib';

// Ensure the script is executed with proper arguments
const args = process.argv.slice(2);

// Use the current working directory if no directory path is provided
let dirPath = args[1] ? path.resolve(args[1]) : process.cwd(); // Default to current directory if no directory path is provided

if (args.length < 1 || (args[0] !== 'find' && args[0] !== 'remove')) {
  console.error(
    chalk.red('Usage: unused-members <find|remove> [<directory-path>]')
  );
  process.exit(1);
}

const command = args[0];

// Validate directory path
if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
  console.error(
    chalk.red(
      'Error: Invalid directory path. Please provide a valid folder containing .component.ts files.'
    )
  );
  process.exit(1);
}

if (command === 'find') {
  console.log(chalk.green(`🔍 Scanning for unused members in: ${dirPath}`));
  processDirectoryForFindOrphans(dirPath);
} else if (command === 'remove') {
  console.log(chalk.green(`🗑 Removing unused members from: ${dirPath}`));
  processDirectoryForRemoveOrphans(dirPath);
} else {
  console.error(chalk.red("Error: Invalid command. Use 'find' or 'remove'."));
  process.exit(1);
}
