import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Simulado DETRAN",
    short_name: "DETRAN",
    description: "Simulado para a prova teorica do DETRAN.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
