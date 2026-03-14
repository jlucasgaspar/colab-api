/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  transformIgnorePatterns: [
    'node_modules/(?!(@paralleldrive/cuid2)/)',
  ],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.module.ts',
    '!main.ts',
    '!db/migrate.ts',
    '!db/seed.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
