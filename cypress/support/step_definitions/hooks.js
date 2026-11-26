/**
 * Hooks del ciclo de vida (equivalente al environment.py de behave).
 * Las capturas al fallar las toma Cypress y llegan solas al reporte de Allure.
 */
import { Before } from "@badeball/cypress-cucumber-preprocessor";
import * as allure from "allure-js-commons";

// Los tags de Gherkin (@api, @TC01, @smoketest...) pasan a Allure para poder filtrar por ellos.
Before(function ({ pickle }) {
  allure.tags(...pickle.tags.map((tag) => tag.name.slice(1)));
});

// El espía se registra antes del Background para no perder ninguna petición del frontend.
Before({ tags: "@frontend" }, function () {
  cy.interceptPokemon("pokemonRequest");
});
