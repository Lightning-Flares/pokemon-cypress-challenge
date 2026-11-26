const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { defineConfig } = require("cypress");
const cypressOnFix = require("cypress-on-fix");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const { allureCypress } = require("allure-cypress/reporter");

const ALLURE_RESULTS = "reports/allure-results";

module.exports = defineConfig({
  // Variables de ambiente (no sensibles). Se leen con Cypress.expose() y se
  // sobrescriben sin tocar código: npx cypress run --expose apiUrl=https://...
  expose: {
    apiUrl: "https://pokeapi.co/api/v2",
    frontendUrl: "http://127.0.0.1:8080",
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.feature",
    screenshotsFolder: "reports/screenshots",
    video: false,
    retries: { runMode: 1, openMode: 0 }, // absorbe fallas de red de una API pública
    async setupNodeEvents(cypressOn, config) {
      // Cucumber y Allure registran los mismos eventos; cypress-on-fix evita que uno pise al otro.
      const on = cypressOnFix(cypressOn);

      on("before:run", () => fs.rmSync(ALLURE_RESULTS, { recursive: true, force: true }));

      await addCucumberPreprocessorPlugin(on, config);
      on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }));

      allureCypress(on, config, {
        resultsDir: ALLURE_RESULTS,
        environmentInfo: {
          "API URL": config.expose.apiUrl,
          "Frontend URL": config.expose.frontendUrl,
        },
      });

      // Se registra después de Allure para que los resultados ya estén escritos.
      // Corre aunque haya pruebas fallidas; si falla la generación, las pruebas no se marcan como fallidas.
      on("after:run", () => {
        try {
          execSync("npx --no-install allure generate --clean", { stdio: "inherit" });
        } catch {
          console.error("No se pudo generar el reporte de Allure; ejecuta: npx allure generate --clean");
        }
      });

      return config;
    },
  },
});
