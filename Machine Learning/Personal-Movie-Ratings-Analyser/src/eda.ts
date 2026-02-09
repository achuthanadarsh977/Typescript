import {
  MovieRow,
  getAllColumns,
  getNumericColumns,
  getNumericValues,
} from "./dataframe";

export function printShape(data: MovieRow[]): void {
  console.log("\n=== Dataset Shape ===");
  console.log(`Rows: ${data.length}, Columns: ${getAllColumns().length}`);
}

export function printDtypes(): void {
  console.log("\n=== Data Types ===");
  const dtypes: Record<string, string> = {
    Movie: "string",
    Genre: "string",
    Year: "float64",
    Rating: "float64",
    Watched_On: "string",
    Duration: "float64",
    Director: "string",
    Lead_Actor: "string",
    Language: "string",
    Rewatch: "string",
  };
  for (const [col, dtype] of Object.entries(dtypes)) {
    console.log(`  ${col}: ${dtype}`);
  }
}

export function printHead(data: MovieRow[]): void {
  console.log("\n=== First 5 Rows ===");
  console.table(data.slice(0, 5));
}

export function printTail(data: MovieRow[]): void {
  console.log("\n=== Last 5 Rows ===");
  console.table(data.slice(-5));
}

export function printDescribe(data: MovieRow[]): void {
  console.log("\n=== Descriptive Statistics ===");
  const numCols = getNumericColumns();
  const header = "".padEnd(10) + numCols.map((c) => c.padEnd(14)).join("");
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
      row += stats[col][stat].toFixed(stat === "count" ? 0 : 6).padEnd(14);
    }
    console.log(row);
  }
}

export function printMissingValues(data: MovieRow[]): void {
  console.log("\n=== Missing Values ===");
  const cols = getAllColumns();
  for (const col of cols) {
    const nullCount = data.filter((row) => (row as any)[col] === null).length;
    console.log(`  ${col}: ${nullCount}`);
  }
}

export function getMissingCounts(data: MovieRow[]): {
  columns: string[];
  counts: number[];
} {
  const columns = getAllColumns();
  const counts = columns.map(
    (col) => data.filter((row) => (row as any)[col] === null).length,
  );
  return { columns, counts };
}

export function printInfo(data: MovieRow[]): void {
  console.log("\n=== Dataset Info ===");
  console.log(`Total entries: ${data.length}`);
  const cols = getAllColumns();
  console.log(`Total columns: ${cols.length}`);
  console.log("Columns:");
  const dtypes: Record<string, string> = {
    Movie: "string",
    Genre: "string",
    Year: "float64",
    Rating: "float64",
    Watched_On: "string",
    Duration: "float64",
    Director: "string",
    Lead_Actor: "string",
    Language: "string",
    Rewatch: "string",
  };
  cols.forEach((col, i) => {
    const nonNull = data.filter((row) => (row as any)[col] !== null).length;
    console.log(
      `  ${i}  ${col.padEnd(14)} ${nonNull} non-null    ${dtypes[col]}`,
    );
  });
}

export function printCorrelation(data: MovieRow[]): void {
  console.log("\n=== Correlation Matrix ===");
  const numCols = getNumericColumns();
  console.log("".padEnd(14) + numCols.map((c) => c.padEnd(12)).join(""));
  for (const col1 of numCols) {
    let row = col1.padEnd(14);
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
    if (v1[i] !== null && v2[i] !== null) {
      pairs.push([v1[i]!, v2[i]!]);
    }
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

export function runAllEDA(data: MovieRow[]): void {
  printShape(data);
  printDtypes();
  printHead(data);
  printTail(data);
  printInfo(data);
  printDescribe(data);
  printMissingValues(data);
  printCorrelation(data);
}
