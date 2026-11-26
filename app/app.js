(function () {
  "use strict";

  const API_URL = "https://pokeapi.co/api/v2";
  const MAX_ID = 99999;

  const $ = (name) => document.querySelector(`[data-cy="${name}"]`);
  const input = $("pokemon-input");
  const row = input.closest(".row");
  const card = $("pokemon-card");
  const error = $("error-message");

  /** Solo enteros de 1 a MAX_ID. Todo lo demás se rechaza antes de llamar a la API. */
  function validateId(value) {
    value = value.trim();
    if (value === "") return { error: "Ingresa un ID de Pokémon" };
    if (!/^\d+$/.test(value)) return { error: "El ID solo puede contener números" };
    const id = Number(value); // "025" → 25
    if (id < 1 || id > MAX_ID) return { error: `El ID debe estar entre 1 y ${MAX_ID}` };
    return { id };
  }

  function showError(message) {
    card.hidden = true;
    $("empty-state").hidden = true;
    error.textContent = message;
    error.hidden = false;
  }

  function clearError() {
    error.hidden = true;
    row.classList.remove("invalid");
  }

  // El botón deshabilitado mientras carga también evita dos búsquedas al mismo tiempo.
  function setLoading(isLoading) {
    $("loading").hidden = !isLoading;
    $("search-button").disabled = isLoading;
  }

  /** Siempre con textContent: lo que venga de la API nunca se interpreta como HTML. */
  function render(pokemon) {
    $("empty-state").hidden = true;
    $("pokemon-id").textContent = pokemon.id;
    $("pokemon-name").textContent = pokemon.name;

    // Algunas formas (p. ej. #10264) no tienen imagen: se oculta en vez de mostrarla rota.
    const sprite = $("pokemon-sprite");
    const artwork = pokemon.sprites?.other?.["official-artwork"]?.front_default;
    sprite.hidden = !artwork;
    sprite.src = artwork || "";
    sprite.alt = pokemon.name;

    $("pokemon-types").replaceChildren(
      ...pokemon.types.map(({ type }) => {
        const li = document.createElement("li");
        li.textContent = type.name;
        li.className = `t-${type.name}`;
        li.dataset.cy = "pokemon-type";
        return li;
      })
    );
    card.hidden = false;
  }

  async function search(id) {
    clearError();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pokemon/${id}`, { cache: "no-store" }); // no-store evita 304 desde caché
      if (response.status === 404) return showError("No se encontró el Pokémon");
      if (!response.ok) return showError(`Error al consultar la API (${response.status})`);
      render(await response.json());
    } catch {
      showError("No fue posible consultar la API");
    } finally {
      setLoading(false);
    }
  }

  $("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const { id, error: message } = validateId(input.value);
    if (message) {
      row.classList.add("invalid");
      return showError(message);
    }
    input.value = String(id);
    search(id);
  });

  input.addEventListener("input", clearError);
  input.focus();
})();
