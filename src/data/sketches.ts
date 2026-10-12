// Свободные эскизы. Каждый набивается один раз; после брони отметка «Занят».
// img — гравюра из public/assets/img (без расширения и размера), bat — летучая мышь из src/data/bat.ts
export const sketches = [
  { slug: "striga", name: "Стрига", img: "stryge", size: "18 × 24 см", place: "плечо, бедро", price: 32000, taken: false },
  { slug: "nochnaya-mysh", name: "Ночная мышь", bat: true, size: "14 × 9 см", place: "грудь, ключицы", price: 15000, taken: true },
  { slug: "kyoln", name: "Кёльн ночью", img: "cathedral-card", size: "20 × 26 см", place: "спина, бедро", price: 38000, taken: false },
];
