import fs from 'fs';
import glob from 'glob';
import { JSONSchema4 } from 'json-schema';
import path from 'path';
import { testString } from '../utils';

// types
export type Options = {
  checkDirectorys: string[];
  checkFilesInDirectory: string[];
  excludeFilePatterns: string[];
  keywords: string[];
};
export type UserOptions = Partial<Options>;

// schema
export const optionsJsonSchema: JSONSchema4 = [
  {
    type: 'object',
    properties: {
      checkDirectorys: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      checkFilesInDirectory: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      excludeFilePatterns: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      keywords: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
  },
];

// utils
type FilePath = string;
type DirectoryPath = string;

type KeywordSet = Set<string>;
type Directory = Map<FilePath, KeywordSet>;

export class KeywordContentInfo {
  keywords: string[];
  directories: Map<DirectoryPath, Directory> = new Map();

  constructor(directories: string[], keywords: string[]) {
    this.keywords = keywords;
    for (const directory of directories) {
      this.directories.set(directory, new Map());
    }
  }

  getDirectoryFromFile(filepath: string): string | undefined {
    const matchedDirs = Array.from(this.directories.keys()).filter(
      (dirpath) => filepath.indexOf(dirpath) !== -1
    );
    if (matchedDirs.length === 0) return undefined;

    return matchedDirs.reduce((s, x) => (s.length > x.length ? s : x));
  }

  setFileKeywordInfo(filepath: string, program: string) {
    const contain_keywords: string[] = this.keywords.filter(
      (word) => program.indexOf(word) !== -1
    );
    const dirpath = this.getDirectoryFromFile(filepath);
    if (dirpath === undefined) return;

    this.directories.get(dirpath)?.set(filepath, new Set(contain_keywords));
  }

  getFileKeywordInfo(filepath: string): KeywordSet | undefined {
    const dirpath = this.getDirectoryFromFile(filepath);
    if (dirpath === undefined) return undefined;

    return this.directories.get(dirpath)?.get(filepath);
  }

  getDirectoryKeywordInfo(dirpath: string): Directory | undefined {
    return this.directories.get(dirpath);
  }
}

export const getInitialKeywordContentInfo = (
  options: Options
): KeywordContentInfo => {
  const cwd = process.cwd();

  const directories = options.checkDirectorys
    .map((pattern) => glob.sync(pattern))
    .flat()
    .map((dirpath) => path.join(cwd, dirpath));

  const keywordContentInfo = new KeywordContentInfo(
    directories,
    options.keywords
  );

  const files = options.checkFilesInDirectory
    .map((pattern) => glob.sync(pattern))
    .flat()
    .filter(
      (filepath) =>
        !options.excludeFilePatterns.some((pattern) =>
          testString(filepath, pattern)
        )
    );
  files.forEach(async (filepath) =>
    keywordContentInfo.setFileKeywordInfo(
      path.join(cwd, filepath),
      fs.readFileSync(filepath).toString()
    )
  );

  return keywordContentInfo;
};
