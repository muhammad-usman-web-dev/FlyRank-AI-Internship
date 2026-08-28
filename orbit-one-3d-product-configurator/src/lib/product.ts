export const PRODUCT_COLORS = [
  { name: "Graphite", value: "#17191d" },
  { name: "Cobalt", value: "#2563eb" },
  { name: "Sage", value: "#6b806f" },
  { name: "Sand", value: "#c7ad86" },
] as const;

export type ProductColor = (typeof PRODUCT_COLORS)[number]["value"];
