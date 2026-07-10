(function () {
  // ─── Types ──────────────────────────────────────────────────────────────────────
  interface Coords { lat: number; lng: number; }
  interface CountryResult { cc: string; postal: string; }
  interface RegionResult { id: string; label: string; }
  interface Mover { name: string; url: string; desc: string; }
  type MoverMap = Record<string, Mover[]>;
  type RegionCode = "US" | "CA" | "GB" | "AU" | "IN";
  type HomeSizeKey = "studio" | "1br" | "2br" | "3br" | "4br" | "5br";
  type Unit = "mi" | "km";
  type RegionMap = Record<string, string>;

  // ─── Constants ─────────────────────────────────────────────────────────────────
  const MI_TO_KM = 1.60934;
  const CURRENCY_RATES: Record<RegionCode, number> = { US: 1, CA: 1.36, GB: 0.79, AU: 1.51, IN: 83.5 };
  const CURRENCY_SYMBOLS: Record<RegionCode, string> = { US: "$", CA: "C$", GB: "£", AU: "A$", IN: "₹" };
  const COUNTRY_COST_MULTIPLIERS: Record<RegionCode, number> = { US: 1.0, CA: 0.95, GB: 1.3, AU: 1.15, IN: 0.35 };
  const REGION_LABELS: Record<RegionCode, string> = { US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia", IN: "India" };
  const HOME_BASE: Record<HomeSizeKey, [number, number, number]> = { studio: [80, 500, 1200], "1br": [150, 600, 2000], "2br": [250, 800, 2800], "3br": [400, 1000, 3800], "4br": [550, 1300, 5000], "5br": [700, 1600, 6500] };
  const PER_MI: [number, number, number] = [0.8, 1.5, 2.5];
  const SLIDER_MIN = 15, SLIDER_MAX = 2800;

  let currentDistanceMi: number = 100;
  let currentUnit: Unit = "mi";
  let isInitialLoad: boolean = false;

  // ─── Regional mover data ────────────────────────────────────────────────────────
  const MOVERS: MoverMap = {
    US: [
      { name: "United Van Lines", url: "https://www.unitedvanlines.com", desc: "Largest van line in North America" },
      { name: "Atlas Van Lines", url: "https://www.atlasvanlines.com", desc: "Award-winning full-service moving" },
      { name: "Mayflower Transit", url: "https://www.mayflower.com", desc: "America's most recognized moving brand" },
      { name: "Allied Van Lines", url: "https://www.allied.com", desc: "Worldwide moving since 1928" },
    ],
    "US-NE": [
      { name: "Gentle Giant Moving", url: "https://www.gentlegiant.com", desc: "Premium service in the Northeast" },
      { name: "Piece of Cake Moving", url: "https://www.pieceofcakemoving.com", desc: "NYC & Northeast specialists" },
      { name: "StairMasters Moving", url: "https://www.stairmastersmoving.com", desc: "Boston & New England moves" },
      { name: "Moses Movers", url: "https://www.mosesmovers.com", desc: "NYC & tri-state area experts" },
    ],
    "US-SE": [
      { name: "Bellhop Moving", url: "https://www.bellhop.com", desc: "Southeast & nationwide moving" },
      { name: "Einstein Moving Company", url: "https://www.einsteinmoving.com", desc: "Florida & Southeast mover" },
      { name: "TWO MEN AND A TRUCK", url: "https://www.twomenandatruck.com", desc: "Nationwide with local offices" },
      { name: "A-1 Freeman Moving", url: "https://www.a1freemanmoving.com", desc: "Dallas/Fort Worth specialists" },
    ],
    "US-MW": [
      { name: "TWO MEN AND A TRUCK", url: "https://www.twomenandatruck.com", desc: "Founded in Michigan, nationwide" },
      { name: "College Hunks Hauling Junk", url: "https://www.collegehunkshaulingjunk.com", desc: "Midwest & nationwide moving" },
      { name: "Ward North American", url: "https://www.wardnorthamerican.com", desc: "Chicago & Midwest moving" },
      { name: "Bekins Moving", url: "https://www.bekins.com", desc: "Midwest & long-distance moving" },
    ],
    "US-W": [
      { name: "NorthStar Moving Company", url: "https://www.northstarmoving.com", desc: "California & West Coast" },
      { name: "Meathead Movers", url: "https://www.meatheadmovers.com", desc: "California's favorite mover" },
      { name: "Delancey Street Movers", url: "https://www.delanceystreetmovers.com", desc: "San Francisco Bay Area" },
      { name: "Specialty Moving Systems", url: "https://www.specialtymoving.com", desc: "Pacific Northwest specialists" },
    ],
    CA: [
      { name: "AMJ Campbell", url: "https://www.amjcampbell.com", desc: "Canada's largest moving company" },
      { name: "Atlas Van Lines Canada", url: "https://www.atlasvanlines.ca", desc: "Coast-to-coast Canadian service" },
      { name: "United Van Lines Canada", url: "https://www.unitedvanlines.ca", desc: "Trusted Canadian van lines" },
      { name: "Premier Van Lines", url: "https://www.premiervanlines.com", desc: "Canadian moving specialists" },
    ],
    GB: [
      { name: "Pickfords", url: "https://www.pickfords.co.uk", desc: "UK's oldest removal company" },
      { name: "Britannia Movers", url: "https://www.britanniamovers.co.uk", desc: "Nationwide UK coverage" },
      { name: "AnyVan", url: "https://www.anyvan.com", desc: "Online booking, UK-wide" },
      { name: "Shiply", url: "https://www.shiply.com", desc: "Compare removal quotes" },
    ],
    AU: [
      { name: "Grace Removals", url: "https://www.graceremovals.com.au", desc: "Australia's leading removalist" },
      { name: "Kent Removals", url: "https://www.kentremovals.com.au", desc: "Interstate & local moves" },
      { name: "Chess Moving", url: "https://www.chessmoving.com", desc: "Premium Australian mover" },
      { name: "Moose Removal", url: "https://www.mooseremoval.com.au", desc: "Budget-friendly options" },
    ],
    IN: [
      { name: "Agarwal Packers and Movers", url: "https://www.agarwalpackers.com", desc: "India's most trusted mover" },
      { name: "The Professional Packers", url: "https://www.theprofessionalpackers.com", desc: "Reliable pan-India service" },
      { name: "Leo Packers", url: "https://www.leopackers.com", desc: "Affordable moving solutions" },
      { name: "Gati Packers and Movers", url: "https://www.gatipackers.com", desc: "All-India coverage" },
    ],
  };

  // ─── US state → region mapping ──────────────────────────────────────────────────
  const US_REGION: RegionMap = {
    me: "US-NE", nh: "US-NE", vt: "US-NE", ma: "US-NE", ri: "US-NE", ct: "US-NE", ny: "US-NE", nj: "US-NE", pa: "US-NE",
    de: "US-SE", md: "US-SE", dc: "US-SE", va: "US-SE", wv: "US-SE", nc: "US-SE", sc: "US-SE", ga: "US-SE", fl: "US-SE", al: "US-SE", ms: "US-SE", tn: "US-SE", ky: "US-SE",
    oh: "US-MW", mi: "US-MW", in: "US-MW", il: "US-MW", wi: "US-MW", mn: "US-MW", ia: "US-MW", mo: "US-MW", nd: "US-MW", sd: "US-MW", ne: "US-MW", ks: "US-MW",
    mt: "US-W", wy: "US-W", co: "US-W", nm: "US-W", id: "US-W", ut: "US-W", az: "US-W", wa: "US-W", or: "US-W", ca: "US-W", nv: "US-W", ak: "US-W", hi: "US-W",
    tx: "US-SE", la: "US-SE", ar: "US-SE", ok: "US-SE",
  };

  interface CityRegion { re: RegExp; r: string; }

  const US_CITY_REGION: CityRegion[] = [
    { re: /new\s+york|nyc|brooklyn|manhattan|queens|bronx|staten\s+island/i, r: "US-NE" },
    { re: /boston|cambridge|worcester|providence|hartford|new\s+haven|springfield\s+ma/i, r: "US-NE" },
    { re: /philadelphia|pittsburgh|baltimore|washington\s+dc/i, r: "US-NE" },
    { re: /chicago|detroit|cleveland|cincinnati|indianapolis|milwaukee|minneapolis/i, r: "US-MW" },
    { re: /st\.?\s*louis|kansas\s+city|columbus|des\s+moines|omaha/i, r: "US-MW" },
    { re: /atlanta|charlotte|raleigh|nashville|memphis|jacksonville|orlando|miami|tampa/i, r: "US-SE" },
    { re: /dallas|houston|austin|san\s+antonio|fort\s+worth|new\s+orleans/i, r: "US-SE" },
    { re: /los\s+angeles|san\s+francisco|san\s+diego|seattle|portland|denver|phoenix|las\s+vegas/i, r: "US-W" },
    { re: /sacramento|oakland|san\s+jose|silicon\s+valley|palo\s+alto/i, r: "US-W" },
  ];

  // ─── DOM refs ──────────────────────────────────────────────────────────────────
  const moversSection = document.getElementById("moversSection") as HTMLElement | null;
  const moversList = document.getElementById("moversList") as HTMLElement | null;
  const regionName = document.getElementById("regionName") as HTMLElement | null;
  const form = document.getElementById("moveForm") as HTMLFormElement | null;
  const originInput = document.getElementById("origin") as HTMLInputElement | null;
  const destInput = document.getElementById("destination") as HTMLInputElement | null;
  const homeSize = document.getElementById("homeSize") as HTMLSelectElement | null;
  const moveDate = document.getElementById("moveDate") as HTMLInputElement | null;
  const region = document.getElementById("region") as HTMLSelectElement | null;
  const calcBtn = document.getElementById("calculateBtn") as HTMLButtonElement | null;
  const loading = document.getElementById("loading") as HTMLElement | null;
  const distSection = document.getElementById("distanceSection") as HTMLElement | null;
  const distSlider = document.getElementById("distanceSlider") as HTMLInputElement | null;
  const distLabel = document.getElementById("distanceLabel") as HTMLElement | null;
  const distMinLabel = document.getElementById("distMinLabel") as HTMLElement | null;
  const distMaxLabel = document.getElementById("distMaxLabel") as HTMLElement | null;
  const results = document.getElementById("results") as HTMLElement | null;
  const currencyLabel = document.getElementById("currencyLabel") as HTMLElement | null;
  const regionPricingLabel = document.getElementById("regionPricingLabel") as HTMLElement | null;
  const unitMi = document.getElementById("unitMi") as HTMLElement | null;
  const unitKm = document.getElementById("unitKm") as HTMLElement | null;
  const perUnits = document.querySelectorAll(".per-unit") as NodeListOf<HTMLElement>;
  const estimateDetails = document.querySelectorAll(".estimate-detail") as NodeListOf<HTMLElement>;

  // ─── Share Button Refs ─────────────────────────────────────────────────────────
  const shareTwitter = document.getElementById("shareTwitter") as HTMLAnchorElement | null;
  const shareFacebook = document.getElementById("shareFacebook") as HTMLAnchorElement | null;
  const shareWhatsApp = document.getElementById("shareWhatsApp") as HTMLAnchorElement | null;
  const shareEmail = document.getElementById("shareEmail") as HTMLAnchorElement | null;
  const sharePrint = document.getElementById("sharePrint") as HTMLButtonElement | null;
  const shareCopy = document.getElementById("shareCopy") as HTMLButtonElement | null;
  const copyIcon = document.getElementById("copyIcon") as HTMLElement | null;
  const checkIcon = document.getElementById("checkIcon") as HTMLElement | null;

  // ─── Unit conversion helpers ───────────────────────────────────────────────────
  function miToDisplay(mi: number): number {
    return currentUnit === "km" ? Math.round(mi * MI_TO_KM) : mi;
  }

  function unitLabel(): Unit { return currentUnit; }
  function perUnitLabel(): string { return `per ${currentUnit}`; }

  function updateSliderUI(): void {
    if (!distSlider || !distLabel || !distMinLabel || !distMaxLabel) return;
    const display = miToDisplay(currentDistanceMi);
    distLabel.textContent = display.toLocaleString() + " " + unitLabel();
    distMinLabel.textContent = miToDisplay(SLIDER_MIN).toLocaleString() + " " + unitLabel();
    distMaxLabel.textContent = miToDisplay(SLIDER_MAX).toLocaleString() + " " + unitLabel();
  }

  function setUnit(unit: Unit): void {
    currentUnit = unit;
    if (!unitMi || !unitKm) return;
    const active = "bg-ink text-on-ink";
    const inactive = "bg-canvas text-body hover:text-ink";
    if (unit === "mi") { unitMi.className = `unit-btn flex-1 rounded px-2 text-sm font-medium transition-all ${active}`; unitKm.className = `unit-btn flex-1 rounded px-2 text-sm font-medium transition-all ${inactive}`; }
    else { unitKm.className = `unit-btn flex-1 rounded px-2 text-sm font-medium transition-all ${active}`; unitMi.className = `unit-btn flex-1 rounded px-2 text-sm font-medium transition-all ${inactive}`; }

    perUnits.forEach(el => el.textContent = unit);

    if (results && !results.classList.contains("hidden")) {
      updateSliderUI();
      renderEstimates(currentDistanceMi, (region ? region.value : "US") as RegionCode);
    }
  }

  // ─── Postal code detection ────────────────────────────────────────────────────
  function detectCountry(code: string): CountryResult | null {
    const c = code.trim();
    if (/^\d{5}(-\d{4})?$/.test(c)) return { cc: "US", postal: c.replace(/-.*/, "") };
    if (/^\d{6}$/.test(c)) return { cc: "IN", postal: c };
    if (/^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/.test(c)) return { cc: "CA", postal: c.replace(/ /, "").toUpperCase() };
    if (/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(c)) return { cc: "GB", postal: c.toUpperCase() };
    if (/^\d{4}$/.test(c)) return { cc: "AU", postal: c };
    return null;
  }

  // ─── Detect region from user input ─────────────────────────────────────────────
  function detectRegion(origin: string, dest: string): RegionResult {
    // 1) Try postal code country detection
    const d = detectCountry(origin) || detectCountry(dest);
    if (d) {
      if (d.cc === "US") {
        const region = detectUSRegion(origin) || detectUSRegion(dest);
        if (region) return { id: region, label: region.replace("US-", "") + " United States" };
        return { id: "US", label: "United States" };
      }
      const labels = { CA: "Canada", GB: "United Kingdom", AU: "Australia", IN: "India" };
      if (labels[d.cc]) return { id: d.cc, label: labels[d.cc] };
      return { id: "US", label: "United States" };
    }
    // 2) Try city name matching
    const combined = (origin + " " + dest).toLowerCase();
    for (const m of US_CITY_REGION) {
      if (m.re.test(combined)) return { id: m.r, label: m.r.replace("US-", "") + " United States" };
    }
    // 3) Check for common US state abbreviations and country keywords
    const stateMatch = combined.match(/\b([a-z]{2})\b(?:\s|,|$)/g);
    if (stateMatch) {
      for (const s of stateMatch) {
        const st = s.trim();
        if (US_REGION[st]) return { id: US_REGION[st], label: US_REGION[st].replace("US-", "") + " United States" };
      }
    }
    if (/\bcanada|toronto|vancouver|montreal|calgary|ottawa\b/i.test(combined)) return { id: "CA", label: "Canada" };
    if (/\buk|united\s*kingdom|london|manchester|birmingham|glasgow\b/i.test(combined)) return { id: "GB", label: "United Kingdom" };
    if (/\baustralia|sydney|melbourne|brisbane|perth|adelaide\b/i.test(combined)) return { id: "AU", label: "Australia" };
    if (/\bindia|mumbai|delhi|bangalore|kolkata|chennai\b/i.test(combined)) return { id: "IN", label: "India" };
    // 4) Default
    return { id: "US", label: "United States" };
  }

  function detectUSRegion(input: string): string | null {
    const lower = input.toLowerCase();
    // Check state abbreviations from postal code context
    const stateAbbr = lower.match(/\b([a-z]{2})\b(?:\s|,|$)/g);
    if (stateAbbr) {
      for (const s of stateAbbr) {
        const st = s.trim();
        if (US_REGION[st]) return US_REGION[st];
      }
    }
    // Check city names
    for (const m of US_CITY_REGION) {
      if (m.re.test(lower)) return m.r;
    }
    return null;
  }

  function renderMovers(origin: string, dest: string): void {
    if (!moversSection || !regionName || !moversList) return;
    const region = detectRegion(origin, dest);
    const movers = MOVERS[region.id] || MOVERS.US;
    regionName.textContent = region.label;
    moversList.innerHTML = movers.map(m => `
      <a href="${m.url}" target="_blank" rel="noopener noreferrer" class="flex flex-col rounded-lg border border-hairline bg-canvas p-4 no-underline transition-shadow hover:shadow-[0_2px_2px_#0000000a,0_8px_16px_-4px_#0000000a]">
        <span class="text-sm font-semibold text-ink">${m.name}</span>
        <span class="mt-0.5 text-xs text-body">${m.desc}</span>
        <span class="mt-1.5 text-xs font-medium text-link">Visit website &rarr;</span>
      </a>
    `).join("");
    moversSection.classList.remove("hidden");
  }

  // ─── Haversine (returns miles) ────────────────────────────────────────────────
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ─── Deterministic hash fallback (returns miles) ──────────────────────────────
  function hashDistance(o: string, d: string): number {
    const s = (o + ":" + d).toLowerCase().trim();
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i) | 0;
    return SLIDER_MIN + (Math.abs(h) % (SLIDER_MAX - SLIDER_MIN + 1));
  }

  // ─── Fetch lat/lng from zippopotam.us (postal codes) ──────────────────────────
  async function fetchCoords(code: string, cc: string): Promise<Coords | null> {
    const url = `https://api.zippopotam.us/${cc}/${encodeURIComponent(code)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { lat: +data.places[0].latitude, lng: +data.places[0].longitude };
  }

  // ─── Geocode city name via Nominatim (OpenStreetMap) ──────────────────────────
  async function geocodeCity(city: string): Promise<Coords | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "MoveCostMatrix/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: +data[0].lat, lng: +data[0].lon };
  }

  // ─── Compute miles from two lat/lng pairs ─────────────────────────────────────
  function coordsToMiles(c1: Coords, c2: Coords): number {
    const d = haversine(c1.lat, c1.lng, c2.lat, c2.lng);
    return Math.round(Math.min(Math.max(d * 1.2, SLIDER_MIN), SLIDER_MAX));
  }

  // ─── Get distance in miles ────────────────────────────────────────────────────
  async function getDistanceInMi(origin: string, destination: string): Promise<number> {
    // 1) Try postal code API if both inputs look like codes from the same country
    const d1 = detectCountry(origin);
    const d2 = detectCountry(destination);
    if (d1 && d2 && d1.cc === d2.cc) {
      try {
        const [c1, c2] = await Promise.all([fetchCoords(d1.postal, d1.cc), fetchCoords(d2.postal, d2.cc)]);
        if (c1 && c2) return coordsToMiles(c1, c2);
      } catch {}
    }
    // 2) Try Nominatim geocoding for city names
    try {
      const [c1, c2] = await Promise.all([geocodeCity(origin), geocodeCity(destination)]);
      if (c1 && c2) return coordsToMiles(c1, c2);
    } catch {}
    // 3) Fallback: deterministic hash
    return hashDistance(origin, destination);
  }

  // ─── Format with currency ─────────────────────────────────────────────────────
  function fmt(usd: number, reg: RegionCode): string {
    const rate = CURRENCY_RATES[reg] || 1;
    const sym = CURRENCY_SYMBOLS[reg] || "$";
    const converted = usd * rate;
    if (reg === "IN") return sym + Math.round(converted).toLocaleString();
    return sym + converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // ─── Get per-unit rate based on current unit ──────────────────────────────────
  function getPerUnitRate(miRate: number): number {
    return currentUnit === "km" ? miRate / MI_TO_KM : miRate;
  }

  // ─── Get base region from detected subregion ──────────────────────────────────
  function getBaseRegion(id: string): RegionCode {
    if (id.startsWith("US-")) return "US";
    if (["US", "CA", "GB", "AU", "IN"].includes(id)) return id as RegionCode;
    return "US";
  }

  // ─── Calculate and render all estimates ───────────────────────────────────────
  function getRegionMultiplier(): number {
    if (!region) return 1.0;
    return COUNTRY_COST_MULTIPLIERS[region.value as RegionCode] || 1.0;
  }

  function getRegionLabel(): string {
    if (!region) return "US market";
    return REGION_LABELS[region.value as RegionCode] || "United States";
  }

  function renderEstimates(distanceMi: number, reg: RegionCode): void {
    if (!homeSize || !currencyLabel) return;
    const homeKey = homeSize.value as HomeSizeKey;
    const bases = HOME_BASE[homeKey] || HOME_BASE["1br"];
    const distance = currentUnit === "km" ? distanceMi * MI_TO_KM : distanceMi;
    const multiplier = COUNTRY_COST_MULTIPLIERS[reg] || 1.0;

    const cards = document.querySelectorAll(".estimate-card");
    cards.forEach((card, i) => {
      const perUnit = getPerUnitRate(PER_MI[i]) * multiplier;
      const total = (bases[i] + distance * PER_MI[i]) * multiplier;
      card.querySelector(".estimate-amount").textContent = fmt(total, reg);
      card.querySelector(".estimate-detail").textContent =
        `Base: ${fmt(bases[i] * multiplier, reg)} • Per ${currentUnit}: ${fmt(perUnit, reg)}/${currentUnit}`;
    });

    currencyLabel.textContent = REGION_LABELS[reg] + " (" + CURRENCY_SYMBOLS[reg] + ")";
    if (regionPricingLabel) {
      regionPricingLabel.textContent = "Region-adjusted pricing applied.";
    }
    updateShareLinks();
  }

  // ─── Sharing logic ─────────────────────────────────────────────────────────────
  function getShareUrl(): string {
    const origin = originInput ? encodeURIComponent(originInput.value.trim()) : "";
    const dest = destInput ? encodeURIComponent(destInput.value.trim()) : "";
    const hs = homeSize ? encodeURIComponent(homeSize.value) : "";
    const reg = region ? encodeURIComponent(region.value) : "";
    const dist = currentDistanceMi;
    const unit = currentUnit;

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", dest);
    url.searchParams.set("homeSize", hs);
    url.searchParams.set("region", reg);
    url.searchParams.set("distance", dist.toString());
    url.searchParams.set("unit", unit);

    return url.toString();
  }

  function updateShareLinks(): void {
    const url = getShareUrl();
    const text = `Check out my estimated moving costs on MoveCostMatrix:`;

    if (shareTwitter) {
      shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    if (shareFacebook) {
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    if (shareWhatsApp) {
      shareWhatsApp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
    }
    if (shareEmail) {
      shareEmail.href = `mailto:?subject=${encodeURIComponent("Moving Cost Estimate")}&body=${encodeURIComponent(text + "\n\n" + url)}`;
    }
  }

  // Handle copy link click
  if (shareCopy) {
    shareCopy.addEventListener("click", function (e: Event) {
      e.preventDefault();
      const url = getShareUrl();
      navigator.clipboard.writeText(url).then(() => {
        if (copyIcon && checkIcon) {
          copyIcon.classList.add("hidden");
          checkIcon.classList.remove("hidden");
          setTimeout(() => {
            copyIcon.classList.remove("hidden");
            checkIcon.classList.add("hidden");
          }, 2000);
        }
      }).catch(err => {
        console.error("Failed to copy link: ", err);
      });
    });
  }

  // Handle Print/PDF export click
  if (sharePrint) {
    sharePrint.addEventListener("click", function (e: Event) {
      e.preventDefault();
      window.print();
    });
  }

  if (!calcBtn || !originInput || !destInput || !loading || !distSection || !results || !region || !distSlider) return;

  calcBtn.addEventListener("click", async function (this: HTMLButtonElement, e: Event) {
    e.preventDefault();

    const origin = originInput.value.trim();
    const dest = destInput.value.trim();
    if (!origin || !dest) {
      originInput.style.outline = "2px solid #ee0000";
      destInput.style.outline = "2px solid #ee0000";
      setTimeout(() => { originInput.style.outline = ""; destInput.style.outline = ""; }, 1500);
      return;
    }

    loading.classList.remove("hidden");
    distSection.classList.add("hidden");
    results.classList.add("hidden");
    calcBtn.disabled = true;
    calcBtn.textContent = "Calculating...";

    // Auto-detect region from origin/destination and set dropdown
    const detected = detectRegion(origin, dest);
    region.value = getBaseRegion(detected.id);

    if (isInitialLoad) {
      isInitialLoad = false;
    } else {
      currentDistanceMi = await getDistanceInMi(origin, dest);
    }
    distSlider.value = currentDistanceMi;

    updateSliderUI();

    loading.classList.add("hidden");
    distSection.classList.remove("hidden");
    results.classList.remove("hidden");
    calcBtn.disabled = false;
    calcBtn.textContent = "Get Estimate";

    renderEstimates(currentDistanceMi, region.value as RegionCode);
    renderMovers(origin, dest);

    setTimeout(() => results.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  });

  // ─── Slider recalculates on input ─────────────────────────────────────────────
  distSlider.addEventListener("input", function (this: HTMLInputElement) {
    currentDistanceMi = +this.value;
    updateSliderUI();
    renderEstimates(currentDistanceMi, (region ? region.value : "US") as RegionCode);
  });

  // ─── Region change recalculates ────────────────────────────────────────────────
  region.addEventListener("change", function (this: HTMLSelectElement) {
    if (results && !results.classList.contains("hidden")) renderEstimates(currentDistanceMi, this.value as RegionCode);
  });

  // ─── Unit toggle ──────────────────────────────────────────────────────────────
  unitMi.addEventListener("click", () => setUnit("mi"));
  unitKm.addEventListener("click", () => setUnit("km"));

  // ─── Set default date ─────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14);
  if (moveDate) moveDate.value = tomorrow.toISOString().split("T")[0];

  // ─── Query parameter parsing on load ───────────────────────────────────────────
  function parseQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    const qOrigin = params.get("origin");
    const qDest = params.get("destination");
    const qHomeSize = params.get("homeSize");
    const qRegion = params.get("region");
    const qDistance = params.get("distance");
    const qUnit = params.get("unit");

    if (qOrigin && qDest) {
      if (originInput) originInput.value = decodeURIComponent(qOrigin);
      if (destInput) destInput.value = decodeURIComponent(qDest);
      if (qHomeSize && homeSize) homeSize.value = decodeURIComponent(qHomeSize);
      if (qRegion && region) region.value = decodeURIComponent(qRegion);
      if (qUnit === "mi" || qUnit === "km") {
        currentUnit = qUnit;
      }
      if (qDistance && distSlider) {
        currentDistanceMi = parseInt(qDistance, 10);
        distSlider.value = currentDistanceMi.toString();
        isInitialLoad = true;
      }
      setUnit(currentUnit);

      // Auto-trigger calculation
      setTimeout(() => {
        if (calcBtn) calcBtn.click();
      }, 300);
    } else {
      setUnit("mi");
    }
  }

  parseQueryParams();
})();
