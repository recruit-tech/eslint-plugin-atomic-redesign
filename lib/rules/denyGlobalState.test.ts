import { TSESLint } from '@typescript-eslint/experimental-utils';
import { denyGlobalState } from './denyGlobalState';

const ruleName = 'deny-global-state';
const tester = new TSESLint.RuleTester({
  parser: require.resolve('espree'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

const getSampleClassComponentCode = (funcName: string): string =>
  `
class ClassComponent extends React.Component {
  render() {
    ${funcName}();
  }
}`.replace(/\n/g, '');

const getSampleFunctionalComponentCode = (funcName: string): string =>
  `
const FunctionalComponent = () => {
  const [somevar] = ${funcName}();
};
`.replace(/\n/g, '');

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
        ? [{ messageId: 'deny-global-state' as const }]
        : undefined,
    }))
  );
  return test_cases;
};

const CWD = '/Users/testuser/project';
const CWDWin = 'C:\\Users\\testuser\\project';
describe('test', () => {
  tester.run(ruleName, denyGlobalState, {
    valid: [
      ...generateTestCases(
        `${CWD}/src/components/atoms/test/index.tsx`,
        ['useEffect', 'useCallback', 'React.useEffect', 'React.useCallback'],
        false
      ),
      ...generateTestCases(
        `${CWD}/src/components/molecules/test/index.tsx`,
        ['useEffect', 'useCallback', 'React.useEffect', 'React.useCallback'],
        false
      ),
      ...generateTestCases(
        `${CWD}/src/components/molecules/test/index.test.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),

      ...generateTestCases(
        `${CWDWin}\\src\\components\\atoms\\test\\index.tsx`,
        ['useEffect', 'useCallback', 'React.useEffect', 'React.useCallback'],
        false
      ),
      ...generateTestCases(
        `${CWDWin}\\src\\components\\molecules\\test\\index.tsx`,
        ['useEffect', 'useCallback', 'React.useEffect', 'React.useCallback'],
        false
      ),
      ...generateTestCases(
        `${CWDWin}\\src\\components\\molecules\\test\\index.test.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),
    ],
    invalid: [
      ...generateTestCases(
        `${CWD}/src/components/atoms/test/index.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),
      ...generateTestCases(
        `${CWD}/src/components/molecules/test/index.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),

      ...generateTestCases(
        `${CWDWin}\\src\\components\\atoms\\test\\index.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),
      ...generateTestCases(
        `${CWDWin}\\src\\components\\molecules\\test\\index.tsx`,
        [
          'fetch',
          'XMLHttpRequest',
          'useSWR',
          'useContext',
          'createContext',
          'useSelector',
          'useStore',
          'React.useContext',
          'React.createContext',
          'Redux.useSelector',
          'Redux.useStore',
        ],
        true
      ),
    ],
  });
});
