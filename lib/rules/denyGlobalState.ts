import { TSESLint } from '@typescript-eslint/experimental-utils';
import { localize } from '../utils';
import { makeCreateHandler, optionsJsonSchema } from './denyFuncNameUtils';

// rule
const ruleName = 'deny-global-state';
export const denyGlobalState: TSESLint.RuleModule<typeof ruleName, []> = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: localize({
        en: 'Atoms and Molecules components should not use Global States (fetch, useContext, useSWR, useSelector, etc.).',
        ja: 'AtomsおよびMoleculesコンポーネントはGlobal State（fetch、useContext、useSWR、useSelectorなど）を使用するべきではありません。',
      }),
      recommended: 'error',
      url: 'https://zenn.dev/takepepe/articles/atomic-redesign#%E5%8E%9F%E5%AD%90%E3%81%AE%E5%86%8D%E5%AE%9A%E7%BE%A9',
    },
    messages: {
      [ruleName]: '{{ message }}',
    },
    schema: optionsJsonSchema,
  },
  create: makeCreateHandler<typeof ruleName>(
    {
      includeSourceFilePatterns: [
        '\\/atoms\\/.*\\.tsx',
        '\\/molecules\\/.*\\.tsx',
      ],
      excludeSourceFilePatterns: ['\\.test', '\\.stories'],
      denyFunctionNames: [
        'fetch',
        'XMLHttpRequest',
        'useSWR',
        'useContext',
        'createContext',
        'useSelector',
        'useStore',
      ],
    },
    (node, context, denyedFunctionName, includedPattern) => {
      const fileType =
        includedPattern.indexOf('atoms') !== -1
          ? 'atoms'
          : includedPattern.indexOf('molecules') !== -1
          ? 'molecules'
          : localize({
              en: 'This file',
              ja: `このファイル`,
            });

      context.report({
        node,
        messageId: ruleName,
        data: {
          message: localize({
            en: `${fileType} cannot use ${denyedFunctionName} (Global State).`,
            ja: `${fileType}で${denyedFunctionName}（Global State）は使えません。`,
          }),
        },
      });
    }
  ),
};
