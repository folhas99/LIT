export type Locale = "pt" | "en";

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALES: Locale[] = ["pt", "en"];
export const LOCALE_COOKIE = "lit_locale";

type Dict = Record<string, string>;

const pt: Dict = {
  // Navigation
  "nav.home": "Home",
  "nav.events": "Eventos",
  "nav.gallery": "Galeria",
  "nav.reservations": "Reservas VIP",
  "nav.about": "Sobre",
  "nav.contact": "Contacto",
  "nav.menu.open": "Abrir menu",
  "nav.menu.close": "Fechar menu",

  // Footer
  "footer.navigation": "Navegação",
  "footer.info": "Informação",
  "footer.rights": "Todos os direitos reservados.",
  "footer.tagline": "A tua nova casa.",

  // Common
  "common.loading": "A carregar...",
  "common.close": "Fechar",
  "common.next": "Seguinte",
  "common.prev": "Anterior",
  "common.readMore": "Ler mais",
  "common.download": "Download",
  "common.share": "Partilhar",
  "common.linkCopied": "Link copiado",

  // Hero
  "hero.reserveCta": "Reservar Mesa",
  "hero.eventsCta": "Ver Eventos",

  // Events
  "events.title": "Eventos",
  "events.upcoming": "Próximos eventos",
  "events.past": "Eventos passados",
  "events.none": "Sem eventos agendados.",
  "events.nextEvent": "Próximo evento",
  "events.started": "Começou!",

  // Gallery
  "gallery.title": "Galeria",
  "gallery.none": "Sem fotos disponíveis.",

  // Reservations
  "reservations.title": "Reserva VIP",
  "reservations.submit": "Enviar pedido",

  // Contact
  "contact.title": "Contacto",
  "contact.send": "Enviar mensagem",

  // Opening hours
  "hours.open": "Aberto",
  "hours.openNow": "Aberto agora",
  "hours.closed": "Fechado",
  "hours.closesAt": "fecha às",
  "hours.opens": "abre",
  "hours.today": "hoje",
  "hours.tomorrow": "amanhã",

  // Countdown
  "countdown.days": "Dias",
  "countdown.hours": "Horas",
  "countdown.minutes": "Min",
  "countdown.seconds": "Seg",
};

const en: Dict = {
  // Navigation
  "nav.home": "Home",
  "nav.events": "Events",
  "nav.gallery": "Gallery",
  "nav.reservations": "VIP Reservations",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.menu.open": "Open menu",
  "nav.menu.close": "Close menu",

  // Footer
  "footer.navigation": "Navigation",
  "footer.info": "Info",
  "footer.rights": "All rights reserved.",
  "footer.tagline": "Your new home.",

  // Common
  "common.loading": "Loading...",
  "common.close": "Close",
  "common.next": "Next",
  "common.prev": "Previous",
  "common.readMore": "Read more",
  "common.download": "Download",
  "common.share": "Share",
  "common.linkCopied": "Link copied",

  // Hero
  "hero.reserveCta": "Book a Table",
  "hero.eventsCta": "See Events",

  // Events
  "events.title": "Events",
  "events.upcoming": "Upcoming events",
  "events.past": "Past events",
  "events.none": "No events scheduled.",
  "events.nextEvent": "Next event",
  "events.started": "Started!",

  // Gallery
  "gallery.title": "Gallery",
  "gallery.none": "No photos available.",

  // Reservations
  "reservations.title": "VIP Reservation",
  "reservations.submit": "Submit request",

  // Contact
  "contact.title": "Contact",
  "contact.send": "Send message",

  // Opening hours
  "hours.open": "Open",
  "hours.openNow": "Open now",
  "hours.closed": "Closed",
  "hours.closesAt": "closes at",
  "hours.opens": "opens",
  "hours.today": "today",
  "hours.tomorrow": "tomorrow",

  // Countdown
  "countdown.days": "Days",
  "countdown.hours": "Hours",
  "countdown.minutes": "Min",
  "countdown.seconds": "Sec",
};

const DICTS: Record<Locale, Dict> = { pt, en };

export function translate(locale: Locale, key: string): string {
  return DICTS[locale]?.[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
}

export function getDictionary(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}
