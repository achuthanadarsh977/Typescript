import { loadCompanies, buildIndex, LogisticsCompany } from "./data/excelLoader";

const companies = loadCompanies();
const index     = buildIndex();

// ── Intent detection ──────────────────────────────────────────────────────────

export type Intent =
  | { kind: "phone";    phone: string }
  | { kind: "count";    city: string }
  | { kind: "stats" }
  | { kind: "list";     city: string; service: string; coverage: string; limit: number }
  | { kind: "llm";      query: string };

export function detectIntent(raw: string): Intent {
  const q = raw.toLowerCase().trim();

  // Phone number
  const phoneMatch = raw.match(/\b\d{10}\b/);
  if (phoneMatch) return { kind: "phone", phone: phoneMatch[0] };

  // Stats / summary
  if (/^(show dataset summary|summary|statistics|overview|total companies|dataset)$/i.test(q))
    return { kind: "stats" };

  // Count
  if (/how many|count|total.*(compan|transport|logistics)/i.test(q)) {
    const city = extractCity(q);
    return { kind: "count", city };
  }

  // Everything else — list query
  const city    = extractCity(q);
  const service = extractService(q);
  const rawCov  = extractCoverage(q);
  // If the same word was matched as both city and coverage, it means "companies IN [city]",
  // not "companies covering [city]" — drop coverage to avoid double-filtering.
  const coverage = (city && rawCov === city) ? "" : rawCov;

  // If nothing matched, fall back to LLM for conversational questions
  if (!city && !service && !coverage) {
    const isConversational = /what|why|how|explain|difference|best|suggest|recommend|tell me/i.test(q);
    if (isConversational) return { kind: "llm", query: raw };
  }

  const limitMatch = raw.match(/\b(top|first|show)\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[2]) : 15;

  return { kind: "list", city, service, coverage, limit };
}

// ── Direct answer builders (no LLM) ──────────────────────────────────────────

export function answerPhone(phone: string): string {
  const c = index.byPhone.get(phone);
  if (!c) return `❌ No company found with phone number **${phone}**.`;
  return formatCard(c);
}

export function answerCount(city: string): string {
  if (!city) {
    return `📊 **Total companies in database: ${companies.length}**\n\nBreakdown by top cities:\n` +
      [...index.byCity.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
        .map(([, v]) => `• ${v[0].city}: **${v.length}** companies`)
        .join("\n");
  }
  const results = getCityCompanies(city);
  if (results.length === 0) return `❌ No companies found in **${city}**. Try: ${index.allCities.slice(0, 8).join(", ")}`;
  return `📊 **${results.length} companies** found in **${results[0].city}**`;
}

export function answerStats(): string {
  const topCities = [...index.byCity.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  return [
    `📦 **Gujarat Logistics Database**`,
    ``,
    `• **Total Companies :** ${companies.length.toLocaleString()}`,
    `• **Cities Covered  :** ${index.allCities.length}`,
    `• **Service Types   :** ${index.allServices.length}`,
    ``,
    `**Top Cities:**`,
    ...topCities.map(([, v]) => `• ${v[0].city} — ${v.length} companies`),
  ].join("\n");
}

export function answerList(city: string, service: string, coverage: string, limit: number): string {
  let results = companies;

  if (city)     results = results.filter(c => c.city.toLowerCase().includes(city));
  if (service)  results = results.filter(c => c.serviceType.toLowerCase().includes(service));
  if (coverage) results = results.filter(c => c.coverage.toLowerCase().includes(coverage));

  // Full-text fallback if all filters found nothing
  if (results.length === 0) {
    results = fullTextSearch(city || service || coverage, 15);
  }

  if (results.length === 0)
    return `❌ No companies found matching your query.\n\nTry: "Full load in Ahmedabad", "Parcel service in Surat", "Companies covering Delhi"`;

  const shown = results.slice(0, limit);
  const total = results.length;

  const heading = buildHeading(city, service, coverage, total, results);
  const cards   = shown.map((c, i) => `**${i + 1}. ${c.companyName}**\n📞 ${c.phoneNumbers}\n📍 ${c.city} | ${c.serviceType}\n🚚 Covers: ${c.coverage}`).join("\n\n");
  const footer  = total > limit ? `\n\n_Showing ${limit} of ${total}. Ask "show more" or narrow your search._` : "";

  return `${heading}\n\n${cards}${footer}`;
}

// ── LLM context builder (for conversational fallback) ─────────────────────────

export function buildLlmContext(query: string): string {
  const q = query.toLowerCase();
  const city     = extractCity(q);
  const service  = extractService(q);
  const coverage = extractCoverage(q);

  let results = companies;
  if (city)     results = results.filter(c => c.city.toLowerCase().includes(city));
  if (service)  results = results.filter(c => c.serviceType.toLowerCase().includes(service));
  if (coverage) results = results.filter(c => c.coverage.toLowerCase().includes(coverage));
  if (results.length === companies.length) results = fullTextSearch(q, 10);

  const top = results.slice(0, 8);
  return top.length > 0
    ? `Found ${results.length} relevant companies. Top results:\n\n` + top.map(formatCard).join("\n\n")
    : `No direct matches. Dataset has ${companies.length} companies in cities: ${index.allCities.slice(0, 10).join(", ")}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractCity(q: string): string {
  const cities = index.allCities.map(c => c.toLowerCase());
  // longest match first
  const sorted = cities.slice().sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    if (q.includes(c)) return c;
  }
  // partial
  for (const c of sorted) {
    const parts = c.split(/[\s,/()]+/).filter(p => p.length > 3);
    if (parts.some(p => q.includes(p))) return c;
  }
  return "";
}

function extractService(q: string): string {
  const map: [string, string][] = [
    ["full load",   "full load"],
    ["ftl",         "full load"],
    ["part load",   "part load"],
    ["parcel",      "parcel"],
    ["courier",     "parcel"],
    ["odc",         "odc"],
    ["trailer",     "trailer"],
    ["f/p",         "full"],
  ];
  for (const [kw, label] of map) {
    if (q.includes(kw)) return label;
  }
  return "";
}

function extractCoverage(q: string): string {
  const dests = [
    "delhi", "mumbai", "bangalore", "bengaluru", "chennai", "kolkata",
    "hyderabad", "pune", "jaipur", "rajasthan", "bhiwandi", "gurgaon",
    "lucknow", "assam", "guwahati", "baroda", "surat", "rajkot",
    "ahmedabad", "vadodara", "gandhidham", "morbi", "vapi", "ankleshwar",
  ];
  for (const d of dests) {
    if (q.includes(d)) return d;
  }
  return "";
}

function getCityCompanies(city: string): LogisticsCompany[] {
  const key = city.toLowerCase();
  if (index.byCity.has(key)) return index.byCity.get(key)!;
  const result: LogisticsCompany[] = [];
  for (const [k, v] of index.byCity) {
    if (k.includes(key) || key.includes(k)) result.push(...v);
  }
  return result;
}

function fullTextSearch(query: string, limit: number): LogisticsCompany[] {
  const terms = query.split(/\s+/).filter(t => t.length > 2);
  return companies
    .map(c => {
      const text = `${c.companyName} ${c.city} ${c.serviceType} ${c.address} ${c.coverage}`.toLowerCase();
      const score = terms.filter(t => text.includes(t)).length;
      return { c, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.c);
}

function buildHeading(city: string, service: string, coverage: string, total: number, results: LogisticsCompany[]): string {
  const cityLabel    = city    ? results[0]?.city ?? city : "";
  const serviceLabel = service ? `**${service}** service` : "";
  const covLabel     = coverage ? `covering **${coverage}**` : "";
  const parts        = [serviceLabel, cityLabel ? `in **${cityLabel}**` : "", covLabel].filter(Boolean);
  return `✅ Found **${total} companies** ${parts.join(" ")}:`;
}

function formatCard(c: LogisticsCompany): string {
  return [
    `**${c.companyName}**`,
    `📞 ${c.phoneNumbers}`,
    `📍 ${c.city} | ${c.serviceType}`,
    `🏠 ${c.address}`,
    `🚚 Covers: ${c.coverage}`,
  ].join("\n");
}
