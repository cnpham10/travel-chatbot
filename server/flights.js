/**
 * Mock US domestic flight inventory + intent parsing for the chat API.
 * Flights-only OTA — static sample data for demo / structured extras.
 */

const AIRPORTS = [
  { code: "SFO", city: "San Francisco", name: "San Francisco International Airport" },
  { code: "JFK", city: "New York", name: "John F. Kennedy International Airport" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles International Airport" },
  { code: "ORD", city: "Chicago", name: "O'Hare International Airport" },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson Atlanta International Airport" },
  { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth International Airport" },
  { code: "SEA", city: "Seattle", name: "Seattle-Tacoma International Airport" },
  { code: "DEN", city: "Denver", name: "Denver International Airport" },
  { code: "BOS", city: "Boston", name: "Logan International Airport" },
  { code: "MIA", city: "Miami", name: "Miami International Airport" },
  { code: "EWR", city: "Newark", name: "Newark Liberty International Airport" },
  { code: "LGA", city: "New York", name: "LaGuardia Airport" },
  { code: "IAD", city: "Washington", name: "Washington Dulles International Airport" },
  { code: "DCA", city: "Washington", name: "Ronald Reagan Washington National Airport" },
  { code: "PHX", city: "Phoenix", name: "Phoenix Sky Harbor International Airport" },
  { code: "LAS", city: "Las Vegas", name: "Harry Reid International Airport" },
  { code: "MSP", city: "Minneapolis", name: "Minneapolis–Saint Paul International Airport" },
  { code: "DTW", city: "Detroit", name: "Detroit Metropolitan Wayne County Airport" },
  { code: "CLT", city: "Charlotte", name: "Charlotte Douglas International Airport" },
  { code: "PHL", city: "Philadelphia", name: "Philadelphia International Airport" },
];

const CITY_SYNONYMS = {
  "san francisco": "SFO",
  "sf": "SFO",
  "bay area": "SFO",
  "new york": "JFK",
  "nyc": "JFK",
  "ny": "JFK",
  "manhattan": "JFK",
  "los angeles": "LAX",
  "la": "LAX",
  "chicago": "ORD",
  "atlanta": "ATL",
  "dallas": "DFW",
  "fort worth": "DFW",
  "seattle": "SEA",
  "denver": "DEN",
  "boston": "BOS",
  "miami": "MIA",
  "newark": "EWR",
  "washington": "DCA",
  "dc": "DCA",
  "phoenix": "PHX",
  "las vegas": "LAS",
  "vegas": "LAS",
};

const VALID_CODES = new Set(AIRPORTS.map((a) => a.code));

/** @type {Array<Omit<import('./flights.types').Flight, never>>} */
const INVENTORY = [
  // SFO → JFK
  {
    id: "ua-415-sfo-jfk",
    airline: "United",
    flightNumber: "UA415",
    from: "SFO",
    to: "JFK",
    departAt: "2026-09-18T08:15:00-07:00",
    arriveAt: "2026-09-18T16:45:00-04:00",
    durationMinutes: 330,
    stops: 0,
    cabin: "economy",
    priceUsd: 289,
  },
  {
    id: "aa-18-sfo-jfk",
    airline: "American",
    flightNumber: "AA18",
    from: "SFO",
    to: "JFK",
    departAt: "2026-09-18T11:30:00-07:00",
    arriveAt: "2026-09-18T20:10:00-04:00",
    durationMinutes: 340,
    stops: 0,
    cabin: "economy",
    priceUsd: 312,
  },
  {
    id: "dl-901-sfo-jfk",
    airline: "Delta",
    flightNumber: "DL901",
    from: "SFO",
    to: "JFK",
    departAt: "2026-09-18T14:00:00-07:00",
    arriveAt: "2026-09-18T23:55:00-04:00",
    durationMinutes: 415,
    stops: 1,
    cabin: "economy",
    priceUsd: 241,
  },
  {
    id: "ua-415b-sfo-jfk",
    airline: "United",
    flightNumber: "UA415",
    from: "SFO",
    to: "JFK",
    departAt: "2026-09-18T08:15:00-07:00",
    arriveAt: "2026-09-18T16:45:00-04:00",
    durationMinutes: 330,
    stops: 0,
    cabin: "business",
    priceUsd: 890,
  },
  // LAX → ORD
  {
    id: "aa-240-lax-ord",
    airline: "American",
    flightNumber: "AA240",
    from: "LAX",
    to: "ORD",
    departAt: "2026-09-19T07:00:00-07:00",
    arriveAt: "2026-09-19T13:05:00-05:00",
    durationMinutes: 245,
    stops: 0,
    cabin: "economy",
    priceUsd: 198,
  },
  {
    id: "ua-1508-lax-ord",
    airline: "United",
    flightNumber: "UA1508",
    from: "LAX",
    to: "ORD",
    departAt: "2026-09-19T12:45:00-07:00",
    arriveAt: "2026-09-19T18:55:00-05:00",
    durationMinutes: 250,
    stops: 0,
    cabin: "economy",
    priceUsd: 215,
  },
  {
    id: "aa-240p-lax-ord",
    airline: "American",
    flightNumber: "AA240",
    from: "LAX",
    to: "ORD",
    departAt: "2026-09-19T07:00:00-07:00",
    arriveAt: "2026-09-19T13:05:00-05:00",
    durationMinutes: 245,
    stops: 0,
    cabin: "premium",
    priceUsd: 378,
  },
  // ATL → DFW
  {
    id: "dl-1120-atl-dfw",
    airline: "Delta",
    flightNumber: "DL1120",
    from: "ATL",
    to: "DFW",
    departAt: "2026-09-20T09:20:00-04:00",
    arriveAt: "2026-09-20T10:45:00-05:00",
    durationMinutes: 145,
    stops: 0,
    cabin: "economy",
    priceUsd: 164,
  },
  {
    id: "aa-1288-atl-dfw",
    airline: "American",
    flightNumber: "AA1288",
    from: "ATL",
    to: "DFW",
    departAt: "2026-09-20T15:10:00-04:00",
    arriveAt: "2026-09-20T16:40:00-05:00",
    durationMinutes: 150,
    stops: 0,
    cabin: "economy",
    priceUsd: 179,
  },
  {
    id: "dl-1120b-atl-dfw",
    airline: "Delta",
    flightNumber: "DL1120",
    from: "ATL",
    to: "DFW",
    departAt: "2026-09-20T09:20:00-04:00",
    arriveAt: "2026-09-20T10:45:00-05:00",
    durationMinutes: 145,
    stops: 0,
    cabin: "business",
    priceUsd: 520,
  },
  // SEA → DEN
  {
    id: "as-640-sea-den",
    airline: "Alaska",
    flightNumber: "AS640",
    from: "SEA",
    to: "DEN",
    departAt: "2026-09-21T06:30:00-07:00",
    arriveAt: "2026-09-21T10:05:00-06:00",
    durationMinutes: 155,
    stops: 0,
    cabin: "economy",
    priceUsd: 142,
  },
  {
    id: "ua-532-sea-den",
    airline: "United",
    flightNumber: "UA532",
    from: "SEA",
    to: "DEN",
    departAt: "2026-09-21T13:15:00-07:00",
    arriveAt: "2026-09-21T16:50:00-06:00",
    durationMinutes: 155,
    stops: 0,
    cabin: "economy",
    priceUsd: 155,
  },
  {
    id: "as-640p-sea-den",
    airline: "Alaska",
    flightNumber: "AS640",
    from: "SEA",
    to: "DEN",
    departAt: "2026-09-21T06:30:00-07:00",
    arriveAt: "2026-09-21T10:05:00-06:00",
    durationMinutes: 155,
    stops: 0,
    cabin: "premium",
    priceUsd: 268,
  },
  // BOS → MIA
  {
    id: "jet-904-bos-mia",
    airline: "JetBlue",
    flightNumber: "B6904",
    from: "BOS",
    to: "MIA",
    departAt: "2026-09-22T08:00:00-04:00",
    arriveAt: "2026-09-22T11:25:00-04:00",
    durationMinutes: 205,
    stops: 0,
    cabin: "economy",
    priceUsd: 187,
  },
  {
    id: "aa-1735-bos-mia",
    airline: "American",
    flightNumber: "AA1735",
    from: "BOS",
    to: "MIA",
    departAt: "2026-09-22T16:40:00-04:00",
    arriveAt: "2026-09-22T20:15:00-04:00",
    durationMinutes: 215,
    stops: 0,
    cabin: "economy",
    priceUsd: 201,
  },
  {
    id: "dl-2201-bos-mia",
    airline: "Delta",
    flightNumber: "DL2201",
    from: "BOS",
    to: "MIA",
    departAt: "2026-09-22T10:05:00-04:00",
    arriveAt: "2026-09-22T15:40:00-04:00",
    durationMinutes: 275,
    stops: 1,
    cabin: "economy",
    priceUsd: 159,
  },
];

/**
 * @param {{ from?: string, to?: string, cabin?: string }} params
 * @returns {typeof INVENTORY}
 */
export function searchFlights({ from, to, cabin } = {}) {
  let results = INVENTORY;

  if (from) {
    const f = from.toUpperCase();
    results = results.filter((flight) => flight.from === f);
  }
  if (to) {
    const t = to.toUpperCase();
    results = results.filter((flight) => flight.to === t);
  }
  if (cabin) {
    const c = cabin.toLowerCase();
    results = results.filter((flight) => flight.cabin === c);
  }

  return results.slice(0, 6);
}

/**
 * Resolve a city name or IATA code to a known airport code.
 * @param {string} token
 * @returns {string | null}
 */
function resolveAirport(token) {
  if (!token) return null;
  const upper = token.toUpperCase();
  if (VALID_CODES.has(upper)) return upper;
  const lower = token.toLowerCase().trim();
  if (CITY_SYNONYMS[lower]) return CITY_SYNONYMS[lower];
  return null;
}

/**
 * Extract flight search intent from free-form user text.
 * @param {string} userText
 * @returns {{ from: string | null, to: string | null, cabin: string | null }}
 */
export function parseFlightIntent(userText) {
  const text = userText || "";
  const lower = text.toLowerCase();

  let cabin = null;
  if (/\bbusiness\b/i.test(text)) cabin = "business";
  else if (/\bpremium\b/i.test(text)) cabin = "premium";
  else if (/\beconomy\b|\bcoach\b/i.test(text)) cabin = "economy";

  let from = null;
  let to = null;

  // Explicit "from X to Y" / "X to Y" / "X → Y" / "X-Y" patterns
  const fromTo =
    text.match(/\bfrom\s+([A-Za-z]{2,}|[A-Z]{3})\s+(?:to|->|→)\s+([A-Za-z]{2,}|[A-Z]{3})\b/i) ||
    text.match(/\b([A-Z]{3})\s*(?:to|->|→|–|-|—)\s*([A-Z]{3})\b/) ||
    text.match(/\b([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\s+(?:to|->|→)\s+([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\b/i);

  if (fromTo) {
    from = resolveAirport(fromTo[1]);
    to = resolveAirport(fromTo[2]);
  }

  // Fallback: scan for IATA codes in order
  if (!from || !to) {
    const codes = (text.match(/\b([A-Z]{3})\b/g) || []).filter((c) => VALID_CODES.has(c));
    if (!from && codes[0]) from = codes[0];
    if (!to && codes[1]) to = codes[1];
  }

  // City synonym scan when still missing
  if (!from || !to) {
    const found = [];
    for (const [syn, code] of Object.entries(CITY_SYNONYMS)) {
      if (lower.includes(syn) && !found.includes(code)) found.push(code);
    }
    if (!from && found[0]) from = found[0];
    if (!to && found[1]) to = found[1];
  }

  return { from, to, cabin };
}

/**
 * Build 2–4 suggestion chip strings for the FE.
 * @param {{ from?: string | null, to?: string | null, cabin?: string | null, flights?: Array<{ priceUsd: number, stops: number }> }} context
 * @returns {string[]}
 */
export function buildSuggestions(context = {}) {
  const { from, to, cabin, flights } = context;
  const chips = [];

  if (from && to) {
    chips.push(`${from} → ${to} next Friday`);
    chips.push(`Round-trip ${from}–${to}`);
    if (!cabin) chips.push("Show business class");
    if (flights?.some((f) => f.stops === 0)) chips.push("Cheapest nonstop");
    else chips.push("Nonstop only");
  } else {
    chips.push("SFO → JFK next Friday");
    chips.push("Round-trip LAX–ORD");
    chips.push("Cheapest nonstop");
    chips.push("ATL to DFW economy");
  }

  return chips.slice(0, 4);
}

/**
 * Search airports by code, city, or name (max 8).
 * @param {string} q
 * @returns {typeof AIRPORTS}
 */
export function searchAirports(q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) return AIRPORTS.slice(0, 8);

  const matches = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(query) ||
      a.city.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query),
  );

  return matches.slice(0, 8);
}

export { AIRPORTS };
