# eslint-plugin-atomic-redesign

ESLint rules for [Atomic ReDesign](https://zenn.dev/takepepe/articles/atomic-redesign)ed projects.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-atomic-redesign`:

```
$ npm install eslint-plugin-atomic-redesign --save-dev
```

## Usage

Add `atomic-redesign` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["atomic-redesign"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "atomic-redesign/import-dependencies": 2,
    "atomic-redesign/deny-local-state": 2,
    "atomic-redesign/deny-global-state": 2,
    "atomic-redesign/must-use-local-state": 2,
    "atomic-redesign/must-use-global-state": 2
  }
}
```

## Supported Rules

This plugin currently supports 5 rules. Each rule receives one object as options.

Example:

```javascript
"atomic-redesign/rule-name": [
  2,
  {
    PropertyName: "value",
    PropertyName: "value",
    ...
  },
]
```

### Rule: import-dependencies

Detects each component importing a higher level component than itself.

#### Examples of **incorrect** code for this rule:

```typescript
// at src/components/atoms/foo/index.tsx
import Bar from "../../molecules/bar/index.tsx";
```

#### Examples of **correct** code for this rule:

```typescript
// at src/components/molecules/bar/index.tsx
import Foo from "../../atoms/foo/index.tsx";
```

#### Options

Example:

```typescript
"atomic-redesign/import-dependencies": [
  2,
  {
    includeSourceFilePatterns: {
      atoms: ".*\\/atoms\\/.*index.tsx" // Atoms components is written in `*atoms/*index.tsx`.
      // Other properties have default values.
    },
    excludeSourceFilePatterns: [
      ".*\\.foo.*", // Ignore filenames containing `.foo`
    ],
    // Other properties have default values.
  },
```

| Property Name             | Description                                                                                                                                                                                                              | Default Value                                     |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| includeSourceFilePatterns | A set of each component type (atoms and molecules) and a RegExp pattern. If the file path matches each pattern, the rule determines that the file contains components of that type and checks the import statement.      | [here](./lib/rules/importDependencies.ts#L28-L33) |
| excludeSourceFilePatterns | An array of RegExp patterns. File paths that match any pattern are excluded from the check.                                                                                                                              | [here](./lib/rules/importDependencies.ts#L34)     |
| importPatterns            | A set of each component type (atoms and molecules) and a RegExp pattern. If the path portion of the import statement matches these patterns, the rule determines that it is loading the corresponding type of component. | [here](./lib/rules/importDependencies.ts#L35-L40) |

### Rule: deny-local-state

Detects that Atoms have Local States (setState, useState, useReducer, etc.).

#### Examples of **incorrect** code for this rule:

```typescript
// at src/components/atoms/foo/index.tsx
const [val, setVal] = useState(0);
```

#### Examples of **correct** code for this rule:

```typescript
// at src/components/molecules/bar/index.tsx
const [val, setVal] = useState(0);
```

#### Options

| Property Name             | Description                                                                                    | Default Value                             |
| :------------------------ | :--------------------------------------------------------------------------------------------- | :---------------------------------------- |
| includeSourceFilePatterns | An array of RegExp patterns that match the name of the file that must not contain local state. | [here](./lib/rules/denyLocalState.ts#L26) |
| excludeSourceFilePatterns | An array of RegExp patterns. File paths that match any pattern are excluded from the check.    | [here](./lib/rules/denyLocalState.ts#L27) |
| denyFunctionNames         | An array of function names that are considered to be using the local state.                    | [here](./lib/rules/denyLocalState.ts#L28) |

### Rule: deny-global-state

Detects that atoms and molecules have Global States (fetch, useContext, useSWR, useSelector, etc.).

#### Examples of **incorrect** code for this rule:

```typescript
// at src/components/molecules/foo/index.tsx
const [val, setVal] = useContext(0);
```

#### Examples of **correct** code for this rule:

```typescript
// at src/components/Organisms/bar/index.tsx
const [val, setVal] = useContext(0);
```

#### Options

| Property Name             | Description                                                                                     | Default Value                                  |
| :------------------------ | :---------------------------------------------------------------------------------------------- | :--------------------------------------------- |
| includeSourceFilePatterns | An array of RegExp patterns that match the name of the file that must not contain global state. | [here](./lib/rules/denyGlobalState.ts#L26-L29) |
| excludeSourceFilePatterns | An array of RegExp patterns. File paths that match any pattern are excluded from the check.     | [here](./lib/rules/denyGlobalState.ts#L30)     |
| denyFunctionNames         | An array of function names that are considered to be using the local state.                     | [here](./lib/rules/denyGlobalState.ts#L31-L39) |

### Rule: must-use-local-state

Detects that Local State (setState, useState, useReducer, etc.) is not used in Molecules.

The plugin will check if source codes in each Molecules directory contain the Local State keywords, and if it doesn't contain any keywords, the plugin will throw an error in all source codes in the directory.

**Do not use eslint's `--cache` option** with this plugin. This is because the errors in each file may be resolved by other files.

#### Examples of **incorrect** code for this rule:

```typescript
// at src/components/molecules/foo/index.tsx
// no Local State keywords.
```

#### Examples of **correct** code for this rule:

```typescript
// at src/components/molecules/bar/index.tsx
const [val, setVal] = useState(0);
```

#### Options

| Property Name         | Description                                                                                                   | Default Value                                |
| :-------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| checkDirectorys       | An array of Glob patterns. The rule treats each directory that matches this pattern as a Molecules component. | [here](./lib/rules/mustUseLocalState.ts#L13) |
| checkFilesInDirectory | An array of Glob patterns. The rule only checks files that match this pattern.                                | [here](./lib/rules/mustUseLocalState.ts#L14) |
| excludeFilePatterns   | An array of RegExp patterns. Files with paths that match this pattern are excluded from the check.            | [here](./lib/rules/mustUseLocalState.ts#L15) |
| keywords              | An array of strings that are considered to be using Local State.                                              | [here](./lib/rules/mustUseLocalState.ts#L16) |

### Rule: must-use-global-state

Detects that Global State（fetch, useContext, useSWR, useSelector, etc.) is not used in Organisms.

The plugin will check if source codes in each Organisms directory contain the Global State keywords, and if it doesn't contain any keywords, the plugin will throw an error in all source codes in the directory.

**Do not use eslint's `--cache` option** with this plugin. This is because the errors in each file may be resolved by other files.

#### Examples of **incorrect** code for this rule:

```typescript
// at src/components/organisms/foo/index.tsx
// no Global State keywords.
```

#### Examples of **correct** code for this rule:

```typescript
// at src/components/organisms/bar/index.tsx
const [val, setVal] = useContext(0);
```

#### Options

| Property Name         | Description                                                                                                   | Default Value                                     |
| :-------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| checkDirectorys       | An array of Glob patterns. The rule treats each directory that matches this pattern as a Organisms component. | [here](./lib/rules/mustUseGlobalState.ts#L13)     |
| checkFilesInDirectory | An array of Glob patterns. The rule only checks files that match this pattern.                                | [here](./lib/rules/mustUseGlobalState.ts#L14)     |
| excludeFilePatterns   | An array of RegExp patterns. Files with paths that match this pattern are excluded from the check.            | [here](./lib/rules/mustUseGlobalState.ts#L15)     |
| keywords              | An array of strings that are considered to be using Global State.                                             | [here](./lib/rules/mustUseGlobalState.ts#L16-L25) |

### Licence

MIT
