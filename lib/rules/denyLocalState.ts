import { TSESLint } from "@typescript-eslint/experimental-utils";
import { localize } from "../utils";
import { makeCreateHandler, optionsJsonSchema } from "./denyFuncNameUtils";

// rule
const ruleName = "deny-local-state";
export const denyLocalState: TSESLint.RuleModule<typeof ruleName, []> = {
  meta: {
    type: "suggestion",
    docs: {
      category: "Best Practices",
      description: localize({
        en: "Atoms components should not have Local States (setState, useState, useReducer, etc.).",
        ja: "AtomsコンポーネントはLocal State（setState、useState、useReducerなど）を持つべきではありません。",
      }),
      recommended: "error",
      url: "https://zenn.dev/takepepe/articles/atomic-redesign#atoms",
    },
    messages: {
      [ruleName]: "{{ message }}",
    },
    schema: optionsJsonSchema,
  },
  create: makeCreateHandler<typeof ruleName>(
    {
      includeSourceFilePatterns: [".*\\/atoms\\/.*\\.tsx"],
      excludeSourceFilePatterns: [".*\\.test.*", ".*\\.stories.*"],
      denyFunctionNames: ["setState", "useState", "useReducer"],
    },
    (node, context, denyedFunctionName) => {
      context.report({
        node,
        messageId: ruleName,
        data: {
          message: localize({
            en: `Atoms cannot use ${denyedFunctionName} (Local State).`,
            ja: `Atomsで${denyedFunctionName}（Local State）は使えません。`,
          }),
        },
      });
    }
  ),
};
