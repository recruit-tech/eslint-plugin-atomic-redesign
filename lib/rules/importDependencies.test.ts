import { TSESLint } from "@typescript-eslint/experimental-utils";
import { importDependencies } from "./importDependencies";

const ruleName = "import-dependencies";
const tester = new TSESLint.RuleTester({
  parser: require.resolve("espree"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

type PartsType = "atoms" | "molecules" | "organisms" | "templates";
const CWD = "/Users/testuser/project";
const generateTestCase = (
  fileType: PartsType,
  importType: PartsType,
  isError: boolean
) => [
  {
    filename: `${CWD}/src/components/${fileType}/foo/index.tsx`,
    code: `import component from '${
      fileType === importType ? ".." : `../${importType}`
    }/bar/index.tsx'`,
    errors: isError
      ? [{ messageId: "import-dependencies" as const }]
      : undefined,
  },
  {
    filename: `${CWD}/src/components/${fileType}/foo/index.tsx`,
    code: `import component from '@/components/${importType}/bar/index.tsx'`,
    errors: isError
      ? [{ messageId: "import-dependencies" as const }]
      : undefined,
  },
];
describe("test", () => {
  tester.run(ruleName, importDependencies, {
    valid: [
      // atoms
      ...generateTestCase("atoms", "atoms", false),
      // molecules
      ...generateTestCase("molecules", "atoms", false),
      ...generateTestCase("molecules", "molecules", false),
      // organisms
      ...generateTestCase("organisms", "atoms", false),
      ...generateTestCase("organisms", "molecules", false),
      ...generateTestCase("organisms", "organisms", false),
      // templates
      ...generateTestCase("templates", "atoms", false),
      ...generateTestCase("templates", "molecules", false),
      ...generateTestCase("templates", "organisms", false),
    ],
    invalid: [
      // atoms
      ...generateTestCase("atoms", "molecules", true),
      ...generateTestCase("atoms", "organisms", true),
      ...generateTestCase("atoms", "templates", true),
      // molecules
      ...generateTestCase("molecules", "organisms", true),
      ...generateTestCase("molecules", "templates", true),
      // organisms
      ...generateTestCase("organisms", "templates", true),
    ],
  });
});
