import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import searchPage from "../../pages/pokemon_search_page";
import { attachResponse, expectPokemonData } from "../helpers/helper_pokemon_api";

// El intercept "pokemonRequest" se registra en hooks.js antes de cada escenario @frontend.

Given("I open the pokemon search page", () => {
  searchPage.visit();
});

Given("the API returns 404 for any pokemon", () => {
  cy.stubPokemonNotFound("pokemonNotFound");
});

When("I search the pokemon with id {string}", (id) => {
  searchPage.search(id);
});

When("I search without an id", () => {
  searchPage.search("");
});

Then("the PokéAPI request returns 200 with the data of {string}", (pokemon) => {
  cy.expectedPokemon(pokemon).then((expected) => {
    cy.wait("@pokemonRequest").then(({ request, response }) => {
      attachResponse(`Frontend → ${request.url}`, response.statusCode, response.body);
      expect(request.url, "el frontend pidió una URL distinta").to.match(new RegExp(`/pokemon/${expected.id}$`));
      expect(response.statusCode, "status de la API").to.eq(200);
      expectPokemonData(response.body, expected);
    });
  });
});

Then("the page shows the name, id and types of {string}", (pokemon) => {
  cy.expectedPokemon(pokemon).then((expected) => searchPage.verifyPokemonShown(expected));
});

Then("the app requests the pokemon {string}", (id) => {
  cy.wait("@pokemonNotFound").its("request.url").should("match", new RegExp(`/pokemon/${id}$`));
});

Then("I see the error {string}", (message) => {
  searchPage.verifyError(message);
});

Then("no request is sent to PokéAPI", () => {
  cy.get("@pokemonRequest.all").should("have.length", 0);
});
