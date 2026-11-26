@frontend @regresion
Feature: Pokémon search page (frontend + PokéAPI integration)
  As a user I want to search a Pokémon by its id
  so that I can see its name, id and types as returned by the backend.

  Background:
    Given I open the pokemon search page

  @TC05 @smoketest
  Scenario: TC05 - Searching by id shows the data returned by the API
    When I search the pokemon with id "25"
    Then the PokéAPI request returns 200 with the data of "pikachu"
    And the page shows the name, id and types of "pikachu"

  @TC06 @negativo
  Scenario: TC06 - Error message when the API returns 404 (stubbed response)
    Given the API returns 404 for any pokemon
    When I search the pokemon with id "99999"
    Then the app requests the pokemon "99999"
    And I see the error "No se encontró el Pokémon"

  @TC07 @negativo
  Scenario: TC07 - Validation message when searching without an id
    When I search without an id
    Then I see the error "Ingresa un ID de Pokémon"
    And no request is sent to PokéAPI

  @TC08 @negativo
  Scenario Outline: TC08 - Invalid input is rejected before calling the API: <case>
    When I search the pokemon with id "<value>"
    Then I see the error "<message>"
    And no request is sent to PokéAPI

    Examples:
      | case                | value | message                           |
      | letters             | abc   | El ID solo puede contener números |
      | negative number     | -5    | El ID solo puede contener números |
      | scientific notation | 1e3   | El ID solo puede contener números |
      | zero                | 0     | El ID debe estar entre 1 y 99999  |
