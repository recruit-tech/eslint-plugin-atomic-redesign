import { TSESLint } from "@typescript-eslint/experimental-utils";
import { localize } from "../utils";
import {
  getInitialKeywordContentInfo,
  KeywordContentInfo,
  Options,
  optionsJsonSchema,
  UserOptions,
} from "./mustUseAnyKeywordsUtils";

// settings
const defaultOptions: Options = {
  checkDirectorys: ["./src/components/organisms/*/"],
  checkFilesInDirectory: ["./src/components/organisms/**/*.ts*"],
  excludeFilePatterns: [".*\\.test.*", ".*\\.stories.*"],
  keywords: [
    "fetch",
    "XMLHttpRequest",
    "useSWR",
    "useContext",
    "createContext",
    "useSelector",
    "useStore",
    "ConfirmContainerWindowConsumer",
  ],
};

// rule
let keywordContentInfo: KeywordContentInfo | undefined = undefined;
const ruleName = "must-use-global-state";
export const mustUseGlobalState: TSESLint.RuleModule<typeof ruleName, []> = {
  meta: {
    type: "suggestion",
    docs: {
      category: "Best Practices",
      description: localize({
        en: "Organisms component must have Global States (fetch, useContext, useSWR, useSelector, etc.).",
        ja: "OrganismsコンポーネントはGlobal State（fetch、useContext、useSWR、useSelectorなど）を持つ必要があります。",
      }),
      recommended: "error",
      url: "https://zenn.dev/takepepe/articles/atomic-redesign#organisms",
    },
    messages: {
      [ruleName]: "{{ message }}",
    },
    schema: optionsJsonSchema,
  },
  create: (context) => {
    const userOptionsArray = context.options as [UserOptions?];
    const userOptions = userOptionsArray[0] ? userOptionsArray[0] : {};
    const options: Options = {
      ...defaultOptions,
      ...userOptions,
    };

    if (keywordContentInfo === undefined)
      keywordContentInfo = getInitialKeywordContentInfo(options);

    return {
      Program(node) {
        if (!(keywordContentInfo instanceof KeywordContentInfo)) return;
        const filepath = context.getFilename();
        if (keywordContentInfo.getFileKeywordInfo(filepath) === undefined)
          return;
        keywordContentInfo.setFileKeywordInfo(
          filepath,
          context.getSourceCode().text
        );

        const directory = keywordContentInfo.getDirectoryFromFile(
          context.getFilename()
        );
        if (directory === undefined) return;

        const directoryKeywordInfo =
          keywordContentInfo.getDirectoryKeywordInfo(directory);
        if (directoryKeywordInfo === undefined) return;

        const keywordSet = Array.from(directoryKeywordInfo.values()).flatMap(
          (keywordSet) => Array.from(keywordSet.values())
        );

        if (keywordSet.length === 0)
          context.report({
            node: node.body[0],
            messageId: ruleName,
            data: {
              message: localize({
                en: "Organisms must have Global States (fetch, useContext, useSWR, useSelector, etc.).",
                ja: "OrganismsはGlobal State（fetch、useContext、useSWR、useSelectorなど）を持つ必要があります。",
              }),
            },
          });
      },
    };
  },
};
