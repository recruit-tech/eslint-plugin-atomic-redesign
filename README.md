# eslint-plugin-atomic-redesign

ESLint rules for Atomic ReDesigned projects

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
    "atomic-redesign/rule-name": 2
  }
}
```

## Supported Rules

- Fill in provided rules here
