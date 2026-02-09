import * as fs from "fs";
import { parse } from "csv-parse/sync";

export interface MovieRow {
  Movie: string | null;
  Genre: string | null;
  Year: number | null;
  Rating: number | null;
  Watched_On: string | null;
  Duration: number | null;
  Director: string | null;
  Lead_Actor: string | null;
  Language: string | null;
  Rewatch: string | null;
}

const NUMERIC_COLS = ["Year", "Rating", "Duration"] as const;
const STRING_COLS = [
  "Movie",
  "Genre",
  "Watched_On",
  "Director",
  "Lead_Actor",
  "Language",
  "Rewatch",
] as const;

export function loadCSV(filePath: string): MovieRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const raw = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  return raw.map((row) => {
    const parsed: MovieRow = {
      Movie: emptyToNull(row["Movie"]),
      Genre: emptyToNull(row["Genre"]),
      Year: parseNum(row["Year"]),
      Rating: parseNum(row["Rating"]),
      Watched_On: emptyToNull(row["Watched_On"]),
      Duration: parseNum(row["Duration"]),
      Director: emptyToNull(row["Director"]),
      Lead_Actor: emptyToNull(row["Lead_Actor"]),
      Language: emptyToNull(row["Language"]),
      Rewatch: emptyToNull(row["Rewatch"]),
    };
    return parsed;
  });
}

function emptyToNull(val: string | undefined): string | null {
  if (val === undefined || val === "" || val === "NaN") return null;
  return val;
}

function parseNum(val: string | undefined): number | null {
  if (val === undefined || val === "" || val === "NaN") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export function getColumns(): string[] {
  return [...NUMERIC_COLS, ...STRING_COLS];
}

export function getAllColumns(): string[] {
  return [
    "Movie",
    "Genre",
    "Year",
    "Rating",
    "Watched_On",
    "Duration",
    "Director",
    "Lead_Actor",
    "Language",
    "Rewatch",
  ];
}

export function getNumericColumns(): readonly string[] {
  return NUMERIC_COLS;
}

export function getNumericValues(
  data: MovieRow[],
  col: string,
): (number | null)[] {
  return data.map((row) => (row as any)[col] as number | null);
}

export function getStringValues(
  data: MovieRow[],
  col: string,
): (string | null)[] {
  return data.map((row) => (row as any)[col] as string | null);
}
