// Peticiones del frontend a /pokemon/{id}, sin importar el host: el frontend tiene su
// propia URL de API, independiente de la que prueban los escenarios @api.
const FRONTEND_POKEMON_REQUEST = "**/api/v2/pokemon/*";

/** Datos esperados de un Pokémon desde fixtures/pokemon.json. */
Cypress.Commands.add("expectedPokemon", (name) => {
  return cy.fixture("pokemon").then((data) => {
    expect(data[name], `no hay datos esperados para "${name}" en fixtures/pokemon.json`).to.exist;
    return data[name];
  });
});

/** GET /pokemon/{id o nombre}. failOnStatusCode: false para poder validar los 404. */
Cypress.Commands.add("getPokemon", (idOrName) => {
  return cy.request({ url: `${Cypress.expose("apiUrl")}/pokemon/${idOrName}`, failOnStatusCode: false });
});

/** Espía (sin modificar) las peticiones del frontend a la API. */
Cypress.Commands.add("interceptPokemon", (alias) => {
  cy.intercept("GET", FRONTEND_POKEMON_REQUEST).as(alias);
});

/** Simula que la API responde 404 a cualquier Pokémon, usando el fixture errors.json. */
Cypress.Commands.add("stubPokemonNotFound", (alias) => {
  cy.fixture("errors").then(({ notFound }) => {
    cy.intercept("GET", FRONTEND_POKEMON_REQUEST, notFound).as(alias);
  });
});
