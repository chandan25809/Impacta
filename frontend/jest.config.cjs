module.exports = {
    transform: {
      "^.+\\.[tj]sx?$": "babel-jest",
    },
    moduleNameMapper: {
      "\\.(css|less|scss)$": "identity-obj-proxy",
    },
    testEnvironment: "jest-environment-jsdom",
    setupFiles: ['<rootDir>/jest.setup.js'],
  };
  