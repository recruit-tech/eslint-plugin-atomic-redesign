import { TSESLint } from "@typescript-eslint/experimental-utils";
import { localize, testString } from "../utils";

// types
type Options = {
  includeSourceFilePatterns: {
    atoms: string;
    molecules: string;
    organisms: string;
    templates: string;
  };
  excludeSourceFilePatterns: string[];
  importPatterns: {
    atoms: string;
    molecules: string;
    organisms: string;
    templates: string;
  };
};
type UserOptions = {
  includeSourceFilePatterns?: Partial<Options["includeSourceFilePatterns"]>;
  excludeSourceFilePatterns?: Options["excludeSourceFilePatterns"];
  importPatterns?: Partial<Options["importPatterns"]>;
};

// settings
const defaultOptions: Options = {
  includeSourceFilePatterns: {
    atoms: ".*\\/atoms\\/.*\\.tsx",
    molecules: ".*\\/molecules\\/.*\\.tsx",
    organisms: ".*\\/organisms\\/.*\\.tsx",
    templates: ".*\\/templates\\/.*\\.tsx",
  },
  excludeSourceFilePatterns: [".*\\.test.*", ".*\\.stories.*"],
  importPatterns: {
    atoms: ".*\\/atoms\\/.*",
    molecules: ".*\\/molecules\\/.*",
    organisms: ".*\\/organisms\\/.*",
    templates: ".*\\/templates\\/.*",
  },
};

// rule
export const importDependencies: TSESLint.RuleModule<
  "import-dependencies",
  []
> = {
  meta: {
    type: "suggestion",
    docs: {
      category: "Best Practices",
      description: localize({
        en: "Detects each component importing a higher level component than itself.",
        ja: "各コンポーネントは自身より上位のレベルのコンポーネントをimportできません。",
      }),

      recommended: "error",
      url: "https://zenn.dev/takepepe/articles/atomic-redesign#%E5%8E%9F%E5%AD%90%E3%81%AE%E5%86%8D%E5%AE%9A%E7%BE%A9",
    },
    messages: {
      "import-dependencies": "{{ message }}",
    },
    schema: [
      {
        type: "object",
        properties: {
          includeSourceFilePatterns: {
            type: "object",
            properties: {
              atoms: { type: "string" },
              molecules: { type: "string" },
              organisms: { type: "string" },
              templates: { type: "string" },
            },
          },
          excludeSourceFilePatterns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          importPatterns: {
            type: "object",
            properties: {
              atoms: { type: "string" },
              molecules: { type: "string" },
              organisms: { type: "string" },
              templates: { type: "string" },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create: (context) => {
    const userOptionsArray = context.options as [UserOptions?];
    const userOptions = userOptionsArray[0]
      ? userOptionsArray[0]
      : { includeSourceFilePatterns: {}, importPatterns: {} };
    const options: Options = {
      includeSourceFilePatterns: {
        ...defaultOptions.includeSourceFilePatterns,
        ...userOptions.includeSourceFilePatterns,
      },
      excludeSourceFilePatterns: userOptions.excludeSourceFilePatterns
        ? userOptions.excludeSourceFilePatterns
        : defaultOptions.excludeSourceFilePatterns,
      importPatterns: {
        ...defaultOptions.importPatterns,
        ...userOptions.importPatterns,
      },
    };

    const sourceFilePath = context.getFilename();
    const isExcludedFile = options.excludeSourceFilePatterns.some((pattern) =>
      testString(sourceFilePath, pattern)
    );

    // util
    const isValidImport = (
      importPath: string,
      sourceFilePath: string,
      options: Options
    ): string | false => {
      const generateMessageUtil = (
        selfType: string,
        importingType: string
      ): string =>
        localize({
          en: `${selfType} cannot import ${importingType}.`,
          ja: `${selfType}は${importingType}をimportできません。`,
        });

      // atoms source file
      if (testString(sourceFilePath, options.includeSourceFilePatterns.atoms)) {
        if (testString(importPath, options.importPatterns.molecules))
          return generateMessageUtil("atoms", "molecules");
        if (testString(importPath, options.importPatterns.organisms))
          return generateMessageUtil("atoms", "organisms");
        if (testString(importPath, options.importPatterns.templates))
          return generateMessageUtil("atoms", "templates");
      }

      // molecules source file
      if (
        testString(sourceFilePath, options.includeSourceFilePatterns.molecules)
      ) {
        if (testString(importPath, options.importPatterns.organisms))
          return generateMessageUtil("molecules", "organisms");
        if (testString(importPath, options.importPatterns.templates))
          return generateMessageUtil("molecules", "templates");
      }

      // organisms source file
      if (
        testString(sourceFilePath, options.includeSourceFilePatterns.organisms)
      ) {
        if (testString(importPath, options.importPatterns.templates))
          return generateMessageUtil("organisms", "templates");
      }

      // template source file
      if (
        testString(sourceFilePath, options.includeSourceFilePatterns.templates)
      ) {
        if (testString(importPath, options.importPatterns.templates))
          return localize({
            en: `template cannot import other templates.`,
            ja: "templateは他のtemplateをimportできません。",
          });
      }

      return false;
    };

    return {
      ImportDeclaration(node) {
        if (isExcludedFile) return;

        const importPath = node.source.value;
        if (typeof importPath !== "string") return;

        const validateResult = isValidImport(
          importPath,
          sourceFilePath,
          options
        );

        if (validateResult) {
          context.report({
            node,
            messageId: "import-dependencies",
            data: { message: validateResult },
          });
        }
      },
    };
  },
};
