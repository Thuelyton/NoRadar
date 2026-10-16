import type { NextConfig } from "next";

/**
 * M6 — separação entre build de produção e servidor de desenvolvimento:
 * - `next dev` usa o diretório padrão `.next`;
 * - `next build` / `next start` usam `.next-producao`.
 *
 * Assim, validar a produção nunca apaga nem corrompe o cache do servidor de
 * desenvolvimento (e vice-versa). `NEXT_DIST_DIR` permite sobrescrever ambos.
 */
const distDir =
  process.env.NEXT_DIST_DIR ??
  (process.env.NODE_ENV === "production" ? ".next-producao" : ".next");

const nextConfig: NextConfig = {
  // Permite importar o pacote workspace escrito em TypeScript.
  transpilePackages: ["@radar/shared"],
  reactStrictMode: true,
  distDir,
};

export default nextConfig;
