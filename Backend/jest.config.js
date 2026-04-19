module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.', // <-- Важно: корень проекта
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^generated/(.*)$': '<rootDir>/generated/$1', // <-- Важно: путь от корня
  },
};