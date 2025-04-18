/** @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  transform: {
    "\\.[cm]?[jt]sx?$": "babel-jest",
  },
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};

export default config;
