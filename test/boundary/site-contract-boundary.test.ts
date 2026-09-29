import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const REPOSITORY_ROOT = resolve(process.cwd());
const CONTRACT_ROOT = 'src/sites/mountain-project/';

interface BoundaryRule {
  readonly name: string;
  readonly patterns: readonly RegExp[];
}

const RULES: readonly BoundaryRule[] = [
  {
    name: 'supported Mountain Project host',
    patterns: [
      /(?:www\.)?mountainproject\.com/,
    ],
  },
  {
    name: 'South Korea root area identity',
    patterns: [
      /106225629/,
      /\/area\/106225629\/south-korea/,
    ],
  },
  {
    name: 'high-risk map and stats landmark',
    patterns: [
      /#climb-area-page/,
      /#route-page/,
      /#you-and-route/,
      /#map-and-ride-finder-container/,
      /#ap-map-container/,
      /#route-stats/,
      /\.onx-stats-table/,
      /\.onx-explore/,
      /#photo-carousel/,
      /\.row\.pt-main-content/,
      /\.col-md-3\.left-nav/,
      /\.col-md-9\.main-content/,
      /\.col-lg-7\.col-md-6/,
      /\.col-lg-5\.col-md-6/,
    ],
  },
] as const;

// WXT may require manifest match patterns in its root config. It currently
// imports the canonical contract, but this narrow exception documents the only
// configuration file where a host literal could be justified.
const CONFIG_ALLOWLIST: Readonly<Record<string, readonly string[]>> = {
  'wxt.config.ts': ['supported Mountain Project host'],
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(absolutePath);
    }
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });
}

function lineNumberAt(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

describe('Mountain Project site-contract boundary', () => {
  it('keeps volatile host, territory, map, and stats literals in the site contract', () => {
    const files = [
      ...sourceFiles(resolve(REPOSITORY_ROOT, 'src')),
      resolve(REPOSITORY_ROOT, 'wxt.config.ts'),
    ];
    const violations: string[] = [];

    for (const absolutePath of files) {
      const repositoryPath = relative(REPOSITORY_ROOT, absolutePath).replaceAll('\\', '/');
      if (repositoryPath.startsWith(CONTRACT_ROOT)) {
        continue;
      }
      const source = readFileSync(absolutePath, 'utf8');
      for (const rule of RULES) {
        if (CONFIG_ALLOWLIST[repositoryPath]?.includes(rule.name)) {
          continue;
        }
        for (const pattern of rule.patterns) {
          const match = pattern.exec(source);
          if (match) {
            violations.push(
              `${repositoryPath}:${lineNumberAt(source, match.index)} [${rule.name}] ${match[0]}`,
            );
          }
        }
      }
    }

    expect(
      violations,
      [
        'Move upstream-sensitive literals into src/sites/mountain-project/contract',
        'and consume the exported contract from product code.',
      ].join(' '),
    ).toEqual([]);
  });
});
