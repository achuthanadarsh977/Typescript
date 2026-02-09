import {
  SleepRow,
  getAllColumns,
  getNumericColumns,
  getNumericValues,
} from "./dataframe";

export function printShape(data: SleepRow[]): void {
  console.log("\n=== Dataset Shape ===");
  console.log(`Rows: ${data.length}, Columns: ${getAllColumns().length}`);
}

export function printDtypes(): void {
  console.log("\n=== Data Types ===");
  const dtypes: Record<string, string> = {
    Date: "object",
    Sleep_Duration: "float64",
    Mood_Score: "float64",
    Caffeine_Intake_mg: "float64",
    Exercise_Minutes: "float64",
    Screen_Time_Hours: "float64",
    Stress_Level: "float64",
    Water_Intake_Liters: "float64",
    Alcohol_Consumed: "object",
    Journaled: "object",
  };
  for (const [col, dtype] of Object.entries(dtypes)) {
    console.log(`  ${col}: ${dtype}`);
  }
}

export function printHead(data: SleepRow[]): void {
  console.log("\n=== First 5 Rows ===");
  console.table(data.slice(0, 5));
}

export function printTail(data: SleepRow[]): void {
  console.log("\n=== Last 5 Rows ===");
  console.table(data.slice(-5));
}

export function printInfo(data: SleepRow[]): void {
  console.log("\n=== Dataset Info ===");
  console.log(`Total entries: ${data.length}`);
  const cols = getAllColumns();
  console.log(`Total columns: ${cols.length}`);
  const dtypes: Record<string, string> = {
    Date: "object",
    Sleep_Duration: "float64",
    Mood_Score: "float64",
    Caffeine_Intake_mg: "float64",
    Exercise_Minutes: "float64",
    Screen_Time_Hours: "float64",
    Stress_Level: "float64",
    Water_Intake_Liters: "float64",
    Alcohol_Consumed: "object",
    Journaled: "object",
  };
  cols.forEach((col, i) => {
    const nonNull = data.filter((row) => (row as any)[col] !== null).length;
    console.log(
      `  ${i}  ${col.padEnd(22)} ${nonNull} non-null    ${dtypes[col]}`,
    );
  });
}

export function printDescribe(data: SleepRow[]): void {
  console.log("\n=== Descriptive Statistics ===");
  const numCols = getNumericColumns();
  const header = "".padEnd(10) + numCols.map((c) => c.padEnd(20)).join("");
  console.log(header);

  const stats: Record<string, Record<string, number>> = {};
  for (const col of numCols) {
    const vals = getNumericValues(data, col).filter(
      (v): v is number => v !== null,
    );
    const n = vals.length;
    const sorted = [...vals].sort((a, b) => a - b);
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const std = Math.sqrt(
      vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1),
    );
    stats[col] = {
      count: n,
      mean,
      std,
      min: sorted[0],
      "25%": sorted[Math.floor(n * 0.25)],
      "50%": sorted[Math.floor(n * 0.5)],
      "75%": sorted[Math.floor(n * 0.75)],
      max: sorted[n - 1],
    };
  }

  for (const stat of [
    "count",
    "mean",
    "std",
    "min",
    "25%",
    "50%",
    "75%",
    "max",
  ]) {
    let row = stat.padEnd(10);
    for (const col of numCols) {
      row += stats[col][stat].toFixed(stat === "count" ? 0 : 6).padEnd(20);
    }
    console.log(row);
  }
}

export function printMissingValues(data: SleepRow[]): void {
  console.log("\n=== Missing Values ===");
  for (const col of getAllColumns()) {
    const nullCount = data.filter((row) => (row as any)[col] === null).length;
    console.log(`  ${col}: ${nullCount}`);
  }
}

export function getMissingCounts(data: SleepRow[]): {
  columns: string[];
  counts: number[];
} {
  const columns = getAllColumns();
  const counts = columns.map(
    (col) => data.filter((row) => (row as any)[col] === null).length,
  );
  return { columns, counts };
}

export function printGroupByMean(
  data: SleepRow[],
  groupCol: string,
  valueCol: string,
): void {
  console.log(`\n=== ${groupCol} → Mean ${valueCol} ===`);
  const groups: Record<string, number[]> = {};
  for (const row of data) {
    const key = (row as any)[groupCol] as string | null;
    const val = (row as any)[valueCol] as number | null;
    if (key !== null && val !== null) {
      if (!groups[key]) groups[key] = [];
      groups[key].push(val);
    }
  }
  for (const [key, vals] of Object.entries(groups).sort()) {
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    console.log(`  ${key}: ${mean.toFixed(6)}`);
  }
}

export function printCorrelation(data: SleepRow[]): void {
  console.log("\n=== Correlation Matrix ===");
  const numCols = getNumericColumns();
  console.log(
    "".padEnd(22) + numCols.map((c) => c.substring(0, 10).padEnd(12)).join(""),
  );
  for (const col1 of numCols) {
    let row = col1.substring(0, 20).padEnd(22);
    for (const col2 of numCols) {
      const v1 = getNumericValues(data, col1);
      const v2 = getNumericValues(data, col2);
      const corr = computeCorrelation(v1, v2);
      row += corr.toFixed(4).padEnd(12);
    }
    console.log(row);
  }
}

function computeCorrelation(
  v1: (number | null)[],
  v2: (number | null)[],
): number {
  const pairs: [number, number][] = [];
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] !== null && v2[i] !== null) pairs.push([v1[i]!, v2[i]!]);
  }
  if (pairs.length === 0) return 0;
  const n = pairs.length;
  const mean1 = pairs.reduce((s, p) => s + p[0], 0) / n;
  const mean2 = pairs.reduce((s, p) => s + p[1], 0) / n;
  let cov = 0,
    var1 = 0,
    var2 = 0;
  for (const [a, b] of pairs) {
    cov += (a - mean1) * (b - mean2);
    var1 += (a - mean1) ** 2;
    var2 += (b - mean2) ** 2;
  }
  const denom = Math.sqrt(var1 * var2);
  return denom === 0 ? 0 : cov / denom;
}

export function runAllEDA(data: SleepRow[]): void {
  printShape(data);
  printDtypes();
  printHead(data);
  printTail(data);
  printInfo(data);
  printDescribe(data);
  printMissingValues(data);
  printGroupByMean(data, "Alcohol_Consumed", "Mood_Score");
  printGroupByMean(data, "Journaled", "Mood_Score");
  printCorrelation(data);
}
