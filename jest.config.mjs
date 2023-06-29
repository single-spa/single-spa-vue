/** @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  transform: {
    "\\.[cm]?[jt]sx?$": "babel-jest",
  },
};

export default config;
