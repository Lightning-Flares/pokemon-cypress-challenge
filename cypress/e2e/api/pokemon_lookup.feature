@api @regresion
Feature: Pokémon lookup in PokéAPI
  As a QA engineer I want to validate GET /pokemon/{id or name}
  so that the API returns the right data for each Pokémon.

  @TC01 @smoketest
  Scenario: TC01 - Successful lookup by id
    When I request the pokemon "25" from the API
    Then the response status is 200
    And the response has the id, name, types and abilities of "pikachu"

  @TC02
  Scenario: TC02 - Lookup by name
    When I request the pokemon "charizard" from the API
    Then the response status is 200
    And the response has the id, name, types and abilities of "charizard"
    And the response has the pokemon structure

  @TC03 @negativo
  Scenario Outline: TC03 - Non-existent pokemon "<pokemon>"
    When I request the pokemon "<pokemon>" from the API
    Then the response status is 404
    And the response is the not found error

    Examples:
      | pokemon               |
      | 99999                 |
      | 0                     |
      | pokemon-que-no-existe |

  @TC04
  Scenario Outline: TC04 - Response structure of "<pokemon>"
    When I request the pokemon "<pokemon>" from the API
    Then the response status is 200
    And the response has the pokemon structure

    Examples:
      | pokemon |
      | 1       |
      | 25      |
      | 150     |
