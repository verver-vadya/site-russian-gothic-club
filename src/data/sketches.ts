import type { FrameName } from "./frames";
// Свободные эскизы. Каждый набивается один раз; после брони отметка «Занят».
// img — эскиз на бумаге из public/assets/img, bat — летучая мышь из src/data/bat.ts.
// land — горизонтальный эскиз (рама поворачивается), styles — для фильтра на странице «Эскизы»,
// author — эскиз приглашённого мастера (подпись и ссылка под карточкой), home — показывать на главной.
export type Sketch = {
  slug: string; name: string; img?: string; bat?: boolean; frame?: FrameName; land?: boolean;
  styles: string[]; red?: boolean; author?: keyof typeof authors; home?: boolean;
  size: string; place: string; price: number; taken: boolean;
};

export const authors = {
  temnova: { name: "temnova tattoo", href: "https://www.instagram.com/bliiinpoliiin/" },
};

// Фильтр на странице «Эскизы»
export const sketchFilters = [
  { value: "", label: "Все" },
  { value: "realizm", label: "Реализм" },
  { value: "gravyura", label: "Гравюра" },
  { value: "blackwork", label: "Блэкворк и орнамент" },
  { value: "dark-art", label: "Тёмное искусство" },
  { value: "red", label: "Красным" },
];

export const sketches: Sketch[] = [
  { slug: "pes-so-strelami", name: "Пёс со стрелами", img: "temnova-krasnyy-pes-strely-800.webp", styles: ["realizm", "dark-art"], red: true, author: "temnova", home: true, size: "14 × 30 см", place: "предплечье, голень", price: 28000, taken: false },
  { slug: "nochnaya-mysh", name: "Ночная мышь", bat: true, styles: ["blackwork"], home: true, size: "14 × 9 см", place: "грудь, ключицы", price: 15000, taken: true },
  { slug: "pyat-klinkov", name: "Пёс и пять клинков", img: "temnova-krasnyy-pes-mechi-800.webp", styles: ["realizm", "dark-art"], red: true, author: "temnova", size: "15 × 30 см", place: "спина вдоль позвоночника", price: 30000, taken: true },
  { slug: "polumesyacy", name: "Полумесяцы", img: "gr-polumesyacy-800.webp", land: true, styles: ["blackwork"], size: "5 элементов по 3–8 см", place: "запястья, пальцы, шея", price: 12000, taken: false },
  { slug: "krasnaya-borzaya", name: "Красная борзая", img: "temnova-krasnaya-borzaya-800.webp", styles: ["realizm"], red: true, author: "temnova", size: "12 × 28 см", place: "предплечье, икра", price: 26000, taken: false },
  { slug: "grifon", name: "Грифон", img: "gr-grifon-800.webp", styles: ["gravyura"], red: true, home: true, size: "18 × 20 см", place: "бедро, плечо", price: 26000, taken: false },
  { slug: "cerber", name: "Цербер", img: "temnova-psy-tri-golovy-800.webp", styles: ["realizm", "dark-art"], author: "temnova", size: "15 × 30 см", place: "предплечье, бедро", price: 34000, taken: false },
  { slug: "podves", name: "Подвес", img: "gr-podves-800.webp", styles: ["blackwork"], size: "20 × 24 см", place: "грудина, солнечное сплетение", price: 24000, taken: false },
  { slug: "gonchaya-anatomiya", name: "Гончая. Анатомия", img: "gr-gonchaya-anatomiya-800.webp", land: true, styles: ["gravyura"], red: true, size: "24 × 17 см", place: "бедро, бок", price: 30000, taken: false },
  { slug: "doberman", name: "Доберман", img: "temnova-doberman-800.webp", land: true, styles: ["realizm"], author: "temnova", size: "25 × 20 см", place: "бедро, бок", price: 32000, taken: false },
  { slug: "bestiariy", name: "Бестиарий", img: "gr-siluety-800.webp", styles: ["blackwork"], size: "12 фигур по 3–6 см", place: "рассыпью по руке или ноге", price: 18000, taken: false },
  { slug: "past", name: "Пасть", img: "temnova-past-800.webp", styles: ["realizm"], author: "temnova", size: "18 × 17 см", place: "икра, плечо", price: 22000, taken: false },
  { slug: "voroniy-oval", name: "Вороний овал", img: "gr-oval-vorony-800.webp", styles: ["blackwork"], size: "16 × 18 см", place: "лопатка, бедро", price: 20000, taken: false },
  { slug: "dve-pasti", name: "Две пасти", img: "temnova-dve-pasti-800.webp", styles: ["realizm", "dark-art"], author: "temnova", size: "18 × 18 см", place: "плечо, бедро", price: 25000, taken: false },
  { slug: "pavlinoglazka", name: "Павлиноглазка", img: "gr-motylek-800.webp", land: true, styles: ["gravyura"], red: true, size: "16 × 8 см", place: "грудь, шея", price: 14000, taken: false },
  { slug: "dve-borzye", name: "Две борзые", img: "temnova-dve-borzye-800.webp", styles: ["realizm"], author: "temnova", size: "16 × 24 см", place: "предплечье, бедро", price: 27000, taken: false },
  { slug: "ornament-s-orlami", name: "Орнамент с орлами", img: "gr-ornament-orly-800.webp", land: true, styles: ["blackwork"], size: "24 × 19 см", place: "грудь", price: 28000, taken: false },
];
