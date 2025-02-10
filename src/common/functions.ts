export function isVariableUsed(
  variableName: string,
  sourceCode: string,
  htmlContent: string
): boolean {
  const escapedVariableName = variableName.replace("$", "\\$"); // Escape $

  // Remove all comments from TypeScript code
  const cleanedSourceCode = sourceCode
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments

  // Remove HTML comments (<!-- ... -->)
  const cleanedHtmlContent = htmlContent.replace(/<!--[\s\S]*?-->/g, "");

  // Direct usage in TypeScript
  const regexTs = new RegExp(`\\bthis\\.${escapedVariableName}\\b`, "g");

  // Used inside `.subscribe(this.varName$)`
  const regexSubscribe = new RegExp(
    `\\.subscribe\\s*\\(\\s*this\\.${escapedVariableName}\\s*\\)`,
    "g"
  );

  // Subscription added dynamically (Flexible detection)
  const regexSubscriptionAdd = new RegExp(
    `\\b\\w+\\.add\\s*\\(\\s*this\\.${escapedVariableName}\\s*\\.subscribe\\s*\\(.*?\\)\\s*\\)`,
    "gs"
  );

  // Assignment: `this.varName$ = something`
  const regexAssignment = new RegExp(
    `\\bthis\\.${escapedVariableName}\\s*=\\s*`,
    "g"
  );

  // Detect dynamic ngOnChanges parameter name (handles SimpleChanges, any, or no type)
  const ngOnChangesParamRegex =
    /\bngOnChanges\s*\(\s*(\w+)\s*(?::\s*(?:SimpleChanges|any))?\s*\)/;
  const match = cleanedSourceCode.match(ngOnChangesParamRegex);
  const paramName = match ? match[1] : "changes"; // Default to "changes" if not found

  // Improved regex for detecting variable usage inside ngOnChanges
  const regexNgOnChanges = new RegExp(
    `\\b${paramName}\\s*(?:\\?|!)?\\.?\\[?["']?${escapedVariableName}["']?\\]?\\s*\\.`,
    "g"
  );

  // Used inside HTML (property bindings, event bindings, async pipe, direct interpolation)
  const regexHtml = new RegExp(
    `\\[?\\(?\\b${escapedVariableName}\\b\\)?\\]?`,
    "g"
  );

  // Check for `.subscribe()`, `.next()`, `.pipe()`, `.complete()`, `.unsubscribe()`
  const regexObservableMethods = new RegExp(
    `this\\.${escapedVariableName}\\s*\\.\\s*(subscribe|next|pipe|complete|unsubscribe)\\s*\\(`,
    "g"
  );

  // Combine all checks
  const isUsedInTs =
    regexTs.test(cleanedSourceCode) ||
    regexSubscribe.test(cleanedSourceCode) ||
    regexSubscriptionAdd.test(cleanedSourceCode) ||
    regexAssignment.test(cleanedSourceCode) ||
    regexNgOnChanges.test(cleanedSourceCode) ||
    regexObservableMethods.test(cleanedSourceCode);
  const isUsedInHtml = regexHtml.test(cleanedHtmlContent);

  return isUsedInTs || isUsedInHtml;
}
