// Адрес внутри сайта с учётом корня (на превью сайт живёт в /site-kare/)
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path: string) => base + path;

// Деньги по-русски: 13 000 ₽ с неразрывными пробелами
export const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;
