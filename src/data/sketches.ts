import type { FrameName } from "./frames";
// Свободные эскизы. Каждый набивается один раз; после брони отметка «Занят».
// img — гравюра на бумаге из public/assets/img, bat — летучая мышь из src/data/bat.ts
export const sketches: { slug: string; name: string; img?: string; bat?: boolean; frame: FrameName; size: string; place: string; price: number; taken: boolean }[] = [
  { slug: "striga", name: "Стрига", img: "paper-stryge-800.webp", frame: "mask", size: "18 × 24 см", place: "плечо, бедро", price: 32000, taken: false },
  { slug: "nochnaya-mysh", name: "Ночная мышь", bat: true, frame: "rococo", size: "14 × 9 см", place: "грудь, ключицы", price: 15000, taken: true },
  { slug: "kyoln", name: "Кёльн ночью", img: "paper-cathedral-800.webp", frame: "eagle", size: "20 × 26 см", place: "спина, бедро", price: 38000, taken: false },
];
