import { TSESLint } from "@typescript-eslint/experimental-utils";
import { CallExpression } from "@typescript-eslint/types/dist/ast-spec";
import { JSONSchema4 } from "json-schema";
import { testString } from "../utils";

export type Options = {
  includeSourceFilePatterns: string[];
  excludeSourceFilePatterns: string[];
  denyFunctionNames: string[];
};
export type UserOptions = {
  includeSourceFilePatterns?: Options["includeSourceFilePatterns"];
  excludeSourceFilePatterns?: Options["excludeSourceFilePatterns"];
  denyFunctionNames?: Options["denyFunctionNames"];
};

export const optionsJsonSchema: JSONSchema4 = [
  {
    type: "object",
    properties: {
      includeSourceFilePatterns: {
        type: "array",
        items: {
          type: "string",
        },
      },
      excludeSourceFilePatterns: {
        type: "array",
        items: {
          type: "string",
        },
      },
      denyFunctionNames: { type: "string" },
    },
    additionalProperties: false,
  },
];

export const getFunctionName = (node: CallExpression): string | undefined => {
  const callee = node.callee;
  switch (callee.type) {
    case "Identifier":
      return callee.name;
    case "MemberExpression":
      switch (callee.property.type) {
        case "Identifier":
          return callee.property.name;
      }
      break;
  }
};

export const makeCreateHandler = <RULE_NAME extends string>(
  defaultOptions: Options,
  denyCallback: (
    node: CallExpression,
    context: Readonly<TSESLint.RuleContext<RULE_NAME, []>>,
    denyedFunctionName: string,
    includedPattern: string
  ) => void
) => (context: Readonly<TSESLint.RuleContext<RULE_NAME, []>>) => {
  const userOptionsArray = context.options as [UserOptions?];
  const userOptions = userOptionsArray[0] ? userOptionsArray[0] : {};
  const options: Options = {
    ...defaultOptions,
    ...userOptions,
  };

  const lintingFilePath = context.getFilename();
  const includedPattern = options.includeSourceFilePatterns.find((pattern) =>
    testString(lintingFilePath, pattern)
  );
  const isExcludeFile = options.excludeSourceFilePatterns.some((x) =>
    testString(lintingFilePath, x)
  );

  return {
    CallExpression(node: CallExpression) {
      if (!includedPattern || isExcludeFile) return;

      const functionName = getFunctionName(node);
      const denyedFunctionName = options.denyFunctionNames.find(
        (x) => x === functionName
      );

      if (denyedFunctionName)
        denyCallback(node, context, denyedFunctionName, includedPattern);
    },
  };
};
