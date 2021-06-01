import { denyGlobalState } from './rules/denyGlobalState';
import { denyLocalState } from './rules/denyLocalState';
import { importDependencies } from './rules/importDependencies';
import { mustUseGlobalState } from './rules/mustUseGlobalState';
import { mustUseLocalState } from './rules/mustUseLocalState';

export = {
  rules: {
    'import-dependencies': importDependencies,
    'deny-local-state': denyLocalState,
    'deny-global-state': denyGlobalState,
    'must-use-local-state': mustUseLocalState,
    'must-use-global-state': mustUseGlobalState,
  },
  configs: {
    all: {
      plugins: ['atmic-redesign'],
      rules: {
        'import-dependencies': 'error',
        'deny-local-state': 'error',
        'deny-global-state': 'error',
        'must-use-local-state': 'error',
        'must-use-global-state': 'error',
      },
    },
  },
};
