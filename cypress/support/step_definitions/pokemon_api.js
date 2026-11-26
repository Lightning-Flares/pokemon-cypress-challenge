import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { attachResponse, expectPokemonData, expectPokemonSchema } from "../helpers/helper_pokemon_api";

When("I request the pokemon {string} from the API", (idOrName) => {
  cy.getPokemon(idOrName).then((response) => {
    attachResponse(`GET /pokemon/${idOrName}`, response.status, response.body);
    cy.wrap(response, { log: false }).as("apiResponse");
  });
});

Then("the response status is {int}", (status) => {
  cy.get("@apiResponse").its("status").should("eq", status);
});

Then("the response has the id, name, types and abilities of {string}", (pokemon) => {
  cy.expectedPokemon(pokemon).then((expected) => {
    cy.get("@apiResponse").its("body").then((body) => expectPokemonData(body, expected));
  });
});

Then("the response has the pokemon structure", () => {
  cy.get("@apiResponse").its("body").then(expectPokemonSchema);
});

Then("the response is the not found error", () => {
  cy.fixture("errors").then(({ notFound }) => {
    cy.get("@apiResponse").then(({ headers, body }) => {
      expect(headers["content-type"], "la respuesta de error debe ser JSON").to.include("application/json");
      expect(body, "el cuerpo del error no coincide").to.deep.equal(notFound.body);
    });
  });
});
