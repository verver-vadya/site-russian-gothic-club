// Данные студии в одном месте: всё, что повторяется на нескольких страницах.
export const site = {
  name: "Russian Gothic Club",
  tagline: "тату-студия",
  city: "Москва",
  address: "Подкопаевский переулок, 4, подвал",
  metro: "«Китай-город», 6 минут пешком",
  hours: "Ежедневно 12:00–22:00, по записи",
  telegram: "russiangothicclub",
};

// Меню в шапке. «Записаться» отдельной кнопкой
export const nav = [
  { href: "/raboty/", label: "Работы" },
  { href: "/eskizy/", label: "Эскизы" },
  { href: "/mastera/", label: "Мастера" },
  { href: "/ceny/", label: "Цены и сеанс" },
  { href: "/uhod/", label: "Уход" },
  { href: "/studiya/", label: "Студия" },
  { href: "/kontakty/", label: "Контакты" },
];

// Стили студии: на главной списком, в «Работах» фильтром
export const styles = [
  { slug: "gravyura", name: "Гравюра", note: "Тонкая штриховка, как в старых книгах: соборы, звери, анатомия" },
  { slug: "blackwork", name: "Blackwork", note: "Плотная чёрная заливка и орнамент, читается издалека" },
  { slug: "dark-art", name: "Dark art", note: "Сюжетные мрачные сцены: вампиры, гаргульи, ночные пейзажи" },
  { slug: "lettering", name: "Готический леттеринг", note: "Надписи фрактурой и текстурой, латиницей и кириллицей" },
];
