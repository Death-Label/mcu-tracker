import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️  Troque "mcu-tracker" pelo nome exato do seu repositório no GitHub
//     Exemplo: se o repo for github.com/joao/meu-mcu, coloque base: "/meu-mcu/"
export default defineConfig({
  plugins: [react()],
  base: "/mcu-tracker/",
});
