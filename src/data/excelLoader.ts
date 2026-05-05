import * as XLSX from "xlsx";
import path from "path";

export interface LogisticsCompany {
  id: number;
  companyName: string;
  phoneNumbers: string;
  city: string;
  serviceType: string;
  address: string;
  coverage: string;
}

let _cache: LogisticsCompany[] | null = null;

export function loadCompanies(): LogisticsCompany[] {
  if (_cache) return _cache;

  const filePath = path.resolve(
    process.env.EXCEL_FILE ??
    "C:/Users/SriniAchuthan/Downloads/gujarat2 (1).xlsx"
  );

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];

  _cache = rows
    .slice(1) // skip header row
    .filter(r => r[0]?.toString().trim()) // skip empty rows
    .map((r, i) => ({
      id: i + 1,
      companyName:  clean(r[0]),
      phoneNumbers: clean(r[1]),
      city:         clean(r[2]),
      serviceType:  clean(r[3]),
      address:      clean(r[4]),
      coverage:     clean(r[5]),
    }));

  console.log(`✅ Loaded ${_cache.length} logistics companies from Excel`);
  return _cache;
}

function clean(val: unknown): string {
  return val?.toString().trim() ?? "";
}

// Pre-computed lookup maps for O(1) fast access
export interface IndexMaps {
  byCity:    Map<string, LogisticsCompany[]>;
  byService: Map<string, LogisticsCompany[]>;
  byPhone:   Map<string, LogisticsCompany>;
  byName:    Map<string, LogisticsCompany[]>;
  allCities: string[];
  allServices: string[];
}

let _index: IndexMaps | null = null;

export function buildIndex(): IndexMaps {
  if (_index) return _index;

  const companies = loadCompanies();
  const byCity    = new Map<string, LogisticsCompany[]>();
  const byService = new Map<string, LogisticsCompany[]>();
  const byPhone   = new Map<string, LogisticsCompany>();
  const byName    = new Map<string, LogisticsCompany[]>();

  for (const c of companies) {
    // by city (normalised lowercase)
    const cityKey = c.city.toLowerCase().trim();
    if (!byCity.has(cityKey)) byCity.set(cityKey, []);
    byCity.get(cityKey)!.push(c);

    // by service type (normalised)
    const svcKey = c.serviceType.toLowerCase().trim();
    if (!byService.has(svcKey)) byService.set(svcKey, []);
    byService.get(svcKey)!.push(c);

    // by individual phone numbers
    c.phoneNumbers.split(/[;,\s]+/).filter(Boolean).forEach(p => {
      byPhone.set(p.trim(), c);
    });

    // by company name (first word for partial match)
    const nameKey = c.companyName.toLowerCase().split(/\s+/)[0];
    if (!byName.has(nameKey)) byName.set(nameKey, []);
    byName.get(nameKey)!.push(c);
  }

  _index = {
    byCity,
    byService,
    byPhone,
    byName,
    allCities:    [...new Set(companies.map(c => c.city).filter(Boolean))].sort(),
    allServices:  [...new Set(companies.map(c => c.serviceType).filter(Boolean))].sort(),
  };

  return _index;
}
