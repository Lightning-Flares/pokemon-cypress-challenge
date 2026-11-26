# Pokémon API — Challenge QA Automation

Pruebas de **API REST** e **integración frontend + backend** contra la [PokéAPI](https://pokeapi.co/api/v2/)
con **Cypress 16**, **JavaScript**, **Cucumber/Gherkin**, **Page Object Model** y reporte en **Allure**.

## Requisitos

- **Node.js 24 LTS** (viene en `.nvmrc`; también sirve 22.18+ o 26+). Cypress 16 no soporta Node 20, 23 ni 25.
- Conexión a internet (las pruebas usan la PokéAPI real) y el puerto **8080** libre.

Todo lo demás (Cypress, servidor del frontend, Allure) se instala con el proyecto.

## Instalación y ejecución

```bash
npm install
npm test
```

| Objetivo | Comando |
|---|---|
| Toda la suite | `npm test` |
| Solo API (TC01–TC04) | `npm run test:api` |
| Solo frontend (TC05–TC08) | `npm run test:frontend` |
| Regresión completa (tag `@regresion`) | `npm run test:regression` |
| Smoke (tag `@smoketest`) | `npm run test:smoke` |
| Modo interactivo | `npm run open` |

Los scripts de frontend levantan solos la página en `http://127.0.0.1:8080`. Para filtrar por tags:
`npx cypress run --expose tags="@TC03 or @TC04"`.

## Reporte

Al terminar cada ejecución se genera **Allure** en `reports/allure-report/index.html`, aunque haya fallas
(Allure 3 corre con Node, no necesita Java). Se abre con `npm run allure:open`.

Muestra cada escenario con PASS/FAIL, la duración de cada paso de Gherkin y el error cuando falla,
agrupado por feature y con los tags de Gherkin para filtrar. Adjunta un resumen de cada respuesta
de la API y una captura del paso que falló.

## Casos de prueba

| ID | Tipo | Escenario | Validaciones |
|---|---|---|---|
| TC01 | API | Consulta por ID `25` | 200, `id`, `name = pikachu`, tipos y habilidades |
| TC02 | API | Consulta por nombre `charizard` | 200, datos esperados y estructura completa |
| TC03 | API | Inexistente (`99999`, `0`, `pokemon-que-no-existe`) | 404 y JSON `{"status":404,"message":"Not Found"}` |
| TC04 | API | Estructura (`1`, `25`, `150`) | `id`, `name`, `types`, `abilities`, `stats` y sus tipos de dato |
| TC05 | Front + API | Buscar ID `25` | `cy.intercept()` de la petición real; la página muestra nombre, ID y tipos |
| TC06 | Front (stub) | La API responde 404 (simulada) | La app pide el ID escrito y muestra "No se encontró el Pokémon" |
| TC07 | Front | Buscar sin ID | Mensaje de validación y ninguna petición |
| TC08 | Front | ID inválido: letras, negativo, `1e3` y `0` (límite) | Mensaje de validación y **ninguna petición a la API** |

## Arquitectura

```
├── app/                                  # Página de prueba (HTML + JS sin frameworks)
├── cypress/
│   ├── e2e/
│   │   ├── api/pokemon_lookup.feature
│   │   └── frontend/pokemon_search.feature
│   ├── fixtures/
│   │   ├── pokemon.json                  # Datos esperados por Pokémon
│   │   └── errors.json                   # Respuesta 404 (validación y stub)
│   ├── pages/pokemon_search_page.js      # Page Object: selectores y acciones
│   └── support/
│       ├── commands.js                   # Custom commands
│       ├── e2e.js
│       ├── helpers/helper_pokemon_api.js # Validaciones de la respuesta y evidencia para Allure
│       └── step_definitions/
│           ├── hooks.js                  # Tags a Allure e intercept del frontend
│           ├── pokemon_api.js
│           └── pokemon_search.js
├── .cypress-cucumber-preprocessorrc.json # Ruta de steps y filtro por tags
├── allurerc.mjs                          # Configuración de Allure
└── cypress.config.js                     # Variables de ambiente, Cucumber y Allure
```

**Convenciones:** Gherkin declarativo en inglés (describe qué hace el usuario; el *cómo* está en el
Page Object); comentarios y mensajes de aserción en español; archivos en `snake_case`; tags por capa
(`@api`, `@frontend`), por suite (`@regresion`, `@smoketest`), `@negativo` y un ID por caso.

| Custom command | Uso |
|---|---|
| `cy.getPokemon(idONombre)` | `GET /pokemon/{id}` sin fallar en 404, para poder validarlo |
| `cy.expectedPokemon(nombre)` | Datos esperados de `fixtures/pokemon.json`; falla con mensaje claro si no existen |
| `cy.interceptPokemon(alias)` | Espía las peticiones del frontend a `**/api/v2/pokemon/*` |
| `cy.stubPokemonNotFound(alias)` | Simula que la API responde 404 a cualquier Pokémon |

**Decisiones de diseño**

- Selectores `data-cy`, que no dependen de estilos ni textos.
- Sin esperas fijas: aserciones con reintento y `cy.wait('@alias')` sobre la petición interceptada.
- Datos esperados en fixtures: agregar un Pokémon es agregar una entrada al JSON.
- TC05 usa la API real (integración de punta a punta) y TC06 una respuesta simulada (manejo de errores determinista).
- Aserciones con mensaje (`"el id no coincide"`) para entender la falla desde el reporte.
- Un reintento en `cypress run` para absorber fallas de red de una API pública.

**Página de prueba:** solo acepta enteros de 1 a 99999 y valida antes de llamar a la API (`type="text"`
con `inputmode="numeric"`, porque `type="number"` acepta `-5` o `1e3`); pinta todo con `textContent`,
nunca `innerHTML`; deshabilita el botón mientras busca y oculta la imagen si el Pokémon no tiene una.

## Variables de ambiente

`apiUrl` y `frontendUrl` están en `expose` de `cypress.config.js` y se sobrescriben sin tocar archivos:
`npx cypress run --expose apiUrl=https://otra-url/api/v2`. `apiUrl` es la API que prueban los
escenarios `@api`; la página tiene su propia URL en `app/app.js` y los intercepts coinciden con
cualquier host, así que cambiar una no rompe las pruebas de la otra. El proyecto no usa credenciales.

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `EBADENGINE` o Cypress no arranca | Usa Node 24 LTS (`nvm use` toma la versión de `.nvmrc`) |
| `npx cypress verify` falla | `npx cypress install` (npm 11+ pide aprobar scripts; `package.json` ya los aprueba) |
| Las pruebas de frontend no arrancan | Libera el puerto 8080 |

## Uso de inteligencia artificial

**Herramienta:** Claude (Anthropic), como asistente durante todo el desarrollo.

**Para qué la usé**

- Generar la **página de prueba** (`app/`) completa: HTML, CSS y JavaScript. No es parte de lo evaluado;
  solo sirve como frontend para la prueba de integración.
- Montar el proyecto: configuración de Cypress 16 con Cucumber (esbuild) y Allure, scripts npm y CI.
- Escribir y refactorizar el código de pruebas (features, steps, Page Object, commands, fixtures)
  siguiendo la arquitectura y las convenciones que le indiqué.
- Revisar el código como en un pull request y simplificarlo.

**Qué decidí yo**

- La arquitectura, basada en la que uso en mi trabajo con Behave: Gherkin en inglés y en primera
  persona, archivos en `snake_case`, tags `@regresion` y `@smoketest`, y hooks como equivalente del `environment.py`.
- Usar Allure como reporte, igual que en mi trabajo.
- Exigir que la página validara las entradas antes de llamar a la API y cubrirlo con pruebas (TC07, TC08).
- Pedir revisiones tipo PR, quitar la sobreingeniería y dejar solo casos de prueba que aporten algo distinto.

**Cómo verifiqué el resultado**

- Ejecuté la suite completa y por separado las pruebas de API y de frontend, y revisé el reporte de Allure.
- Forcé una falla cambiando el ID consultado en TC01: la prueba falló con "el id no coincide",
  revisé la falla en Allure y al restaurarlo volvió a pasar.
- Con ayuda de la IA: se simuló la instalación del evaluador en una carpeta limpia (`npm ci` + `npm test`
  siguiendo este README), se inyectó un bug en la página (pedir otro ID) y se usó una `apiUrl` inválida
  para confirmar que las pruebas detectan errores reales (con la `apiUrl` inválida fallaron solo las de API).
  También se comprobaron con `curl` las respuestas reales de la PokéAPI.

**Problemas que aparecieron y cómo se resolvieron**

- **Cypress 16 eliminó `Cypress.env()`:** se migró a `Cypress.expose()` y `--expose`.
- **La PokéAPI responde el 404 como JSON**, no como texto: se ajustó el fixture después de verificarlo con `curl`.
- **npm 11 bloquea scripts de instalación:** se aprobaron los de Cypress y esbuild en `package.json`.
- **Cypress 16 no soporta Node 20:** se declararon `engines` y `.nvmrc`.
- **Cucumber y Allure registran los mismos eventos de Cypress:** se combinaron con `cypress-on-fix`.
- **`type="number"` aceptaba `-5` y `1e3`** y los enviaba a la API: se cambió por validación explícita.
- **TC06 no podía fallar:** verificaba la respuesta del propio stub. Ahora el stub responde a cualquier ID
  y la prueba verifica que la página pidió el ID escrito.
- **Algunos Pokémon no tienen imagen** (p. ej. #10264): la página mostraba una imagen rota; ahora la oculta.
