import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
const config = {
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  transform: {
    ...tsJestTransformCfg,
  },
};

export default config;
