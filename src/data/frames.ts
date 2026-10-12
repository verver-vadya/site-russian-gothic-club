// Рамы для эскизов: эскизы рам XVIII века из Метрополитен-музея (CC0, см. CREDITS.md),
// переведены в белую линию с прозрачным фоном. opening — где внутри рамы лежит бумага,
// в процентах от рамы: сверху, справа, снизу, слева (бумага чуть заходит под резьбу).
export const frames = {
  rococo: { src: "frame-rococo-800.webp", width: 800, height: 1114, opening: [18.5, 16.5, 12.5, 17.5] },
  eagle: { src: "frame-eagle-800.webp", width: 800, height: 1224, opening: [21.5, 16, 16.5, 15] },
  mask: { src: "frame-mask-800.webp", width: 800, height: 1050, opening: [17, 18.5, 35, 18.5] },
} as const;
export type FrameName = keyof typeof frames;
