/** Page Object del buscador de Pokémon: selectores y acciones de la pantalla. */
const selectors = {
  searchBox: "[data-cy='pokemon-input']",
  searchButton: "[data-cy='search-button']",
  card: "[data-cy='pokemon-card']",
  name: "[data-cy='pokemon-name']",
  id: "[data-cy='pokemon-id']",
  type: "[data-cy='pokemon-type']",
  error: "[data-cy='error-message']",
};

class PokemonSearchPage {
  visit() {
    cy.visit(Cypress.expose("frontendUrl"));
    cy.get(selectors.searchBox).should("be.visible");
  }

  /** Busca el id escrito; con "" envía el formulario vacío (.type("") no está permitido en Cypress). */
  search(id) {
    cy.get(selectors.searchBox).clear();
    if (id) cy.get(selectors.searchBox).type(id);
    cy.get(selectors.searchButton).click();
  }

  verifyPokemonShown({ name, id, types }) {
    cy.get(selectors.card).should("be.visible");
    cy.get(selectors.name).should("have.text", name);
    cy.get(selectors.id).should("have.text", String(id));
    cy.get(selectors.type).should(($types) => {
      expect([...$types].map((el) => el.textContent), "tipos mostrados en pantalla").to.deep.equal(types);
    });
  }

  verifyError(message) {
    cy.get(selectors.error).should("be.visible").and("have.text", message);
    cy.get(selectors.card).should("not.be.visible");
  }
}

export default new PokemonSearchPage();
