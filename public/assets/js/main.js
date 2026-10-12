// Без этого Safari на iPhone не показывает нажатие (:active) на кнопках и ссылках
document.addEventListener("touchstart", () => {}, { passive: true });

// Мобильное меню: закрывается кнопкой, по ссылке, по Esc и по клику вне меню
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const label = toggle.querySelector(".nav-toggle__label") || toggle;
  // Иконка «бургер ↔ крестик» перетекает через <morph-icon> (assets/js/icons.js).
  // Если модуль не загрузился, иконка просто остаётся бургером, меню работает.
  const icon = toggle.querySelector("morph-icon");
  const ICON_MENU = "M4 5h16M4 12h16M4 19h16";
  const ICON_CLOSE = "M18 6 6 18M6 6l12 12";
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    // Шапка поверх фото на главной: у открытого меню свой фон
    toggle.closest(".site-header")?.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Закрыть" : "Меню";
    if (icon) icon.setAttribute("icon", open ? ICON_CLOSE : ICON_MENU);
  };
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
}

// Главная: собор проступает из темноты, когда гравюра уже загружена (анимация в global.css)
const hero = document.querySelector(".hero");
if (hero) {
  const img = hero.querySelector(".hero__cathedral img");
  const ready = () => requestAnimationFrame(() => hero.classList.add("is-ready"));
  if (!img || (img.complete && img.naturalWidth)) ready();
  else {
    img.addEventListener("load", ready, { once: true });
    img.addEventListener("error", ready, { once: true });
  }

  // Фонарь: вокруг курсора гравюра светлее. Пятно плавно догоняет курсор, двигаем только transform.
  // На телефоне и планшете курсора нет, там пятно стоит над шпилем.
  const lamp = hero.querySelector(".hero__lamp");
  if (lamp && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0;
    const home = () => {
      const r = hero.getBoundingClientRect();
      const spot = lamp.dataset.home?.split(",").map(Number) || [0.7, 0.3];
      return [r.width * spot[0], r.height * spot[1]];
    };
    [tx, ty] = home(); x = tx; y = ty;
    const draw = () => {
      x += (tx - x) * (calm ? 1 : 0.09);
      y += (ty - y) * (calm ? 1 : 0.09);
      lamp.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(draw) : 0;
    };
    const aim = (nx, ny) => { tx = nx; ty = ny; if (!frame) frame = requestAnimationFrame(draw); };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      aim(e.clientX - r.left, e.clientY - r.top);
    });
    hero.addEventListener("pointerleave", () => aim(...home()));
    addEventListener("resize", () => aim(...home()));
    lamp.classList.add("is-live");
    draw();
  }
}

// Текущий год в подвале (в HTML тоже вписан год на случай, если скрипт не загрузится)
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Окно-шторка: <dialog class="sheet" id="…">, открывает кнопка с aria-controls="…" и aria-haspopup="dialog".
// Закрывается кнопкой [data-close], по Esc и кликом по затемнению, всегда с анимацией.
// Фокус при открытии на заголовке окна, а не на «Закрыть»: на телефоне у кнопки не появляется рамка.
document.querySelectorAll("dialog.sheet").forEach((sheet) => {
  if (typeof sheet.showModal !== "function") return;
  const openers = document.querySelectorAll(`[aria-controls="${sheet.id}"]`);
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  let opener = null;
  let closing = false;
  let afterClose = null;

  const open = async (button) => {
    if (sheet.open) return;
    opener = button;
    const title = sheet.querySelector(".sheet__title");
    if (title) { title.tabIndex = -1; title.autofocus = true; }
    sheet.querySelector(".sheet__body")?.scrollTo(0, 0);
    sheet.classList.remove("is-closing");
    sheet.showModal();
    document.documentElement.classList.add("has-sheet");
    // Самый тяжёлый кадр (окно встаёт поверх страницы) проходит без движения, выезд начинается через два кадра:
    // так ни один кадр анимации не теряется
    await nextFrame();
    await nextFrame();
    if (sheet.open) sheet.classList.add("is-open");
  };

  const close = () => {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.add("is-closing");
    sheet.classList.remove("is-open");
    const duration = parseFloat(getComputedStyle(sheet).getPropertyValue("--duration-sheet-out")) || 320;
    setTimeout(() => {
      closing = false;
      sheet.close();
    }, duration);
  };

  openers.forEach((button) => button.addEventListener("click", () => open(button)));
  sheet.addEventListener("click", (e) => {
    // Ссылка на раздел страницы внутри окна: сначала окно уезжает, потом страница листается к разделу
    const link = e.target.closest('a[href^="#"][data-close]');
    if (link) {
      e.preventDefault();
      afterClose = () => {
        document.querySelector(link.hash)?.scrollIntoView();
        history.replaceState(null, "", link.hash);
      };
    }
    if (e.target.closest("[data-close]") || !e.target.closest(".sheet__panel")) close();
  });
  sheet.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  sheet.addEventListener("close", () => {
    sheet.classList.remove("is-open", "is-closing");
    document.documentElement.classList.remove("has-sheet");
    if (afterClose) { afterClose(); afterClose = null; }
    else opener?.focus({ preventScroll: true });
  });
});

// Запись: услуга и мастер приходят в адресе (/zapis/?usluga=kare&master=anna-vetrova) со страниц услуг,
// мастеров и работ. Под выбором показываем цену у выбранного мастера.
const bookingForm = document.querySelector("[data-booking]");
if (bookingForm) {
  const { service, master, date } = bookingForm.elements;
  const params = new URLSearchParams(location.search);
  const pick = (select, value) => {
    const option = value && [...(select?.options || [])].find((o) => o.dataset.id === value);
    if (option) option.selected = true;
  };
  pick(service, params.get("usluga"));
  pick(master, params.get("master"));

  const priceNote = bookingForm.querySelector(".booking__price");
  const money = (n) => `${n.toLocaleString("ru-RU")} ₽`;
  const levels = ["стилиста", "ведущего стилиста", "арт-директора"];
  const showPrice = () => {
    const option = service.selectedOptions[0];
    const prices = option?.dataset.prices?.split(",").map(Number);
    if (!prices) { priceNote.hidden = true; return; }
    const from = option.dataset.from ? "от " : "";
    const level = master.selectedOptions[0]?.dataset.level;
    if (prices[0] === 0) priceNote.textContent = "Бесплатно.";
    else if (level !== undefined) priceNote.textContent = `Цена у ${levels[level]}: ${from}${money(prices[level])}.`;
    else if (prices[0] === prices[2]) priceNote.textContent = `Цена: ${from}${money(prices[0])}.`;
    else priceNote.textContent = `Цена: ${from}${money(prices[0])} у стилиста, ${from}${money(prices[2])} у арт-директора.`;
    priceNote.hidden = false;
  };
  service.addEventListener("change", showPrice);
  master.addEventListener("change", showPrice);
  showPrice();

  // Записаться можно с сегодняшнего дня; дата по местному времени, а не UTC
  if (date) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    date.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}

// Фильтр карточек (мастера по услуге, работы по рубрике): кнопки с aria-pressed, у карточек data-groups
document.querySelectorAll("[data-filter]").forEach((bar) => {
  const list = bar.parentElement.querySelector("[data-filter-list]");
  if (!list) return;
  bar.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-value]");
    if (!button) return;
    bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    const value = button.dataset.value;
    [...list.children].forEach((card) => {
      card.classList.toggle("is-hidden", Boolean(value) && !card.dataset.groups.split(" ").includes(value));
    });
  });
});
