import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

type UnusedVariableInfo = {
  className: string;
  variables: string[];
  membersToRemove?: ts.Node[];
};

// Function to analyze a TypeScript file and find unused class variables
function findUnusedClassVariables(filePath: string): UnusedVariableInfo[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest
  );

  const htmlFilePath = filePath.replace('.component.ts', '.component.html');
  const htmlContent = fs.existsSync(htmlFilePath)
    ? fs.readFileSync(htmlFilePath, 'utf-8')
    : '';

  const unusedVariables: UnusedVariableInfo[] = [];

  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isClassDeclaration(node)) {
      const className = node.name?.getText(sourceFile) || 'UnnamedClass';
      const classVariables: string[] = [];
      const constructorVariables: string[] = [];
      const membersToRemove: ts.Node[] = [];

      // Collect class variables and constructor variables
      node.members.forEach((member) => {
        if (
          ts.isPropertyDeclaration(member) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          const variableName = member.name.getText(sourceFile);
          classVariables.push(variableName);

          if (!isVariableUsed(variableName, sourceCode, htmlContent)) {
            membersToRemove.push(member);
          }
        }

        if (ts.isConstructorDeclaration(member)) {
          member.parameters.forEach((param) => {
            if (
              ts.isParameter(param) &&
              param.name &&
              ts.isIdentifier(param.name)
            ) {
              const variableName = param.name.getText(sourceFile);
              constructorVariables.push(variableName);

              if (!isVariableUsed(variableName, sourceCode, htmlContent)) {
                membersToRemove.push(param);
              }
            }
          });
        }
      });

      // Add unused variables to the list
      if (membersToRemove.length > 0) {
        unusedVariables.push({
          className,
          variables: [...classVariables, ...constructorVariables],
          membersToRemove,
        });
      }
    }

    ts.forEachChild(node, visit); // Recursively visit child nodes
  });

  return unusedVariables;
}

// Function to check if a variable is used in the source or HTML file
function isVariableUsed(
  variableName: string,
  sourceCode: string,
  htmlContent: string
): boolean {
  const escapedVariableName = variableName.replace('$', '\\$'); // Escape the dollar sign

  // Match this.variableName$ in TypeScript code (direct usage)
  const regexTs = new RegExp(`\\bthis\\.${escapedVariableName}\\b`, 'g'); // Match this.variableName$

  // Match subscribe(this.variableName$) in TypeScript code (for observables)
  const regexSubscribe = new RegExp(
    `\\.subscribe\\s*\\(\\s*this\\.${escapedVariableName}\\s*\\)`,
    'g'
  );

  // Match this.subscription.add(this.variableName$) for observable subscriptions across multiple lines
  const regexSubscriptionAdd = new RegExp(
    `this\\.subscription\\.add\\s*\\(\\s*this\\.${escapedVariableName}\\s*\\.subscribe\\s*\\(.*\\)\\s*\\)`,
    'gs' // 'g' for global and 's' for dotall to handle newlines
  );

  // Match variableName$ in HTML template (via async pipe or direct usage)
  const regexHtml = new RegExp(`\\b${escapedVariableName}\\b`, 'g'); // Match variableName$ in HTML

  // Check if the variable is assigned in the TypeScript file (e.g., this.hasDFOLicense$ = this.store.select())
  const regexAssignment = new RegExp(
    `\\bthis\\.${escapedVariableName}\\s*=\\s*`,
    'g'
  );

  // Check usage in TypeScript code (direct or in subscribe or assignment)
  const isUsedInTs =
    regexTs.test(sourceCode) ||
    regexSubscribe.test(sourceCode) ||
    regexSubscriptionAdd.test(sourceCode) ||
    regexAssignment.test(sourceCode);

  // Check usage in HTML template (via async pipe or direct usage)
  const isUsedInHtml = regexHtml.test(htmlContent);

  return isUsedInTs || isUsedInHtml;
}

// Function to remove unused class members
function removeUnusedMembers(filePath: string, membersToRemove: ts.Node[]) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest
  );

  const sortedMembers = membersToRemove
    .map((member) => ({
      start: member.getStart(sourceFile),
      end: member.getEnd(),
    }))
    .sort((a, b) => b.start - a.start);

  let modifiedCode = sourceCode;

  sortedMembers.forEach(({ start, end }) => {
    modifiedCode = modifiedCode.slice(0, start) + modifiedCode.slice(end);
  });

  fs.writeFileSync(filePath, modifiedCode, 'utf-8');
  console.log(chalk.dim(`Updated file: ${filePath}`));
}

// Function to process all `.component.ts` files in a directory
export function processDirectoryForRemoveOrphans(dirPath: string) {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectoryForRemoveOrphans(filePath); // Recursive call for subdirectories
    } else if (filePath.endsWith('.component.ts')) {
      try {
        const unusedClassVariables = findUnusedClassVariables(filePath);
        if (unusedClassVariables.length > 0) {
          unusedClassVariables.forEach(({ className, membersToRemove }) => {
            console.log(chalk.bgGreen(`Processing class: ${className} in file: ${filePath}`));
            if (membersToRemove && membersToRemove.length > 0) {
              removeUnusedMembers(filePath, membersToRemove);
            }
          });
        }
      } catch (error: any) {
        console.error(chalk.red(`Error processing ${filePath}:`, error.message));
      }
    }
  });
}