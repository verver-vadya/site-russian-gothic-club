// Рамы для эскизов: эскизы рам XVIII века из Метрополитен-музея (CC0, см. CREDITS.md),
// переведены в белую линию с прозрачным фоном. opening — где внутри рамы лежит бумага,
// в процентах от рамы: сверху, справа, снизу, слева (бумага чуть заходит под резьбу).
export const frames = {
  rococo: { src: "frame-rococo-800.webp", width: 800, height: 1114, opening: [18.5, 16.5, 12.5, 17.5] },
  eagle: { src: "frame-eagle-800.webp", width: 800, height: 1224, opening: [21.5, 16, 16.5, 15] },
  mask: { src: "frame-mask-800.webp", width: 800, height: 1050, opening: [17, 18.5, 35, 18.5] },
} as const;
// Деревянные и золочёные рамы: фото рам XVI–XIX веков из Метрополитен-музея (CC0), фон вырезан.
// Та же раскладка, что у рам выше: ключ — какую раму-гравюру заменяет. round — овальное окно.
export const woodFrames: Record<FrameName, { src: string; width: number; height: number; opening: number[]; round?: boolean }> = {
  mask: { src: "frame-wood-crest-800.webp", width: 800, height: 982, opening: [37.7, 24.2, 16.9, 25.9] },
  rococo: { src: "frame-wood-gilt-800.webp", width: 800, height: 923, opening: [13.3, 16.2, 15.2, 15.8] },
  eagle: { src: "frame-wood-oval-800.webp", width: 800, height: 1092, opening: [34.6, 30.7, 25, 30.7], round: true },
};

// Одна прямоугольная рама на все эскизы. gilt — резная золочёная рама ок. 1700 г. в ч/б,
// black — та же рама, тонированная в чёрное, ebony — голландская рама из чёрного дерева XVII века.
const single = (src: string, height: number, opening: number[]) => ({ mask: { src, width: 800, height, opening }, rococo: { src, width: 800, height, opening }, eagle: { src, width: 800, height, opening } });
const giltOpening = [13.3, 16.2, 15.2, 15.8];
export const singleFrames = {
  gilt: single("frame-gilt-bw-800.webp", 923, giltOpening),
  black: single("frame-gilt-black-800.webp", 923, giltOpening),
  ebony: single("frame-ebony-800.webp", 977, [20, 25, 21.3, 24.5]),
};
// Та же рама из чёрного дерева, повёрнутая для горизонтальных эскизов
export const ebonyLand = { src: "frame-ebony-land-800.webp", width: 800, height: 655, opening: [25, 21.3, 24.5, 20] };

// Как выглядят рамы: "line" — белая линия прямо на тёмной стене, "sheet" — старый лист с рамой тёмными чернилами,
// "wood" — три разные деревянные рамы, "gilt" / "black" / "ebony" — одна прямоугольная рама на все эскизы
export type FrameLook = "line" | "sheet" | "wood" | keyof typeof singleFrames;
export const frameLook: FrameLook = import.meta.env.FRAME_LOOK || "ebony";
export type FrameName = keyof typeof frames;
