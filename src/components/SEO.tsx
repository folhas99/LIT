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
  location: {
    name: string;
    address: string;
  };
};

export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  image,
  url,
  location,
}: EventJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    ...(description && { description }),
    startDate,
    ...(endDate && { endDate }),
    ...(image && { image }),
    url,
    location: {
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address,
        addressLocality: "Coimbra",
        addressCountry: "PT",
      },
    },
    organizer: {
      "@type": "Organization",
      name: location.name,
      url,
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
