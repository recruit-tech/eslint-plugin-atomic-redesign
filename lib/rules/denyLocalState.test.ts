import { TSESLint } from "@typescript-eslint/experimental-utils";
import { denyLocalState } from "./denyLocalState";

const ruleName = "deny-local-state";
const tester = new TSESLint.RuleTester({
  parser: require.resolve("espree"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

const getSampleClassComponentCode = (funcName: string): string =>
  `
class ClassComponent extends React.Component {
  render() {
    ${funcName}();
  }
}`.replace(/\n/g, "");

const getSampleFunctionalComponentCode = (funcName: string): string =>
  `
const FunctionalComponent = () => {
  const [somevar] = ${funcName}();
};
`.replace(/\n/g, "");

const generateTestCases = (
  filepath: string,
  funcList: string[],
  isError: boolean,
  codeGeneratorList: ((funcName: string) => string)[] = [
    getSampleClassComponentCode,
    getSampleFunctionalComponentCode,
  ]
) => {
  const test_cases = funcList.flatMap((funcname) =>
    codeGeneratorList.map((generator) => ({
      filename: filepath,
      code: generator(funcname),
      errors: isError
        ? [{ messageId: "deny-local-state" as const }]
        : undefined,
    }))
  );
  return test_cases;
};

const CWD = "/Users/testuser/project";
describe("test", () => {
  tester.run(ruleName, denyLocalState, {
    valid: [
      ...generateTestCases(
        `${CWD}/src/components/atoms/test/index.tsx`,
        [
          "useEffect",
          "useContext",
          "useCallback",
          "useMemo",
          "useRef",
          "useImperativeHandle",
          "useLayoutEffect",
          "useDebugValue",
          "React.useEffect",
          "React.useContext",
          "React.useCallback",
          "React.useMemo",
          "React.useRef",
          "React.useImperativeHandle",
          "React.useLayoutEffect",
          "React.useDebugValue",
        ],
        false
      ),
      ...generateTestCases(
        `${CWD}/src/components/atoms/test/index.test.tsx`,
        [
          "this.setState",
          "useState",
          "useReducer",
          "React.useState",
          "React.useReducer",
        ],
        false
      ),
    ],
    invalid: [
      ...generateTestCases(
        `${CWD}/src/components/atoms/test/index.tsx`,
        [
          "this.setState",
          "useState",
          "useReducer",
          "React.useState",
          "React.useReducer",
        ],
        true
      ),
    ],
  });
});
