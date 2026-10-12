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

// Главная: собор проступает из темноты, когда гравюра уже загружена (анимация в global.css).
// Если идёт заставка, сцену запускает она в нужный момент.
const hero = document.querySelector(".hero");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
if (hero) {
  const img = hero.querySelector(".hero__cathedral img");
  let loaded = !img || (img.complete && img.naturalWidth);
  let wanted = !document.documentElement.dataset.intro;
  const start = () => { if (loaded && wanted) requestAnimationFrame(() => hero.classList.add("is-ready")); };
  hero.startScene = () => { wanted = true; start(); };
  if (!loaded) {
    const done = () => { loaded = true; start(); };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }
  start();

  // Фонарь и глубина: вокруг курсора гравюра светлее, а собор, туман и мышь чуть сдвигаются, каждый на своей глубине.
  // Всё плавно догоняет курсор, двигаем только transform. На телефоне и планшете курсора нет, там пятно стоит над шпилем.
  const lamp = hero.querySelector(".hero__lamp");
  const layers = [
    [hero.querySelector(".hero__cathedral"), 12, 8],
    [hero.querySelector(".hero__fog"), 30, 12],
    [hero.querySelector(".hero__bat"), 44, 26],
  ].filter(([el]) => el);
  if (lamp && finePointer) {
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
      if (!calm) {
        const [hx, hy] = home();
        const r = hero.getBoundingClientRect();
        const nx = (x - hx) / r.width, ny = (y - hy) / r.height;
        for (const [el, dx, dy] of layers) el.style.translate = `${(-nx * dx).toFixed(1)}px ${(-ny * dy).toFixed(1)}px`;
      }
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

  // Мышь живая: взмах крыльями при наведении и изредка сама по себе, по клику со звезды сыплются искры
  const bat = hero.querySelector(".hero__bat");
  if (bat && !calm) {
    const flap = () => {
      if (bat.classList.contains("is-flapping")) return;
      bat.classList.add("is-flapping");
      setTimeout(() => bat.classList.remove("is-flapping"), 950);
    };
    bat.addEventListener("pointerenter", flap);
    let idle = 0;
    const later = () => { clearTimeout(idle); idle = setTimeout(() => { if (!document.hidden && hero.classList.contains("is-ready")) flap(); later(); }, 7000 + Math.random() * 6000); };
    later();
    bat.addEventListener("click", () => {
      flap();
      const art = hero.querySelector(".hero__art").getBoundingClientRect();
      const b = bat.getBoundingClientRect();
      // Центр звезды в координатах рисунка мыши (viewBox 40 260 1490 910): 798, 447
      const sx = b.left - art.left + b.width * (798 - 40) / 1490;
      const sy = b.top - art.top + b.height * (447 - 260) / 910;
      for (let i = 0; i < 28; i++) {
        const s = document.createElement("span");
        s.className = i % 3 ? "spark" : "spark spark--bone";
        s.style.left = `${sx}px`; s.style.top = `${sy}px`;
        hero.querySelector(".hero__art").append(s);
        const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 170, k = 0.4 + Math.random() * 0.7;
        const ex = Math.cos(a) * d, ey = Math.sin(a) * d;
        s.animate([
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${ex * 0.7}px, ${ey * 0.7}px) scale(${k})`, opacity: 1, offset: 0.55 },
          { transform: `translate(${ex}px, ${ey + 60}px) scale(0.2)`, opacity: 0 },
        ], { duration: 800 + Math.random() * 600, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }).finished.then(() => s.remove());
      }
    });
  }
}

// Заставка при первом заходе за визит: «Свеча» или «Стая» (решение в <head> главной, data-intro на <html>)
const intro = document.querySelector(".intro");
const introKind = document.documentElement.dataset.intro;
if (intro && introKind && hero) {
  try { sessionStorage.setItem("rgc-intro", "1"); } catch (e) {}
  const root = document.documentElement;
  const timers = [];
  let raf = 0, finished = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const finish = (fast) => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    hero.startScene();
    hero.classList.add("bat-landed");
    root.classList.add("intro-done");
    intro.classList.add("is-gone");
    setTimeout(() => { intro.remove(); delete root.dataset.intro; root.classList.remove("intro-done"); }, fast ? 500 : 520);
    ["pointerdown", "keydown", "wheel", "touchmove"].forEach((t) => removeEventListener(t, skip, true));
  };
  const skip = () => finish(true);
  ["pointerdown", "keydown", "wheel", "touchmove"].forEach((t) => addEventListener(t, skip, { capture: true, passive: true }));

  if (introKind === "svecha") {
    // Радиус светлого круга растёт по плавной кривой и чуть дрожит, как от живого огня
    const dark = intro.querySelector(".intro__dark");
    const full = Math.hypot(innerWidth, innerHeight) * 0.75;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tick = (now) => {
      const t = now - t0;
      const glow = Math.min(1, Math.max(0, (t - 300) / 700)) * 46;
      const grow = ease(Math.min(1, Math.max(0, (t - 1100) / 1700)));
      const wobble = 1 + Math.sin(t / 90) * 0.03 + Math.sin(t / 37) * 0.015;
      dark.style.setProperty("--r", `${(glow + grow * full) * wobble}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    at(250, () => intro.classList.add("is-lit"));
    at(1200, () => { intro.classList.add("is-open"); hero.startScene(); });
    at(2900, () => finish(false));
  } else {
    // Стая: мыши кружат, разлетаются от центра; вожак летит на место мыши в шапке и становится ею
    hero.classList.add("from-flock");
    const canvas = intro.querySelector(".intro__flock");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = innerWidth, H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const source = hero.querySelector(".hero__bat");
    const vb = [40, 260, 1490, 910];
    const sprite = (w, withStar) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = Math.round(w * vb[3] / vb[2]);
      const g = c.getContext("2d");
      g.scale(w / vb[2], w / vb[2]);
      g.translate(-vb[0], -vb[1]);
      g.fillStyle = "#ece4d6";
      g.fill(new Path2D(source.querySelector(".bat__body").getAttribute("d")), "evenodd");
      if (withStar) { g.fillStyle = "#a3201f"; g.fill(new Path2D(source.querySelector(".bat__star").getAttribute("d")), "evenodd"); }
      return c;
    };
    const small = sprite(192, false);
    const big = sprite(Math.round(Math.min(900, source.getBoundingClientRect().width * dpr * 1.2)) || 600, true);
    const cx = W / 2, cy = H * 0.5;
    const n = Math.round(Math.min(170, Math.max(70, (W * H) / 9000)));
    const bats = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * Math.hypot(W, H) * 0.55;
      const depth = Math.random();
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, a, d, size: 22 + depth * depth * 110, alpha: 0.25 + depth * 0.75, phase: Math.random() * 6, speed: 0.016 + Math.random() * 0.012, out: 0.6 + Math.random() * 0.8 };
    });
    bats.sort((p, q) => p.size - q.size);
    const target = source.getBoundingClientRect();
    const leader = { x: cx, y: cy, w: 60 };
    const t0 = performance.now();
    const draw = (img, x, y, w, flapY, alpha, tilt) => {
      const h = w * img.height / img.width;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.scale(1, flapY);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };
    const tick = (now) => {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);
      const burst = Math.max(0, t - 650) / 1000;
      for (const b of bats) {
        b.a += 0.004 + 0.006 / (1 + b.d / 300);
        const r = b.d + burst * burst * 900 * b.out;
        const x = cx + Math.cos(b.a) * r, y = cy + Math.sin(b.a) * r * 0.8 - burst * 120;
        b.phase += b.speed * 16;
        draw(small, x, y, b.size, 0.45 + 0.55 * Math.abs(Math.sin(b.phase)), b.alpha, Math.sin(b.a) * 0.25);
      }
      // Вожак: из центра стаи к мыши в шапке, взмахи затихают перед посадкой
      const p = Math.min(1, Math.max(0, (t - 500) / 1700));
      const e = 1 - Math.pow(1 - p, 3);
      const tx = target.left + target.width / 2, ty = target.top + target.height / 2;
      leader.x = cx + (tx - cx) * e + Math.sin(p * Math.PI) * -120;
      leader.y = cy + (ty - cy) * e - Math.sin(p * Math.PI) * 80;
      leader.w = 70 + (target.width - 70) * e;
      const settle = 1 - e * 0.9;
      draw(big, leader.x, leader.y, leader.w, 1 - settle * 0.45 * Math.abs(Math.sin(t / 70)), 1, 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    at(700, () => { intro.classList.add("is-open"); hero.startScene(); });
    at(2250, () => finish(false));
  }
}

// Эскизы на главной: рама наклоняется к курсору, перевод проявляется чернилами при наведении.
// На телефоне наведения нет, там чернила проступают, когда рама целиком попала на экран.
document.querySelectorAll(".sketch").forEach((card) => {
  if (!card.querySelector(".framed--stencil")) return;
  if (finePointer && !calm) {
    const framed = card.querySelector(".framed");
    card.dataset.tilt = "";
    card.addEventListener("pointermove", (e) => {
      const r = framed.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      framed.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
      framed.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      framed.style.setProperty("--ry", "0deg");
      framed.style.setProperty("--rx", "0deg");
    });
  }
  if (!finePointer && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setTimeout(() => card.classList.add("is-inked"), 700); io.disconnect(); }
    }, { threshold: 0.85 });
    io.observe(card.querySelector(".framed"));
  }
});

// Примерка: эскиз на гравюре Аполлона. Размер в сантиметрах переводим в % ширины листа:
// рост 180 см занимает 83,5 % высоты листа 1000 × 1419, у картинок эскизов поля около 6 %.
const tryon = document.querySelector("[data-tryon]");
if (tryon) {
  const sheet = tryon.querySelector(".tryon__sheet");
  const ink = tryon.querySelector(".tryon__ink");
  const range = tryon.querySelector(".tryon__range");
  const nameOut = tryon.querySelector("[data-tryon-name]");
  const cmOut = tryon.querySelector("[data-tryon-cm]");
  const book = tryon.querySelector("[data-tryon-book]");
  const PCT_PER_CM = (0.835 * 1419) / 180 / 10 * 1.06;
  let cm = Number(range.value);
  const fit = () => {
    const ratio = ink.naturalWidth && ink.naturalHeight ? ink.naturalWidth / ink.naturalHeight : 1;
    ink.style.setProperty("--w", (cm * PCT_PER_CM * Math.min(1, ratio)).toFixed(2));
    cmOut.textContent = cm;
  };
  if (ink.complete) fit(); else ink.addEventListener("load", fit, { once: true });
  range.addEventListener("input", () => { cm = Number(range.value); fit(); });

  const press = (group, button) => group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
  tryon.querySelector(".tryon__sketches").addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button || button.getAttribute("aria-pressed") === "true") return;
    press(e.currentTarget, button);
    ink.classList.add("is-swapping");
    setTimeout(() => {
      ink.addEventListener("load", () => { fit(); ink.classList.remove("is-swapping"); }, { once: true });
      cm = Number(button.dataset.cm); range.value = cm;
      ink.src = button.dataset.img;
    }, 250);
    nameOut.textContent = button.dataset.name;
    book.href = book.href.replace(/eskiz=[^&]*/, `eskiz=${button.dataset.slug}`);
  });
  tryon.querySelector(".tryon__places").addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    press(e.currentTarget, button);
    ink.style.setProperty("--x", `${button.dataset.x}%`);
    ink.style.setProperty("--y", `${button.dataset.y}%`);
    ink.style.setProperty("--a", `${button.dataset.angle}deg`);
  });

  // Перетаскивание: центр эскиза держим внутри листа
  const move = (x, y) => {
    ink.style.setProperty("--x", `${Math.min(97, Math.max(3, x)).toFixed(2)}%`);
    ink.style.setProperty("--y", `${Math.min(97, Math.max(3, y)).toFixed(2)}%`);
  };
  let grab = null;
  ink.addEventListener("pointerdown", (e) => {
    const r = sheet.getBoundingClientRect();
    const cx = parseFloat(ink.style.getPropertyValue("--x")) || parseFloat(getComputedStyle(ink).getPropertyValue("--x"));
    const cy = parseFloat(ink.style.getPropertyValue("--y")) || parseFloat(getComputedStyle(ink).getPropertyValue("--y"));
    grab = { dx: (e.clientX - r.left) / r.width * 100 - cx, dy: (e.clientY - r.top) / r.height * 100 - cy };
    ink.setPointerCapture(e.pointerId);
    ink.classList.add("is-dragging");
  });
  ink.addEventListener("pointermove", (e) => {
    if (!grab) return;
    const r = sheet.getBoundingClientRect();
    move((e.clientX - r.left) / r.width * 100 - grab.dx, (e.clientY - r.top) / r.height * 100 - grab.dy);
  });
  const drop = () => { grab = null; ink.classList.remove("is-dragging"); };
  ink.addEventListener("pointerup", drop);
  ink.addEventListener("pointercancel", drop);
  ink.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 3 : 0.75;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    const cs = getComputedStyle(ink);
    move(parseFloat(cs.getPropertyValue("--x")) + d[0], parseFloat(cs.getPropertyValue("--y")) + d[1]);
  });
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
