/** Validaciones y evidencia de las respuestas de /pokemon/{id}, compartidas por los steps. */
import * as allure from "allure-js-commons";

const typeNames = (body) => body.types.map((t) => t.type.name);
const abilityNames = (body) => body.abilities.map((a) => a.ability.name);

/** Compara la respuesta con los datos esperados del fixture. */
export function expectPokemonData(body, expected) {
  expect(body.id, "el id no coincide").to.eq(expected.id);
  expect(body.name, "el nombre no coincide").to.eq(expected.name);
  expect(typeNames(body), "los tipos no coinciden").to.deep.equal(expected.types);
  expect(abilityNames(body), "faltan habilidades esperadas").to.include.members(expected.abilities);
}

/** Campos obligatorios y tipos de dato, incluidos los objetos internos. */
export function expectPokemonSchema(body) {
  const expectResource = (resource, path) => {
    expect(resource.name, `${path}.name`).to.be.a("string").and.not.be.empty;
    expect(resource.url, `${path}.url`).to.match(/^https?:\/\//);
  };

  expect(body).to.include.all.keys("id", "name", "types", "abilities", "stats");
  expect(body.id, "id").to.be.a("number").and.be.greaterThan(0);
  expect(body.name, "name").to.be.a("string").and.not.be.empty;
  ["types", "abilities", "stats"].forEach((key) => {
    expect(body[key], key).to.be.an("array").and.not.be.empty;
  });

  body.types.forEach(({ slot, type }, i) => {
    expect(slot, `types[${i}].slot`).to.be.a("number");
    expectResource(type, `types[${i}].type`);
  });
  body.abilities.forEach(({ is_hidden, ability }, i) => {
    expect(is_hidden, `abilities[${i}].is_hidden`).to.be.a("boolean");
    expectResource(ability, `abilities[${i}].ability`);
  });
  body.stats.forEach(({ base_stat, effort, stat }, i) => {
    expect(base_stat, `stats[${i}].base_stat`).to.be.a("number").and.be.at.least(0);
    expect(effort, `stats[${i}].effort`).to.be.a("number").and.be.at.least(0);
    expectResource(stat, `stats[${i}].stat`);
  });
}

/** Adjunta al reporte un resumen de la respuesta (la completa pesa cientos de KB). */
export function attachResponse(name, status, body) {
  const summary =
    status >= 400
      ? { status, body }
      : { status, id: body.id, name: body.name, types: typeNames(body), abilities: abilityNames(body) };
  allure.attachment(name, JSON.stringify(summary, null, 2), "application/json");
}
