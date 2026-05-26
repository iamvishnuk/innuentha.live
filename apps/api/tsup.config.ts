import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: "node20",
  shims: true, // injects __dirname and __filename shims for ESM
});
