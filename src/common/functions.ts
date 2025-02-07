export function isVariableUsed(
  variableName: string,
  sourceCode: string,
  htmlContent: string
): boolean {
  const escapedVariableName = variableName.replace("$", "\\$"); // Escape $

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

  // Used inside `ngOnChanges(changes)`
  const regexNgOnChanges = new RegExp(
    `\\bchanges\\.${escapedVariableName}\\.currentValue\\b`,
    "g"
  );

  // Used inside HTML (property bindings, event bindings, async pipe, direct interpolation)
  const regexHtml = new RegExp(
    `\\[?\\(?\\b${escapedVariableName}\\b\\)?\\]?`,
    "g"
  );

  // 7 Check for `.subscribe()`, `.next()`, `.pipe()`, `.complete()`, `.unsubscribe()`
  const regexObservableMethods = new RegExp(
    `this\\.${escapedVariableName}\\s*\\.\\s*(subscribe|next|pipe|complete|unsubscribe)\\s*\\(`,
    "g"
  );

  // Combine all checks
  const isUsedInTs =
    regexTs.test(sourceCode) ||
    regexSubscribe.test(sourceCode) ||
    regexSubscriptionAdd.test(sourceCode) ||
    regexAssignment.test(sourceCode) ||
    regexNgOnChanges.test(sourceCode) ||
    regexObservableMethods.test(sourceCode);

  const isUsedInHtml = regexHtml.test(htmlContent);

  return isUsedInTs || isUsedInHtml;
}
