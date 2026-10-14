import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite importar o pacote workspace escrito em TypeScript.
  transpilePackages: ["@radar/shared"],
  reactStrictMode: true,
};

export default nextConfig;
