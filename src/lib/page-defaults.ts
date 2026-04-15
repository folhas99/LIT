/**
 * Default section layouts for system pages.
 *
 * Shared between:
 *  - `prisma/seed.ts` (fresh install — seeds only empty pages)
 *  - `prisma/reseed-system-pages.ts` (manual destructive reseed)
 *  - `POST /api/pages/[slug]/reseed` (admin "Restaurar layout default")
 *
 * Keeps this module free of Prisma / Node-only deps so it can be imported
 * by server routes without pulling in the whole DB layer.
 */

export type DefaultSection = {
  type: string;
  content: Record<string, unknown>;
  order: number;
  spacing?: Record<string, unknown>;
};

export const SYSTEM_PAGE_SLUGS = [
  "homepage",
  "eventos",
  "galeria",
  "reservas",
  "sobre",
  "contacto",
] as const;

export type SystemPageSlug = (typeof SYSTEM_PAGE_SLUGS)[number];

export function isSystemPageSlug(slug: string): slug is SystemPageSlug {
  return (SYSTEM_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function defaultSectionsFor(slug: string): DefaultSection[] {
  switch (slug) {
    /* ============================================================== */
    /* HOMEPAGE                                                        */
    /* ============================================================== */
    case "homepage":
      return [
        {
          type: "hero_home",
          content: {},
          order: 0,
          spacing: { fullBleed: true },
        },
        {
          type: "next_event_countdown",
          content: {},
          order: 1,
          spacing: { paddingTop: 80, paddingBottom: 80 },
        },
        {
          type: "stats",
          content: {
            items: [
              { value: 5, label: "Anos a brilhar", labelEn: "Years shining", suffix: "+", duration: 1500 },
              { value: 200, label: "Noites épicas", labelEn: "Epic nights", suffix: "+", duration: 1500 },
              { value: 50, label: "DJs convidados", labelEn: "Guest DJs", suffix: "+", duration: 1500 },
              { value: 30, label: "Mil pessoas", labelEn: "Thousand guests", suffix: "k+", duration: 1500 },
            ],
          },
          order: 2,
          spacing: {
            paddingTop: 80,
            paddingBottom: 80,
            bgColor: "#0a1f0f",
            animation: "fadeIn",
          },
        },
        {
          type: "events_preview",
          content: { limit: 4 },
          order: 3,
          spacing: { paddingTop: 80, paddingBottom: 80 },
        },
        {
          type: "icon_box",
          content: {
            title: "Porquê o LIT?",
            titleEn: "Why LIT?",
            intro: "Mais do que uma discoteca. Uma experiência.",
            introEn: "More than a club. An experience.",
            columns: 3,
            layout: "centered",
            items: [
              {
                icon: "music",
                title: "Música de Autor",
                titleEn: "Curated Music",
                text: "Line-ups com os melhores nomes nacionais e internacionais.",
                textEn: "Line-ups with the best national and international names.",
              },
              {
                icon: "sparkles",
                title: "Atmosfera Única",
                titleEn: "Unique Atmosphere",
                text: "Um espaço onde a natureza encontra a noite.",
                textEn: "Where nature meets the night.",
              },
              {
                icon: "crown",
                title: "Experiência VIP",
                titleEn: "VIP Experience",
                text: "Mesa reservada, garrafa premium e serviço dedicado.",
                textEn: "Reserved table, premium bottle and dedicated service.",
              },
            ],
          },
          order: 4,
          spacing: {
            paddingTop: 96,
            paddingBottom: 96,
            animation: "slideUp",
          },
        },
        {
          type: "galleries_preview",
          content: { limit: 6 },
          order: 5,
          spacing: { paddingTop: 80, paddingBottom: 80 },
        },
        {
          type: "pricing",
          content: {
            title: "Reserva a tua mesa",
            titleEn: "Book your table",
            intro: "Vive a noite ao teu ritmo. Escolhe a experiência.",
            introEn: "Live the night your way. Pick your experience.",
            columns: 2,
            items: [
              {
                name: "Standard",
                nameEn: "Standard",
                price: "€150",
                priceLabel: "/ mesa",
                priceLabelEn: "/ table",
                description: "Para grupos pequenos.",
                descriptionEn: "For small groups.",
                features: ["Mesa para 4 pessoas", "Garrafa de boas-vindas", "Entrada prioritária"],
                featuresEn: ["Table for 4", "Welcome bottle", "Priority entry"],
                ctaText: "Reservar",
                ctaTextEn: "Book",
                ctaLink: "/reservas",
                highlight: false,
                badge: "",
                badgeEn: "",
              },
              {
                name: "VIP",
                nameEn: "VIP",
                price: "€350",
                priceLabel: "/ mesa",
                priceLabelEn: "/ table",
                description: "A experiência completa.",
                descriptionEn: "The full experience.",
                features: [
                  "Mesa para 6 pessoas",
                  "2 garrafas premium",
                  "Zona reservada com vista",
                  "Atendimento dedicado",
                ],
                featuresEn: [
                  "Table for 6",
                  "2 premium bottles",
                  "Reserved area with view",
                  "Dedicated service",
                ],
                ctaText: "Reservar VIP",
                ctaTextEn: "Book VIP",
                ctaLink: "/reservas",
                highlight: true,
                badge: "Mais popular",
                badgeEn: "Most popular",
              },
            ],
          },
          order: 6,
          spacing: {
            paddingTop: 96,
            paddingBottom: 96,
            bgColor: "#0a1f0f",
            animation: "slideUp",
          },
        },
        {
          type: "contact_cta",
          content: {},
          order: 7,
          spacing: { paddingTop: 80, paddingBottom: 80 },
        },
      ];

    /* ============================================================== */
    /* EVENTOS                                                         */
    /* ============================================================== */
    case "eventos":
      return [
        {
          type: "page_header",
          content: {
            title: "Eventos",
            titleEn: "Events",
            subtitle: "Todas as noites no LIT.",
            subtitleEn: "Every night at LIT.",
          },
          order: 0,
          spacing: { paddingTop: 96, paddingBottom: 32 },
        },
        {
          type: "events_grid",
          content: {},
          order: 1,
          spacing: { paddingBottom: 96 },
        },
        {
          type: "accordion",
          content: {
            title: "Perguntas frequentes",
            titleEn: "Frequently asked",
            intro: "Tudo o que precisas de saber antes de vires.",
            introEn: "Everything you need to know before you come.",
            items: [
              {
                question: "Há dress code?",
                questionEn: "Is there a dress code?",
                answer: "<p>Sim. Pedimos look cuidado — sem roupa desportiva nem chinelos.</p>",
                answerEn: "<p>Yes. Smart casual — no sportswear or flip-flops.</p>",
              },
              {
                question: "Posso reservar mesa para um evento específico?",
                questionEn: "Can I book a table for a specific event?",
                answer: '<p>Claro! Vai à <a href="/reservas">página de reservas</a> e escolhe o evento.</p>',
                answerEn: '<p>Of course! Visit the <a href="/reservas">reservations page</a> and pick the event.</p>',
              },
              {
                question: "Qual a idade mínima?",
                questionEn: "What is the minimum age?",
                answer: "<p>+18 com identificação válida.</p>",
                answerEn: "<p>18+ with valid ID.</p>",
              },
            ],
          },
          order: 2,
          spacing: { paddingTop: 64, paddingBottom: 96, bgColor: "#0a1f0f" },
        },
      ];

    /* ============================================================== */
    /* GALERIA                                                         */
    /* ============================================================== */
    case "galeria":
      return [
        {
          type: "page_header",
          content: {
            title: "Galeria",
            titleEn: "Gallery",
            subtitle: "Momentos de cada noite.",
            subtitleEn: "Memories from every night.",
            accent: "purple",
          },
          order: 0,
          spacing: { paddingTop: 96, paddingBottom: 32 },
        },
        {
          type: "galleries_grid",
          content: {},
          order: 1,
          spacing: { paddingBottom: 96 },
        },
      ];

    /* ============================================================== */
    /* RESERVAS                                                        */
    /* ============================================================== */
    case "reservas":
      return [
        {
          type: "page_header",
          content: {
            title: "Reservas VIP",
            titleEn: "VIP Reservations",
            subtitle: "Reserva a tua mesa e garante uma experiência exclusiva.",
            subtitleEn: "Book your table for an exclusive experience.",
            accent: "gold",
          },
          order: 0,
          spacing: { paddingTop: 96, paddingBottom: 32 },
        },
        {
          type: "pricing",
          content: {
            title: "Pacotes disponíveis",
            titleEn: "Available packages",
            intro: "Escolhe o pacote certo para a tua noite.",
            introEn: "Pick the right package for your night.",
            columns: 3,
            items: [
              {
                name: "Standard",
                nameEn: "Standard",
                price: "€150",
                priceLabel: "/ mesa",
                priceLabelEn: "/ table",
                description: "Para grupos até 4 pessoas.",
                descriptionEn: "For groups up to 4.",
                features: ["Mesa para 4 pessoas", "Garrafa de boas-vindas", "Entrada prioritária"],
                featuresEn: ["Table for 4", "Welcome bottle", "Priority entry"],
                ctaText: "Reservar",
                ctaTextEn: "Book",
                ctaLink: "#form",
                highlight: false,
                badge: "",
                badgeEn: "",
              },
              {
                name: "VIP",
                nameEn: "VIP",
                price: "€350",
                priceLabel: "/ mesa",
                priceLabelEn: "/ table",
                description: "Para grupos até 6 pessoas.",
                descriptionEn: "For groups up to 6.",
                features: [
                  "Mesa para 6 pessoas",
                  "2 garrafas premium",
                  "Zona reservada com vista",
                  "Atendimento dedicado",
                ],
                featuresEn: [
                  "Table for 6",
                  "2 premium bottles",
                  "Reserved area with view",
                  "Dedicated service",
                ],
                ctaText: "Reservar",
                ctaTextEn: "Book",
                ctaLink: "#form",
                highlight: true,
                badge: "Popular",
                badgeEn: "Popular",
              },
              {
                name: "Premium",
                nameEn: "Premium",
                price: "€700",
                priceLabel: "/ mesa",
                priceLabelEn: "/ table",
                description: "A experiência definitiva.",
                descriptionEn: "The ultimate experience.",
                features: [
                  "Mesa para 10 pessoas",
                  "Garrafas premium ilimitadas*",
                  "Zona privada",
                  "Host pessoal",
                  "Saída dedicada",
                ],
                featuresEn: [
                  "Table for 10",
                  "Unlimited premium bottles*",
                  "Private area",
                  "Personal host",
                  "Dedicated exit",
                ],
                ctaText: "Reservar",
                ctaTextEn: "Book",
                ctaLink: "#form",
                highlight: false,
                badge: "",
                badgeEn: "",
              },
            ],
          },
          order: 1,
          spacing: { paddingBottom: 64 },
        },
        {
          type: "heading",
          content: {
            text: "Faz a tua reserva",
            textEn: "Make your reservation",
            level: "h2",
            align: "center",
            size: "lg",
            decoration: true,
          },
          order: 2,
          spacing: { paddingTop: 32, paddingBottom: 16, anchorId: "form" },
        },
        {
          type: "reservation_form",
          content: { showEventSelector: true, showHeader: false },
          order: 3,
          spacing: { paddingBottom: 64 },
        },
        {
          type: "accordion",
          content: {
            title: "Perguntas sobre reservas",
            titleEn: "Booking FAQ",
            intro: "",
            introEn: "",
            items: [
              {
                question: "Como confirmo a minha reserva?",
                questionEn: "How is my booking confirmed?",
                answer: "<p>Após o envio do pedido, entramos em contacto por email ou telefone para confirmar disponibilidade e detalhes.</p>",
                answerEn: "<p>After you submit, we'll reach out by email or phone to confirm availability and details.</p>",
              },
              {
                question: "Posso cancelar?",
                questionEn: "Can I cancel?",
                answer: "<p>Sim, com pelo menos 24h de antecedência. Cancelamentos posteriores podem implicar penalização.</p>",
                answerEn: "<p>Yes, with at least 24h notice. Later cancellations may incur a fee.</p>",
              },
              {
                question: "A quanto tempo de antecedência devo reservar?",
                questionEn: "How far in advance should I book?",
                answer: "<p>Para noites populares e eventos especiais, recomendamos 1–2 semanas. Para outras noites, 2–3 dias chega.</p>",
                answerEn: "<p>For popular nights and special events, we recommend 1–2 weeks. Other nights, 2–3 days is fine.</p>",
              },
            ],
          },
          order: 4,
          spacing: { paddingTop: 64, paddingBottom: 96, bgColor: "#0a1f0f" },
        },
      ];

    /* ============================================================== */
    /* SOBRE                                                           */
    /* ============================================================== */
    case "sobre":
      return [
        {
          type: "page_header",
          content: {
            title: "Sobre",
            titleEn: "About",
            subtitle: "A tua nova casa em Coimbra.",
            subtitleEn: "Your new home in Coimbra.",
          },
          order: 0,
          spacing: { paddingTop: 96, paddingBottom: 32 },
        },
        {
          type: "text",
          content: {
            title: "A nossa história",
            titleEn: "Our story",
            body: '<p>O <strong>LIT Coimbra</strong> é o espaço onde a noite ganha vida. Um ambiente único onde a música, as pessoas e a energia se encontram para criar noites inesquecíveis.</p><p>Inspirado pela natureza e pela essência da vida noturna, o LIT é a tua nova casa em Coimbra. Um espaço decorado com elementos naturais que cria uma atmosfera acolhedora e ao mesmo tempo vibrante.</p>',
            bodyEn: '<p><strong>LIT Coimbra</strong> is where the night comes to life. A unique atmosphere where music, people and energy meet to create unforgettable nights.</p><p>Inspired by nature and the essence of nightlife, LIT is your new home in Coimbra. A space decorated with natural elements that creates a welcoming yet vibrant atmosphere.</p>',
            alignment: "left",
          },
          order: 1,
          spacing: { paddingBottom: 64 },
        },
        {
          type: "stats",
          content: {
            items: [
              { value: 5, label: "Anos a brilhar", labelEn: "Years shining", suffix: "+", duration: 1500 },
              { value: 200, label: "Noites épicas", labelEn: "Epic nights", suffix: "+", duration: 1500 },
              { value: 50, label: "DJs convidados", labelEn: "Guest DJs", suffix: "+", duration: 1500 },
              { value: 30, label: "Mil pessoas", labelEn: "Thousand guests", suffix: "k+", duration: 1500 },
            ],
          },
          order: 2,
          spacing: {
            paddingTop: 64,
            paddingBottom: 64,
            bgColor: "#0a1f0f",
            animation: "fadeIn",
          },
        },
        {
          type: "tabs",
          content: {
            title: "Conhece o LIT",
            titleEn: "Get to know LIT",
            intro: "",
            introEn: "",
            layout: "horizontal",
            items: [
              {
                label: "História",
                labelEn: "History",
                body: "<p>Nascemos em Coimbra com a missão de criar um espaço noturno diferente — onde a curadoria musical, o serviço e o ambiente trabalham em conjunto para criar memórias.</p>",
                bodyEn: "<p>We were born in Coimbra with a mission to create a different kind of nightlife space — one where music curation, service and atmosphere work together to create memories.</p>",
              },
              {
                label: "Espaço",
                labelEn: "Space",
                body: "<p>Inspirado pela selva tropical: plantas, luzes mornas e materiais naturais. Uma zona principal de pista, mezzanine VIP e bar central.</p>",
                bodyEn: "<p>Inspired by the tropical jungle: plants, warm lights and natural materials. A main dance floor, VIP mezzanine and central bar.</p>",
              },
              {
                label: "Filosofia",
                labelEn: "Philosophy",
                body: "<p>A noite faz-se de pessoas. Cada detalhe do LIT — da música à luz, do serviço à decoração — existe para que tu te sintas em casa.</p>",
                bodyEn: "<p>The night is about people. Every detail of LIT — from the music to the lights, from service to decor — exists so that you feel at home.</p>",
              },
            ],
          },
          order: 3,
          spacing: { paddingTop: 64, paddingBottom: 64, animation: "slideUp" },
        },
        {
          type: "icon_box",
          content: {
            title: "O que nos define",
            titleEn: "What defines us",
            intro: "",
            introEn: "",
            columns: 3,
            layout: "centered",
            items: [
              {
                icon: "music",
                title: "Som de qualidade",
                titleEn: "Quality sound",
                text: "Sistema áudio premium e residentes que mudam a noite.",
                textEn: "Premium audio system and residents who change the night.",
              },
              {
                icon: "sparkles",
                title: "Detalhe estético",
                titleEn: "Aesthetic detail",
                text: "Cada zona pensada para criar uma experiência imersiva.",
                textEn: "Every area designed to create an immersive experience.",
              },
              {
                icon: "users",
                title: "Comunidade",
                titleEn: "Community",
                text: "Pessoas que partilham o gosto pela noite bem feita.",
                textEn: "People who share a love for nightlife done right.",
              },
            ],
          },
          order: 4,
          spacing: { paddingTop: 64, paddingBottom: 64 },
        },
        {
          type: "info_cards",
          content: {
            title: "Informações úteis",
            titleEn: "Useful info",
            columns: 3,
            items: [
              { icon: "mapPin", title: "Morada", titleEn: "Address", text: "Coimbra, Portugal", textEn: "Coimbra, Portugal" },
              { icon: "clock", title: "Horário", titleEn: "Hours", text: "Qua–Sáb · 23:00 – 06:00", textEn: "Wed–Sat · 11:00 PM – 6:00 AM" },
              { icon: "crown", title: "Reservas VIP", titleEn: "VIP Bookings", text: "Mesa reservada à distância de um clique.", textEn: "Book your table in one click.", link: "/reservas" },
            ],
          },
          order: 5,
          spacing: { paddingBottom: 48 },
        },
        {
          type: "button_group",
          content: {
            align: "center",
            layout: "row",
            buttons: [
              { label: "Ver eventos", labelEn: "See events", link: "/eventos", style: "primary", icon: "calendar" },
              { label: "Reservar mesa", labelEn: "Book a table", link: "/reservas", style: "secondary", icon: "crown" },
            ],
          },
          order: 6,
          spacing: { paddingTop: 16, paddingBottom: 96 },
        },
      ];

    /* ============================================================== */
    /* CONTACTO                                                        */
    /* ============================================================== */
    case "contacto":
      return [
        {
          type: "page_header",
          content: {
            title: "Contacto",
            titleEn: "Contact",
            subtitle: "Fala connosco.",
            subtitleEn: "Get in touch.",
          },
          order: 0,
          spacing: { paddingTop: 96, paddingBottom: 32 },
        },
        {
          type: "contact_info",
          content: {},
          order: 1,
          spacing: { paddingBottom: 48 },
        },
        {
          type: "contact_form",
          content: { title: "Envia-nos uma mensagem", titleEn: "Send us a message" },
          order: 2,
          spacing: { paddingBottom: 48 },
        },
        {
          type: "contact_map",
          content: {},
          order: 3,
          spacing: { paddingBottom: 64 },
        },
        {
          type: "accordion",
          content: {
            title: "Perguntas frequentes",
            titleEn: "Frequently asked",
            intro: "",
            introEn: "",
            items: [
              {
                question: "Aceitam pedidos para eventos privados?",
                questionEn: "Do you host private events?",
                answer: '<p>Sim. Envia-nos uma mensagem com a data e a tua ideia e respondemos com proposta.</p>',
                answerEn: '<p>Yes. Send us a message with the date and your idea and we will reply with a proposal.</p>',
              },
              {
                question: "Trabalham com fornecedores e bandas?",
                questionEn: "Do you work with vendors and live acts?",
                answer: '<p>Adoramos descobrir novos artistas. Manda-nos um link com o teu trabalho.</p>',
                answerEn: '<p>We love discovering new artists. Send us a link with your work.</p>',
              },
              {
                question: "Onde fica a entrada?",
                questionEn: "Where is the entrance?",
                answer: "<p>A entrada principal fica na morada indicada acima. Há sinalética visível.</p>",
                answerEn: "<p>The main entrance is at the address above. Look for the signage.</p>",
              },
            ],
          },
          order: 4,
          spacing: { paddingTop: 32, paddingBottom: 96, bgColor: "#0a1f0f" },
        },
      ];

    default:
      return [];
  }
}
