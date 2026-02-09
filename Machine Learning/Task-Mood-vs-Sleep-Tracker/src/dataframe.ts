import * as fs from "fs";
import { parse } from "csv-parse/sync";

export interface SleepRow {
  Date: string | null;
  Sleep_Duration: number | null;
  Mood_Score: number | null;
  Caffeine_Intake_mg: number | null;
  Exercise_Minutes: number | null;
  Screen_Time_Hours: number | null;
  Stress_Level: number | null;
  Water_Intake_Liters: number | null;
  Alcohol_Consumed: string | null;
  Journaled: string | null;
}

const ALL_COLS = [
  "Date",
  "Sleep_Duration",
  "Mood_Score",
  "Caffeine_Intake_mg",
  "Exercise_Minutes",
  "Screen_Time_Hours",
  "Stress_Level",
  "Water_Intake_Liters",
  "Alcohol_Consumed",
  "Journaled",
] as const;

const NUMERIC_COLS = [
  "Sleep_Duration",
  "Mood_Score",
  "Caffeine_Intake_mg",
  "Exercise_Minutes",
  "Screen_Time_Hours",
  "Stress_Level",
  "Water_Intake_Liters",
] as const;

export function loadCSV(filePath: string): SleepRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const raw = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];
  return raw.map((row) => ({
    Date: emptyToNull(row["Date"]),
    Sleep_Duration: parseNum(row["Sleep_Duration"]),
    Mood_Score: parseNum(row["Mood_Score"]),
    Caffeine_Intake_mg: parseNum(row["Caffeine_Intake_mg"]),
    Exercise_Minutes: parseNum(row["Exercise_Minutes"]),
    Screen_Time_Hours: parseNum(row["Screen_Time_Hours"]),
    Stress_Level: parseNum(row["Stress_Level"]),
    Water_Intake_Liters: parseNum(row["Water_Intake_Liters"]),
    Alcohol_Consumed: emptyToNull(row["Alcohol_Consumed"]),
    Journaled: emptyToNull(row["Journaled"]),
  }));
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

export function getAllColumns(): string[] {
  return [...ALL_COLS];
}
export function getNumericColumns(): readonly string[] {
  return NUMERIC_COLS;
}

export function getNumericValues(
  data: SleepRow[],
  col: string,
): (number | null)[] {
  return data.map((row) => (row as any)[col] as number | null);
}

export function getStringValues(
  data: SleepRow[],
  col: string,
): (string | null)[] {
  return data.map((row) => (row as any)[col] as string | null);
}
