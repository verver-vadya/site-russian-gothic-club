# Источники графики и шрифтов

## Гравюры (общественное достояние)
- Кёльнский собор, хор: гравюра по рисунку для серии Уильяма Томблсона «Views of the Rhine», 1830-е. Wikimedia Commons, файл `Tombleson Cologne Cathedral.jpg`, Public domain. Инвертирована для первого экрана: `public/assets/img/cathedral-*.webp`; на светлой бумаге: `paper-cathedral-800.webp`.
- Шарль Мерион, «Стрига (Вампир)», офорт, 1853. National Gallery of Art, Wikimedia Commons, файл `Charles Meryon, The Vampire, 1853.jpg`, Public domain. На светлой бумаге: `public/assets/img/paper-stryge-800.webp`.

## Рамы для эскизов (The Metropolitan Museum of Art, Open Access, CC0)
- «Design for a Frame», 1750–88, объект 335803: `frame-rococo-800.webp`.
- «Design for a frame with Eagles and Trophies», 1750–88, объект 335805: `frame-eagle-800.webp`.
- «Design for a frame», ок. 1750, объект 389934: `frame-mask-800.webp`.
Переведены в белую линию на прозрачном фоне, убраны сгибы листа и наклейки.

## Деревянные рамы (The Metropolitan Museum of Art, Open Access, CC0)
- Tabernacle-рама, начало XVI века, объект 461313: `frame-wood-crest-800.webp`.
- Золочёная резная рама, ок. 1700–1720, объект 460398: `frame-wood-gilt-800.webp`, в ч/б `frame-gilt-bw-800.webp`, тонированная в чёрное `frame-gilt-black-800.webp`.
- Рама из чёрного дерева с рифлёным профилем, объект 461304: `frame-ebony-800.webp` (фон и окно вырезаны, синеватый оттенок убран).
- Овальная рама, 1870, объект 208087: `frame-wood-oval-800.webp`.
Фон вырезан.

## Эскизы приглашённого мастера
- temnova tattoo (Instagram [@bliiinpoliiin](https://www.instagram.com/bliiinpoliiin/)): `temnova-*-800.webp`, 8 эскизов. Используются в концепте с разрешения автора (договорился verver, 12.10.2026). Вырезаны из скриншотов постов, фон приведён к цвету бумаги. Для реального клиента нужно письменное разрешение и исходники.

## Эскизы из старых гравюр (The Metropolitan Museum of Art, Open Access, CC0)
Переведены в одну краску (чёрную `#16110e` или красную `#b2121a`) на бумаге `#e9e0cf`, файлы `gr-*-800.webp`.
- Чарльз Ландсир, экорше гончей, 1821, объект 421662: `gr-gonchaya-anatomiya`.
- Вирджил Солис, борзая, 1549, объект 345072: `gr-borzaya-solis`.
- Мартин Шонгауэр: святой Себастьян (360044) `gr-sebastian`, искушение святого Антония (336142) `gr-antoniy-demony`, грифон (336196) `gr-grifon`, Георгий и змей (367016) `gr-georgiy`.
- Альбрехт Дюрер: герб с черепом, 1503 (336220) `gr-gerb-s-cherepom`; носорог, 1515 (356497) `gr-nosorog`.
- Вацлав Холлар: мотыльки и бабочки, 1646 (361543, 361545) `gr-mertvaya-golova`, `gr-motylek`; герб смерти из «Пляски смерти» (361674) `gr-gerb-smerti`.
- Блэкворк-орнаменты XVI–XVII веков: Клас Янс Виссхер (419990, 419989) `gr-polumesyacy`, `gr-oval-vorony`; Ханс де Булл (425404) `gr-podves`; Йонас Бентцен (424847) `gr-siluety`; Георг Арнольдт (424826) `gr-ornament-orly`.

## Временная графика
- Летучая мышь со звездой (`src/data/bat.ts`): референс, который прислал verver, найден в интернете, автор неизвестен. Переведена в кривые для прототипа. **Перед показом клиенту или публикацией заменить своей графикой** (Gemini по промптам из плана).

## Шрифты (SIL Open Font License, файлы лицензий рядом со шрифтами)
- Cormorant Garamond: заголовки (`src/fonts/`).
- Old Standard TT: основной текст (`src/fonts/`).
- UnifrakturMaguntia: только логотип, переведён в кривые (`tools/wordmark.py`, лицензия `tools/OFL-UnifrakturMaguntia.txt`); сам шрифт сайт не загружает.
