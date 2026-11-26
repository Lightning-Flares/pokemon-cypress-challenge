// Configuración del reporte de Allure 3 (corre con Node, no necesita Java).
import { defineConfig } from "allure";

export default defineConfig({
  name: "Pokémon API — QA Automation",
  resultsDir: "./reports/allure-results",
  output: "./reports/allure-report",
  // No mostrar el nombre de la máquina ni el proceso en el reporte.
  hideLabels: ["host", "thread"],
  plugins: {
    awesome: {
      options: {
        // Un solo index.html que se puede abrir directo en el navegador.
        singleFile: true,
        reportLanguage: "es",
      },
    },
  },
});
