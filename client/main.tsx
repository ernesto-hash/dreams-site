import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root")!;

// api/dose/[slug].ts serves a hand-written HTML snapshot for crawlers/link
// previews that doesn't match the React tree — marked with data-ssr="light"
// so we do a clean client render here instead of hydrating mismatched markup.
const isLightSnapshot = rootElement.dataset.ssr === "light";

if (rootElement.hasChildNodes() && !isLightSnapshot) {
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  if (isLightSnapshot) rootElement.innerHTML = "";
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
