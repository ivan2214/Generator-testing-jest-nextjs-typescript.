"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  async prompting() {
    this.log(
      yosay(`¡Bienvenido al generador ${chalk.red("generator-ivan-testing")}!`)
    );

    const prompts = [
      {
        type: "confirm",
        name: "installDependencies",
        message: "¿Deseas instalar las dependencias para pruebas?",
        default: true
      },
      {
        type: "list",
        name: "packageManager",
        message: "Elige un instalador de paquetes para las dependencias:",
        choices: ["npm", "pnpm", "yarn"],
        default: "pnpm",
        when: answers => answers.installDependencies,
        filter: choice => choice.toLowerCase()
      },
      {
        type: "confirm",
        name: "createTestsFolder",
        message: "¿Deseas crear una carpeta __tests__ en la raíz del proyecto?",
        default: true
      },
      {
        type: "confirm",
        name: "addTestScripts",
        message:
          "¿Deseas agregar los scripts de prueba al package.json? Si acepta aparece el siguiente mensaje ( Overwrite package.json?) presione enter y luego la letra Y, presione enter",
        default: true
      }
    ];

    const props = await this.prompt(prompts);
    this.props = props;
  }

  installDependencies() {
    if (this.props.installDependencies) {
      const dependencies = [
        "@jest/globals",
        "@testing-library/jest-dom",
        "@testing-library/react",
        "@types/jest",
        "@types/testing-library__jest-dom",
        "jest",
        "jest-environment-jsdom",
        "ts-jest",
        "ts-node"
      ];

      const packageManager = this.props.packageManager || "pnpm";
      this.spawnCommandSync(packageManager, [
        "install",
        "--save-dev",
        ...dependencies
      ]);
    }
  }

  createJestConfig() {
    const jestConfigContent = `
import nextJest from "next/jest";
import { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig: Config = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|ts|tsx)$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  },
  modulePathIgnorePatterns: ["node_modules/\\*\\/@types\\/next"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]
};

module.exports = createJestConfig(customJestConfig);
`;

    const jestSetupContent = `
    import "@testing-library/jest-dom"
`;

    this.fs.write(this.destinationPath("jest.config.ts"), jestConfigContent);

    this.fs.write(this.destinationPath("jest.setup.ts"), jestSetupContent);

    if (this.props.createTestsFolder) {
      this.fs.copyTpl(
        this.templatePath("empty.txt"),
        this.destinationPath("__tests__/test1.test.ts")
      );
    }

    if (this.props.addTestScripts) {
      const packageJsonPath = this.destinationPath("package.json");
      const packageJson = this.fs.readJSON(packageJsonPath) || {};
      packageJson.scripts = packageJson.scripts || {};

      packageJson.scripts.test = "jest --watchAll";
      packageJson.scripts["test-single"] = "jest --watchAll";

      this.fs.writeJSON(packageJsonPath, packageJson);
    }
  }
};
