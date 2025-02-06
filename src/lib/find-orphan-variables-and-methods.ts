import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

// Function to analyze a TypeScript file and find unused class variables and methods
function findUnusedClassVariablesAndMethods(filePath: string) {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest
  );

  const isComponent = filePath.endsWith('.component.ts');
  const htmlFilePath = isComponent
    ? filePath.replace('.component.ts', '.component.html')
    : null;
  const htmlContent =
    htmlFilePath && fs.existsSync(htmlFilePath)
      ? fs.readFileSync(htmlFilePath, 'utf-8')
      : '';

  const unusedItems: {
    className: string;
    variables: string[];
    methods: string[];
  }[] = [];

  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText(sourceFile);
      const classVariables: string[] = [];
      const constructorVariables: string[] = [];
      const classMethods: string[] = [];

      // Collect class variables, constructor variables, and methods
      node.members.forEach((member) => {
        if (
          ts.isPropertyDeclaration(member) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          const variableName = member.name.getText(sourceFile);
          classVariables.push(variableName);
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
            }
          });
        }

        if (
          ts.isMethodDeclaration(member) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          const methodName = member.name.getText(sourceFile);
          classMethods.push(methodName);
        }
      });

      // Check usage of class variables and constructor variables
      const unusedVariables = classVariables.filter((variable) => {
        return (
          !isVariableUsed(variable, sourceCode, htmlContent) &&
          !constructorVariables.includes(variable) // Exclude variables already declared in the constructor
        );
      });

      // Check constructor variables specifically
      const unusedConstructorVars = constructorVariables.filter((variable) => {
        return !isVariableUsed(variable, sourceCode, htmlContent);
      });

      // Check usage of methods
      const unusedMethods = classMethods.filter((method) => {
        return !isMethodUsed(method, sourceCode, htmlContent);
      });

      if (
        unusedVariables.length > 0 ||
        unusedConstructorVars.length > 0 ||
        unusedMethods.length > 0
      ) {
        unusedItems.push({
          className,
          variables: [...unusedVariables, ...unusedConstructorVars],
          methods: unusedMethods,
        });
      }
    }

    ts.forEachChild(node, visit); // Recursively visit child nodes
  });

  return unusedItems;
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

// Function to check if a method is used in the source or HTML file
function isMethodUsed(
  methodName: string,
  sourceCode: string,
  htmlContent: string
): boolean {
  const escapedMethodName = methodName.replace('$', '\\$'); // Escape the dollar sign

  // List of all lifecycle hooks to ignore
  const lifecycleHooks = [
    'ngOnChanges',
    'ngOnInit',
    'ngDoCheck',
    'ngAfterContentInit',
    'ngAfterContentChecked',
    'ngAfterViewInit',
    'ngAfterViewChecked',
    'ngOnDestroy',
  ];

  // Skip lifecycle hooks
  if (lifecycleHooks.includes(methodName)) {
    return true; // Always considered as used since we are ignoring them
  }

  // Match this.methodName() in TypeScript code (direct method call)
  const regexTs = new RegExp(`\\bthis\\.${escapedMethodName}\\b\\(`, 'g'); // Match this.methodName()

  // Match methodName() in HTML template (direct usage)
  const regexHtml = new RegExp(`\\b${escapedMethodName}\\b\\(`, 'g'); // Match methodName() in HTML

  // Check usage in TypeScript code (direct method call)
  const isUsedInTs = regexTs.test(sourceCode);

  // Check usage in HTML template (direct usage)
  const isUsedInHtml = regexHtml.test(htmlContent);

  return isUsedInTs || isUsedInHtml;
}

// Function to process all TypeScript files in a directory
export function processDirectoryForFindOrphans(dirPath: string) {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectoryForFindOrphans(filePath); // Recursive call for subdirectories
    } else if (filePath.endsWith('.component.ts')) {
      try {
        const unusedClassVariablesAndMethods =
          findUnusedClassVariablesAndMethods(filePath);
        if (unusedClassVariablesAndMethods.length > 0) {
          console.log(chalk.dim(`File: ${filePath}`));
          unusedClassVariablesAndMethods.forEach(
            ({ className, variables, methods }) => {
              console.log(chalk.bgCyan(`  Class: ${className}`));
              if (variables.length > 0) {
                console.log(chalk.yellow(`    Unused Variables: ${variables.join(', ')}`));
              }
              if (methods.length > 0) {
                console.log(chalk.yellow(`    Unused Methods: ${methods.join(', ')}`));
              }
            }
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error processing ${filePath}:`, error.message));
      }
    }
  });
}