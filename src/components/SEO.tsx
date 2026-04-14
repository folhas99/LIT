import Script from "next/script";

type LocalBusinessProps = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  url: string;
  image?: string;
  schedule?: string;
  instagram?: string;
  facebook?: string;
};

export function LocalBusinessJsonLd({
  name,
  description,
  address,
  phone,
  email,
  url,
  image,
  schedule,
  instagram,
  facebook,
}: LocalBusinessProps) {
  const sameAs = [instagram, facebook].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name,
    description,
    url,
    ...(image && { image }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Coimbra",
      addressCountry: "PT",
      streetAddress: address,
    },
    ...(schedule && { openingHours: schedule }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <Script
      id="jsonld-local-business"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type EventJsonLdProps = {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  image?: string;
  url: string;
  lineup?: string[];
  location: {
    name: string;
    address: string;
  };
  offers?: {
    url: string;
    price?: string;
    priceCurrency?: string;
    availability?: "InStock" | "SoldOut" | "PreOrder";
    validFrom?: string;
  };
};

export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  image,
  url,
  lineup,
  location,
  offers,
}: EventJsonLdProps) {
  const performers = (lineup || [])
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ "@type": "PerformingGroup", name: p }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name,
    ...(description && { description }),
    startDate,
    ...(endDate && { endDate }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(image && { image: Array.isArray(image) ? image : [image] }),
    url,
    location: {
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address,
        addressLocality: "Coimbra",
        addressRegion: "Coimbra",
        addressCountry: "PT",
      },
    },
    organizer: {
      "@type": "Organization",
      name: location.name,
      url,
    },
    ...(performers.length > 0 && { performer: performers }),
    offers: {
      "@type": "Offer",
      url: offers?.url || url,
      price: offers?.price || "0",
      priceCurrency: offers?.priceCurrency || "EUR",
      availability: `https://schema.org/${offers?.availability || "InStock"}`,
      validFrom: offers?.validFrom || new Date().toISOString(),
    },
  };

  return (
    <Script
      id={`jsonld-event-${name.toLowerCase().replace(/\s/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd({ name, url, description }: { name: string; url: string; description: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/eventos?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="jsonld-website"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
