import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// O React Testing Library não limpa o DOM automaticamente dentro do Vitest.
// Sem isto, renderizações de testes anteriores vazam e geram "múltiplos elementos".
afterEach(() => {
  cleanup();
});
