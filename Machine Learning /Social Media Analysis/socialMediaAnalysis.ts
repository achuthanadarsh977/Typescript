/**
 * Social Media Usage Analysis
 * TypeScript conversion of Python Jupyter Notebook
 * With HTML/Plotly visualizations (like matplotlib/seaborn)
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// Types
interface SocialMediaRecord {
  User_ID: number;
  Age: number | null;
  Gender: string | null;
  Instagram_hrs: number | null;
  Facebook_hrs: number | null;
  YouTube_hrs: number | null;
  Purpose: string | null;
  Location: string;
  Device_Type: string;
  Daily_Sessions: number;
  Total_hrs?: number;
}

// Configuration
const CSV_PATH = String.raw`C:\Users\SriniAchuthan\OneDrive\Documents\Data Analysis Intern\social_media_usage_1000.csv`;
const OUTPUT_DIR = String.raw`C:\Users\SriniAchuthan\OneDrive\Desktop\Typescript Machine Learning\Social Media Analysis\outputs`;

// DataFrame class
class DataFrame {
  private data: SocialMediaRecord[];

  constructor(data: SocialMediaRecord[]) {
    this.data = data;
  }

  get shape(): [number, number] {
    return [
      this.data.length,
      this.data.length > 0 ? Object.keys(this.data[0]).length : 0,
    ];
  }

  get records(): SocialMediaRecord[] {
    return this.data;
  }

  head(n: number = 5): SocialMediaRecord[] {
    return this.data.slice(0, n);
  }

  tail(n: number = 5): SocialMediaRecord[] {
    return this.data.slice(-n);
  }

  dtypes(): Record<string, string> {
    if (this.data.length === 0) return {};
    const sample = this.data[0];
    const types: Record<string, string> = {};
    for (const key of Object.keys(sample)) {
      const value = sample[key as keyof SocialMediaRecord];
      types[key] = value === null ? "null" : typeof value;
    }
    return types;
  }

  dropNa(): DataFrame {
    const cleanData = this.data.filter((row) =>
      Object.values(row).every(
        (val) =>
          val !== null && val !== undefined && val !== "" && !Number.isNaN(val),
      ),
    );
    return new DataFrame(cleanData);
  }

  addColumn(name: string, values: number[]): DataFrame {
    const newData = this.data.map((row, idx) => ({
      ...row,
      [name]: values[idx],
    })) as SocialMediaRecord[];
    return new DataFrame(newData);
  }

  groupBy<K extends keyof SocialMediaRecord>(
    col: K,
  ): Map<SocialMediaRecord[K], SocialMediaRecord[]> {
    const groups = new Map<SocialMediaRecord[K], SocialMediaRecord[]>();
    for (const row of this.data) {
      const key = row[col];
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    return groups;
  }

  describe(col: keyof SocialMediaRecord) {
    const values = this.data
      .map((row) => row[col] as number | null)
      .filter((v): v is number => v !== null && !isNaN(v));
    if (values.length === 0) return null;
    const count = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / count;
    const sorted = [...values].sort((a, b) => a - b);
    const std = Math.sqrt(
      values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / count,
    );
    return {
      count,
      mean,
      std,
      min: sorted[0],
      median: sorted[Math.floor(count / 2)],
      max: sorted[count - 1],
    };
  }
}

// Load CSV
function loadCSV(filePath: string): DataFrame {
  console.log("Loading data from:", filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      if (value === "" || value === "NaN") return null;
      if (context.column === "User_ID" || context.column === "Daily_Sessions")
        return parseInt(value, 10);
      if (
        ["Age", "Instagram_hrs", "Facebook_hrs", "YouTube_hrs"].includes(
          context.column as string,
        )
      ) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      }
      return value;
    },
  }) as SocialMediaRecord[];
  return new DataFrame(records);
}

// Display info
function displayDataInfo(df: DataFrame, name: string = "DataFrame"): void {
  console.log(`\n${"=".repeat(60)}\n${name} Info\n${"=".repeat(60)}`);
  console.log("Shape:", df.shape);
  console.log("\nFirst 5 rows:");
  console.table(df.head(5));
  console.log("\nData Types:");
  console.table(df.dtypes());
}

// Add total hours
function addTotalHours(df: DataFrame): DataFrame {
  const totalHrs = df.records.map((row) => {
    const ig = row.Instagram_hrs ?? 0;
    const fb = row.Facebook_hrs ?? 0;
    const yt = row.YouTube_hrs ?? 0;
    return Number((ig + fb + yt).toFixed(1));
  });
  return df.addColumn("Total_hrs", totalHrs);
}

// Find top user
function findTopUser(df: DataFrame): SocialMediaRecord | null {
  let maxUser: SocialMediaRecord | null = null;
  let maxHours = -Infinity;
  for (const row of df.records) {
    if (row.Total_hrs !== undefined && row.Total_hrs > maxHours) {
      maxHours = row.Total_hrs;
      maxUser = row;
    }
  }
  return maxUser;
}

// Find young minimalist
function findYoungMinimalist(df: DataFrame): SocialMediaRecord | null {
  let minUser: SocialMediaRecord | null = null;
  let minHours = Infinity;
  for (const row of df.records) {
    if (
      row.Age !== null &&
      row.Age < 18 &&
      row.Total_hrs !== undefined &&
      row.Total_hrs < minHours
    ) {
      minHours = row.Total_hrs;
      minUser = row;
    }
  }
  return minUser;
}

// Linear Regression
class SimpleLinearRegression {
  private slope: number = 0;
  private intercept: number = 0;

  fit(X: number[], y: number[]): void {
    const n = X.length;
    const meanX = X.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (X[i] - meanX) * (y[i] - meanY);
      den += (X[i] - meanX) ** 2;
    }
    this.slope = den !== 0 ? num / den : 0;
    this.intercept = meanY - this.slope * meanX;
  }

  predict(X: number[]): number[] {
    return X.map((x) => this.slope * x + this.intercept);
  }

  getCoefficients() {
    return { slope: this.slope, intercept: this.intercept };
  }
}

function trainTestSplit(X: number[], y: number[], testSize: number = 0.2) {
  const indices = Array.from({ length: X.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const splitIdx = Math.floor(X.length * (1 - testSize));
  return {
    X_train: indices.slice(0, splitIdx).map((i) => X[i]),
    X_test: indices.slice(splitIdx).map((i) => X[i]),
    y_train: indices.slice(0, splitIdx).map((i) => y[i]),
    y_test: indices.slice(splitIdx).map((i) => y[i]),
  };
}

function meanSquaredError(actual: number[], predicted: number[]): number {
  return (
    actual.reduce((sum, val, idx) => sum + (val - predicted[idx]) ** 2, 0) /
    actual.length
  );
}

function r2Score(actual: number[], predicted: number[]): number {
  const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
  const ssRes = actual.reduce(
    (sum, val, idx) => sum + (val - predicted[idx]) ** 2,
    0,
  );
  const ssTot = actual.reduce((sum, val) => sum + (val - meanActual) ** 2, 0);
  return ssTot !== 0 ? 1 - ssRes / ssTot : 0;
}

// ============== VISUALIZATIONS ==============

function createDashboard(df: DataFrame, cleanDf: DataFrame): string {
  const instagram = df.records
    .map((r) => r.Instagram_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));
  const facebook = df.records
    .map((r) => r.Facebook_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));
  const youtube = df.records
    .map((r) => r.YouTube_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));

  // Gender data
  const genderGroups = df.groupBy("Gender");
  const genderTraces: object[] = [];
  const genderColors: Record<string, string> = {
    Male: "#3498db",
    Female: "#e74c3c",
    Other: "#2ecc71",
  };
  for (const [gender, records] of genderGroups) {
    if (!gender) continue;
    const values = records
      .map((r) => r.Facebook_hrs)
      .filter((v): v is number => v !== null && !isNaN(v));
    genderTraces.push({
      y: values,
      type: "box",
      name: gender,
      marker: { color: genderColors[gender] || "#95a5a6" },
      boxmean: true,
    });
  }

  // Age scatter
  const ageData = cleanDf.records.filter(
    (r) => r.Age !== null && r.Total_hrs !== undefined,
  );
  const ages = ageData.map((r) => r.Age as number);
  const totalHrs = ageData.map((r) => r.Total_hrs as number);

  // Purpose data
  const purposeGroups = cleanDf.groupBy("Purpose");
  const purposeTraces: object[] = [];
  const purposeColors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];
  let pIdx = 0;
  for (const [purpose, records] of purposeGroups) {
    if (!purpose) continue;
    const values = records
      .map((r) => r.Total_hrs)
      .filter((v): v is number => v !== undefined);
    purposeTraces.push({
      x: values,
      type: "box",
      name: purpose,
      marker: { color: purposeColors[pIdx++ % 5] },
    });
  }

  // Device data
  const deviceGroups = cleanDf.groupBy("Device_Type");
  const deviceTraces: object[] = [];
  const deviceColors: Record<string, string> = {
    Desktop: "#3498db",
    Mobile: "#2ecc71",
    Tablet: "#f39c12",
  };
  for (const [device, records] of deviceGroups) {
    deviceTraces.push({
      y: records.map((r) => r.Daily_Sessions),
      type: "box",
      name: device,
      marker: { color: deviceColors[device] || "#95a5a6" },
    });
  }

  // Location data
  const locationGroups = cleanDf.groupBy("Location");
  const locations: string[] = [];
  const avgHours: number[] = [];
  for (const [location, records] of locationGroups) {
    const values = records
      .map((r) => r.Total_hrs)
      .filter((v): v is number => v !== undefined);
    locations.push(location);
    avgHours.push(
      Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    );
  }

  const topUser = findTopUser(cleanDf);
  const youngMin = findYoungMinimalist(cleanDf);
  const avgTotal = (
    totalHrs.reduce((a, b) => a + b, 0) / totalHrs.length
  ).toFixed(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media Analysis Dashboard</title>
    <script src="https://cdn.plot.ly/plotly-2.29.1.min.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; padding: 20px; }
        .dashboard { max-width: 1400px; margin: 0 auto; }
        h1 { color: white; text-align: center; margin-bottom: 25px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .stat h3 { color: #667eea; font-size: 14px; margin-bottom: 8px; }
        .stat .val { font-size: 32px; font-weight: bold; color: #333; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .card.wide { grid-column: span 2; }
        .card h2 { color: #333; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
        .plot { height: 320px; }
        .cases { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .case { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .case h3 { color: #667eea; margin-bottom: 10px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #667eea; color: white; }
        .highlight { font-weight: bold; color: #667eea; }
        @media (max-width: 900px) { .grid, .cases, .stats { grid-template-columns: 1fr; } .card.wide { grid-column: span 1; } }
    </style>
</head>
<body>
    <div class="dashboard">
        <h1>Social Media Usage Analysis Dashboard</h1>
        <div class="stats">
            <div class="stat"><h3>Total Records</h3><div class="val">${df.shape[0]}</div></div>
            <div class="stat"><h3>Clean Records</h3><div class="val">${cleanDf.shape[0]}</div></div>
            <div class="stat"><h3>Avg Total Hours</h3><div class="val">${avgTotal}</div></div>
        </div>
        <div class="grid">
            <div class="card"><h2>Platform Usage Distribution</h2><div id="p1" class="plot"></div></div>
            <div class="card"><h2>Facebook Usage by Gender</h2><div id="p2" class="plot"></div></div>
            <div class="card"><h2>Age vs Total Hours</h2><div id="p3" class="plot"></div></div>
            <div class="card"><h2>Total Hours by Purpose</h2><div id="p4" class="plot"></div></div>
            <div class="card"><h2>Daily Sessions by Device</h2><div id="p5" class="plot"></div></div>
            <div class="card"><h2>Average Hours by Location</h2><div id="p6" class="plot"></div></div>
            <div class="card wide">
                <h2>Case Studies</h2>
                <div class="cases">
                    <div class="case">
                        <h3>Top User (Maximum Usage)</h3>
                        <table>
                            <tr><th>Attribute</th><th>Value</th></tr>
                            <tr><td>User ID</td><td>${topUser?.User_ID}</td></tr>
                            <tr><td>Age</td><td>${topUser?.Age}</td></tr>
                            <tr><td>Gender</td><td>${topUser?.Gender}</td></tr>
                            <tr><td>Total Hours</td><td class="highlight">${topUser?.Total_hrs}</td></tr>
                            <tr><td>Purpose</td><td>${topUser?.Purpose}</td></tr>
                            <tr><td>Location</td><td>${topUser?.Location}</td></tr>
                        </table>
                    </div>
                    <div class="case">
                        <h3>Young Minimalist (Under 18)</h3>
                        <table>
                            <tr><th>Attribute</th><th>Value</th></tr>
                            <tr><td>User ID</td><td>${youngMin?.User_ID}</td></tr>
                            <tr><td>Age</td><td>${youngMin?.Age}</td></tr>
                            <tr><td>Gender</td><td>${youngMin?.Gender}</td></tr>
                            <tr><td>Total Hours</td><td class="highlight">${youngMin?.Total_hrs}</td></tr>
                            <tr><td>Purpose</td><td>${youngMin?.Purpose}</td></tr>
                            <tr><td>Location</td><td>${youngMin?.Location}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        const cfg = {responsive: true};
        const m = {t: 10, b: 40, l: 50, r: 20};

        Plotly.newPlot('p1', [
            {y: ${JSON.stringify(instagram)}, type: 'box', name: 'Instagram', marker: {color: '#E1306C'}, boxmean: true},
            {y: ${JSON.stringify(facebook)}, type: 'box', name: 'Facebook', marker: {color: '#4267B2'}, boxmean: true},
            {y: ${JSON.stringify(youtube)}, type: 'box', name: 'YouTube', marker: {color: '#FF0000'}, boxmean: true}
        ], {margin: m, yaxis: {title: 'Hours/day'}}, cfg);

        Plotly.newPlot('p2', ${JSON.stringify(genderTraces)}, {margin: m, yaxis: {title: 'Hours/day'}}, cfg);

        Plotly.newPlot('p3', [{
            x: ${JSON.stringify(ages)}, y: ${JSON.stringify(totalHrs)}, mode: 'markers', type: 'scatter',
            marker: {color: 'rgba(102,126,234,0.6)', size: 6}
        }], {margin: m, xaxis: {title: 'Age'}, yaxis: {title: 'Total Hours'}}, cfg);

        Plotly.newPlot('p4', ${JSON.stringify(purposeTraces)}, {margin: m, xaxis: {title: 'Hours/day'}}, cfg);

        Plotly.newPlot('p5', ${JSON.stringify(deviceTraces)}, {margin: m, yaxis: {title: 'Sessions'}}, cfg);

        Plotly.newPlot('p6', [{
            x: ${JSON.stringify(locations)}, y: ${JSON.stringify(avgHours)}, type: 'bar',
            marker: {color: ['#3498db', '#2ecc71', '#e74c3c']},
            text: ${JSON.stringify(avgHours.map(String))}, textposition: 'auto'
        }], {margin: m, yaxis: {title: 'Avg Hours'}}, cfg);
    </script>
</body>
</html>`;
}

// Individual plot generators
function createPlotHTML(title: string, plotScript: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title}</title>
<script src="https://cdn.plot.ly/plotly-2.29.1.min.js"></script>
<style>body{font-family:sans-serif;padding:20px;background:#f5f5f5}
.container{max-width:900px;margin:0 auto;background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
h1{color:#333;text-align:center}#plot{height:500px}</style></head>
<body><div class="container"><h1>${title}</h1><div id="plot"></div></div>
<script>${plotScript}</script></body></html>`;
}

function saveVisualizations(df: DataFrame, cleanDf: DataFrame): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(
    "\n" + "=".repeat(60) + "\nGenerating Visualizations\n" + "=".repeat(60),
  );

  const instagram = df.records
    .map((r) => r.Instagram_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));
  const facebook = df.records
    .map((r) => r.Facebook_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));
  const youtube = df.records
    .map((r) => r.YouTube_hrs)
    .filter((v): v is number => v !== null && !isNaN(v));

  // 1. Platform boxplot
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "1_platform_boxplot.html"),
    createPlotHTML(
      "Distribution of Time Spent on Social Media Platforms",
      `Plotly.newPlot('plot', [
      {y: ${JSON.stringify(instagram)}, type: 'box', name: 'Instagram', marker: {color: '#E1306C'}, boxmean: true},
      {y: ${JSON.stringify(facebook)}, type: 'box', name: 'Facebook', marker: {color: '#4267B2'}, boxmean: true},
      {y: ${JSON.stringify(youtube)}, type: 'box', name: 'YouTube', marker: {color: '#FF0000'}, boxmean: true}
    ], {yaxis: {title: 'Hours per day'}, xaxis: {title: 'Platform'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 1_platform_boxplot.html");

  // 2. Gender Facebook boxplot
  const genderTraces: string[] = [];
  const genderColors: Record<string, string> = {
    Male: "#3498db",
    Female: "#e74c3c",
    Other: "#2ecc71",
  };
  for (const [gender, records] of df.groupBy("Gender")) {
    if (!gender) continue;
    const values = records
      .map((r) => r.Facebook_hrs)
      .filter((v): v is number => v !== null && !isNaN(v));
    genderTraces.push(
      `{y: ${JSON.stringify(values)}, type: 'box', name: '${gender}', marker: {color: '${genderColors[gender] || "#95a5a6"}'}, boxmean: true}`,
    );
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "2_gender_facebook_boxplot.html"),
    createPlotHTML(
      "Facebook Usage by Gender",
      `Plotly.newPlot('plot', [${genderTraces.join(",")}], {yaxis: {title: 'Facebook Hours/day'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 2_gender_facebook_boxplot.html");

  // 3. Age scatter
  const ageData = cleanDf.records.filter(
    (r) => r.Age !== null && r.Total_hrs !== undefined,
  );
  const ages = ageData.map((r) => r.Age as number);
  const totalHrs = ageData.map((r) => r.Total_hrs as number);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "3_age_scatter.html"),
    createPlotHTML(
      "Age vs Total Social Media Hours",
      `Plotly.newPlot('plot', [{x: ${JSON.stringify(ages)}, y: ${JSON.stringify(totalHrs)}, mode: 'markers', type: 'scatter', marker: {color: 'rgba(102,126,234,0.6)', size: 8}}], {xaxis: {title: 'Age'}, yaxis: {title: 'Total Hours/day'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 3_age_scatter.html");

  // 4. Purpose boxplot
  const purposeTraces: string[] = [];
  const purposeColors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];
  let pIdx = 0;
  for (const [purpose, records] of cleanDf.groupBy("Purpose")) {
    if (!purpose) continue;
    const values = records
      .map((r) => r.Total_hrs)
      .filter((v): v is number => v !== undefined);
    purposeTraces.push(
      `{x: ${JSON.stringify(values)}, type: 'box', name: '${purpose}', marker: {color: '${purposeColors[pIdx++ % 5]}'}}`,
    );
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "4_purpose_boxplot.html"),
    createPlotHTML(
      "Total Hours by Purpose",
      `Plotly.newPlot('plot', [${purposeTraces.join(",")}], {xaxis: {title: 'Total Hours/day'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 4_purpose_boxplot.html");

  // 5. Device boxplot
  const deviceTraces: string[] = [];
  const deviceColors: Record<string, string> = {
    Desktop: "#3498db",
    Mobile: "#2ecc71",
    Tablet: "#f39c12",
  };
  for (const [device, records] of cleanDf.groupBy("Device_Type")) {
    const values = records.map((r) => r.Daily_Sessions);
    deviceTraces.push(
      `{y: ${JSON.stringify(values)}, type: 'box', name: '${device}', marker: {color: '${deviceColors[device] || "#95a5a6"}'}}`,
    );
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "5_device_boxplot.html"),
    createPlotHTML(
      "Daily Sessions by Device Type",
      `Plotly.newPlot('plot', [${deviceTraces.join(",")}], {yaxis: {title: 'Daily Sessions'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 5_device_boxplot.html");

  // 6. Location bar chart
  const locations: string[] = [];
  const avgHours: number[] = [];
  for (const [location, records] of cleanDf.groupBy("Location")) {
    const values = records
      .map((r) => r.Total_hrs)
      .filter((v): v is number => v !== undefined);
    locations.push(location);
    avgHours.push(
      Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    );
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "6_location_barchart.html"),
    createPlotHTML(
      "Average Total Hours by Location",
      `Plotly.newPlot('plot', [{x: ${JSON.stringify(locations)}, y: ${JSON.stringify(avgHours)}, type: 'bar', marker: {color: ['#3498db', '#2ecc71', '#e74c3c']}, text: ${JSON.stringify(avgHours.map(String))}, textposition: 'auto'}], {yaxis: {title: 'Average Hours/day'}}, {responsive: true});`,
    ),
  );
  console.log("  Created: 6_location_barchart.html");

  // Dashboard
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "dashboard.html"),
    createDashboard(df, cleanDf),
  );
  console.log("  Created: dashboard.html");

  console.log(`\nAll visualizations saved to: ${OUTPUT_DIR}`);
}

// Save results
function saveResults(df: DataFrame): void {
  const summary = {
    totalRecords: df.shape[0],
    columns: df.dtypes(),
    platformStats: {
      Instagram: df.describe("Instagram_hrs"),
      Facebook: df.describe("Facebook_hrs"),
      YouTube: df.describe("YouTube_hrs"),
    },
    topUser: findTopUser(df),
    youngMinimalist: findYoungMinimalist(df),
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "analysis_summary.json"),
    JSON.stringify(summary, null, 2),
  );
}

// Main
async function main(): Promise<void> {
  console.log(
    "=".repeat(60) +
      "\nSOCIAL MEDIA USAGE ANALYSIS\nTypeScript Implementation\n" +
      "=".repeat(60),
  );

  let df = loadCSV(CSV_PATH);
  displayDataInfo(df, "Original Data");

  df = addTotalHours(df);
  console.log("\nAdded Total_hrs column");

  const cleanDf = df.dropNa();
  console.log(
    `After dropping nulls: ${cleanDf.shape[0]} rows (from ${df.shape[0]})`,
  );

  // Case Studies
  console.log("\n" + "=".repeat(60) + "\nCASE STUDIES\n" + "=".repeat(60));
  const topUser = findTopUser(cleanDf);
  if (topUser) {
    console.log("\nTop User (Maximum Total Hours):");
    console.table([topUser]);
  }
  const youngMin = findYoungMinimalist(cleanDf);
  if (youngMin) {
    console.log("\nYoung Minimalist (Under 18):");
    console.table([youngMin]);
  }

  // Linear Regression
  console.log(
    "\n" +
      "=".repeat(60) +
      "\nLinear Regression: Age vs Total Hours\n" +
      "=".repeat(60),
  );
  const validData = cleanDf.records.filter(
    (r) => r.Age !== null && r.Total_hrs !== undefined,
  );
  const X = validData.map((r) => r.Age as number);
  const y = validData.map((r) => r.Total_hrs as number);
  const { X_train, X_test, y_train, y_test } = trainTestSplit(X, y);
  const model = new SimpleLinearRegression();
  model.fit(X_train, y_train);
  const y_pred = model.predict(X_test);
  const coeffs = model.getCoefficients();
  console.log(
    `Samples: ${X.length} | Train: ${X_train.length} | Test: ${X_test.length}`,
  );
  console.log(
    `Slope: ${coeffs.slope.toFixed(4)} | Intercept: ${coeffs.intercept.toFixed(4)}`,
  );
  console.log(
    `MSE: ${meanSquaredError(y_test, y_pred).toFixed(4)} | R²: ${r2Score(y_test, y_pred).toFixed(4)}`,
  );

  // Save visualizations and results
  saveVisualizations(df, cleanDf);
  saveResults(cleanDf);

  console.log(
    "\n" + "=".repeat(60) + "\nAnalysis Complete!\n" + "=".repeat(60),
  );
  console.log(
    "\nOpen dashboard.html in your browser to view all visualizations.",
  );
}

main().catch(console.error);
