# Russian Gothic Club

Концепт сайта вымышленной тату-студии в Москве: гравюра, blackwork, dark art и готика. Тёмный многостраничный сайт на [Astro](https://astro.build): ночной фон, гравюры белой линией, красные акценты цвета запёкшейся крови. Тексты на русском.

Превью: https://verver-vadya.github.io/site-russian-gothic-club/ (после включения Pages).

## Запустить у себя

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # готовый сайт в папке dist
npm run check    # сборка и автопроверка (ссылки, кнопки, вёрстка 320–2560 px и др.)
```

## Опубликовать

Превью собирается и выкладывается на GitHub Pages само при каждом пуше в `main` (`.github/workflows/pages.yml`). Включить один раз: **Settings → Pages → Source: GitHub Actions**. Боевой адрес и хостинг выбираем отдельно, для аудитории в России это российский хостинг.

## Где что лежит

- `src/pages/` страницы, `src/components/` шапка, подвал, логотип, летучая мышь.
- `src/data/site.ts` адрес, часы, меню и стили; `src/data/sketches.ts` свободные эскизы.
- `src/styles/global.css` все цвета, шрифты, отступы и анимации (переменные в `:root`).
- `public/assets/img/` гравюры, `public/assets/js/main.js` меню, появление первого экрана и фонарь у курсора.
- Источники графики и шрифтов: `CREDITS.md`.
