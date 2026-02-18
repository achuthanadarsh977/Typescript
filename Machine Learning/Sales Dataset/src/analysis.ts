import * as fs from "node:fs";
import * as path from "node:path";
import Papa from "papaparse";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SalesRow {
  Date: string;
  Region: string;
  Product: string;
  Customer_Segment: string;
  Sales_Units: number | null;
  Unit_Price: number | null;
  Discount: number | null;
  Shipping_Cost: number | null;
  Profit_Margin: number;
  Returns: number;
  Revenue: number;
}

interface CleanRow extends SalesRow {
  Sales_Units: number;
  Unit_Price: number;
  Discount: number;
  Shipping_Cost: number;
  Month: string;
  Year: number;
}

// ─── Load CSV ────────────────────────────────────────────────────────────────
const csvPath = path.resolve(
  "C:/Users/SriniAchuthan/Downloads/professional_sales_dataset.csv",
);
const csvContent = fs.readFileSync(csvPath, "utf-8");

const parsed = Papa.parse<SalesRow>(csvContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
});

const rawData = parsed.data;
console.log(`\n  Loaded ${rawData.length} rows from CSV`);

// ─── Preview ─────────────────────────────────────────────────────────────────
console.log("\n  === First 5 Rows ===");
console.table(rawData.slice(0, 5));

console.log("\n  === Last 5 Rows ===");
console.table(rawData.slice(-5));

console.log(
  `\n  Shape: (${rawData.length}, ${Object.keys(rawData[0]).length})`,
);

// ─── Column Types ────────────────────────────────────────────────────────────
console.log("\n  === Column Types ===");
const firstRow = rawData[0];
for (const [key, val] of Object.entries(firstRow)) {
  console.log(`    ${key.padEnd(20)} ${typeof val}`);
}

// ─── Drop NaN / null rows ────────────────────────────────────────────────────
const cleanData: CleanRow[] = rawData
  .filter(
    (row) =>
      row.Sales_Units != null &&
      row.Unit_Price != null &&
      row.Discount != null &&
      row.Shipping_Cost != null,
  )
  .map((row) => {
    const date = new Date(row.Date);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return {
      ...row,
      Sales_Units: row.Sales_Units!,
      Unit_Price: row.Unit_Price!,
      Discount: row.Discount!,
      Shipping_Cost: row.Shipping_Cost!,
      Month: months[date.getMonth()],
      Year: date.getFullYear(),
    };
  });

console.log(
  `\n  After dropping nulls: ${cleanData.length} rows (removed ${rawData.length - cleanData.length})`,
);

// ─── Helper: Group By & Aggregate ────────────────────────────────────────────
function groupBy<T>(data: T[], keyFn: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of data) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return map;
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// ─── Aggregations for Charts ─────────────────────────────────────────────────

// Monthly Revenue
const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const byMonth = groupBy(cleanData, (r) => r.Month);
const monthlyRevenue = monthOrder
  .filter((m) => byMonth.has(m))
  .map((m) => ({
    label: m,
    value: Math.round(mean(byMonth.get(m)!.map((r) => r.Revenue)) * 100) / 100,
  }));

console.log("\n  === Monthly Average Revenue ===");
console.table(monthlyRevenue);

// Product vs Profit Margin
const byProduct = groupBy(cleanData, (r) => r.Product);
const productProfit = [...byProduct.entries()].map(([product, rows]) => ({
  label: product,
  value: Math.round(mean(rows.map((r) => r.Profit_Margin)) * 10000) / 10000,
}));

console.log("\n  === Product vs Average Profit Margin ===");
console.table(productProfit);

// Region vs Revenue
const byRegion = groupBy(cleanData, (r) => r.Region);
const regionRevenue = [...byRegion.entries()].map(([region, rows]) => ({
  label: region,
  value: Math.round(mean(rows.map((r) => r.Revenue)) * 100) / 100,
}));

console.log("\n  === Region vs Average Revenue ===");
console.table(regionRevenue);

// Box plot data: compute quartiles
function quartiles(nums: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
} {
  const sorted = [...nums].sort((a, b) => a - b);
  const len = sorted.length;
  const q = (p: number) => {
    const idx = p * (len - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  return {
    min: sorted[0],
    q1: q(0.25),
    median: q(0.5),
    q3: q(0.75),
    max: sorted[len - 1],
  };
}

// Shipping Cost stats
const shippingStats = quartiles(cleanData.map((r) => r.Shipping_Cost));
console.log("\n  === Shipping Cost Box Plot Stats ===");
console.table(shippingStats);

// Sales Units stats
const salesStats = quartiles(cleanData.map((r) => r.Sales_Units));
console.log("\n  === Sales Units Box Plot Stats ===");
console.table(salesStats);

// Revenue stats
const revenueStats = quartiles(cleanData.map((r) => r.Revenue));
console.log("\n  === Revenue Box Plot Stats ===");
console.table(revenueStats);

// ─── Key Insights ────────────────────────────────────────────────────────────
console.log(
  "\n  ╔══════════════════════════════════════════════════════════════╗",
);
console.log(
  "  ║            KEY INSIGHTS FROM SALES DATA ANALYSIS            ║",
);
console.log(
  "  ╠══════════════════════════════════════════════════════════════╣",
);

// Top product by revenue
const topProduct = [...byProduct.entries()]
  .map(([p, rows]) => ({ product: p, total: sum(rows.map((r) => r.Revenue)) }))
  .sort((a, b) => b.total - a.total);
console.log(
  `  ║  Product Performance:                                        ║`,
);
console.log(
  `  ║  ${topProduct[0].product} & ${topProduct[1].product} generated the highest revenue.`.padEnd(
    63,
  ) + "║",
);

// Top regions
const topRegion = [...byRegion.entries()]
  .map(([r, rows]) => ({ region: r, total: sum(rows.map((x) => x.Revenue)) }))
  .sort((a, b) => b.total - a.total);
console.log(
  `  ║  Regional Trends:                                            ║`,
);
console.log(
  `  ║  ${topRegion[0].region} & ${topRegion[1].region} regions recorded highest sales.`.padEnd(
    63,
  ) + "║",
);

// Peak months
const peakMonths = monthOrder
  .map((m) => ({
    month: m,
    total: sum((byMonth.get(m) || []).map((r) => r.Revenue)),
  }))
  .sort((a, b) => b.total - a.total);
console.log(
  `  ║  Seasonality:                                                ║`,
);
console.log(
  `  ║  ${peakMonths[0].month} & ${peakMonths[1].month} were peak sales months.`.padEnd(
    63,
  ) + "║",
);

// Customer segment with highest avg unit price
const bySeg = groupBy(cleanData, (r) => r.Customer_Segment);
const segPrices = [...bySeg.entries()]
  .map(([seg, rows]) => ({
    segment: seg,
    avgPrice: mean(rows.map((r) => r.Unit_Price)),
  }))
  .sort((a, b) => b.avgPrice - a.avgPrice);
console.log(
  `  ║  Customer Segment:                                           ║`,
);
console.log(
  `  ║  ${segPrices[0].segment} has highest avg unit price ($${segPrices[0].avgPrice.toFixed(2)}).`.padEnd(
    63,
  ) + "║",
);

console.log(
  "  ╚══════════════════════════════════════════════════════════════╝\n",
);

// ─── Generate Interactive HTML Charts ────────────────────────────────────────
const htmlPath = path.resolve(
  path.dirname(csvPath),
  "..",
  "OneDrive/Desktop/Typescript Machine Learning/Sales Dataset/charts.html",
);
const outputDir = path.dirname(
  path.resolve(
    "C:/Users/SriniAchuthan/OneDrive/Desktop/Typescript Machine Learning/Sales Dataset/charts.html",
  ),
);

const chartsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales Dataset Analysis - Charts</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f2f5; font-family: 'Segoe UI', sans-serif; padding: 30px; }
    h1 { text-align: center; margin-bottom: 30px; color: #333; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1200px; margin: 0 auto; }
    .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card.full { grid-column: 1 / -1; }
    canvas { width: 100% !important; max-height: 400px; }
    .insights { background: #1a1a2e; color: #e0e0e0; border-radius: 12px; padding: 30px; grid-column: 1 / -1; }
    .insights h2 { color: #4fc3f7; margin-bottom: 16px; }
    .insights ul { list-style: none; }
    .insights li { padding: 8px 0; border-bottom: 1px solid #333; font-size: 15px; }
    .insights li:last-child { border: none; }
    .insights strong { color: #81d4fa; }
  </style>
</head>
<body>
  <h1>Sales Dataset Analysis</h1>
  <div class="grid">
    <div class="card full">
      <canvas id="monthlyRevenue"></canvas>
    </div>
    <div class="card">
      <canvas id="productProfit"></canvas>
    </div>
    <div class="card">
      <canvas id="regionRevenue"></canvas>
    </div>
    <div class="card">
      <canvas id="shippingBox"></canvas>
    </div>
    <div class="card">
      <canvas id="salesBox"></canvas>
    </div>
    <div class="insights">
      <h2>Key Insights</h2>
      <ul>
        <li><strong>Product Performance:</strong> ${topProduct[0].product} & ${topProduct[1].product} generated the highest revenue, indicating strong market demand.</li>
        <li><strong>Regional Trends:</strong> ${topRegion[0].region} & ${topRegion[1].region} regions recorded the highest sales volumes.</li>
        <li><strong>Seasonality:</strong> ${peakMonths[0].month} & ${peakMonths[1].month} were peak sales months.</li>
        <li><strong>Customer Segment:</strong> ${segPrices[0].segment} segment reported the highest average unit price ($${segPrices[0].avgPrice.toFixed(2)}).</li>
        <li><strong>Dataset:</strong> ${cleanData.length} clean rows after removing ${rawData.length - cleanData.length} rows with missing values.</li>
      </ul>
    </div>
  </div>

  <script>
    const colors = ['#4fc3f7','#81c784','#ffb74d','#e57373','#ba68c8','#4db6ac','#ff8a65','#a1887f','#90a4ae','#fff176','#f06292','#7986cb'];

    // Monthly Revenue Bar Chart
    new Chart(document.getElementById('monthlyRevenue'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(monthlyRevenue.map((m) => m.label))},
        datasets: [{
          label: 'Average Revenue ($)',
          data: ${JSON.stringify(monthlyRevenue.map((m) => m.value))},
          backgroundColor: colors.slice(0, ${monthlyRevenue.length}),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Monthly Average Revenue', font: { size: 18 } } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Product vs Profit Margin
    new Chart(document.getElementById('productProfit'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(productProfit.map((p) => p.label))},
        datasets: [{
          label: 'Avg Profit Margin',
          data: ${JSON.stringify(productProfit.map((p) => p.value))},
          backgroundColor: ['#4fc3f7','#81c784','#ffb74d','#e57373','#ba68c8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Product vs Profit Margin', font: { size: 16 } } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Region vs Revenue
    new Chart(document.getElementById('regionRevenue'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(regionRevenue.map((r) => r.label))},
        datasets: [{
          label: 'Avg Revenue ($)',
          data: ${JSON.stringify(regionRevenue.map((r) => r.value))},
          backgroundColor: ['#4fc3f7','#81c784','#ffb74d','#e57373'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Region vs Revenue', font: { size: 16 } } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Shipping Cost Distribution
    const shippingData = ${JSON.stringify(cleanData.map((r) => r.Shipping_Cost))};
    new Chart(document.getElementById('shippingBox'), {
      type: 'bar',
      data: {
        labels: ['0-10','10-20','20-30','30-40','40-50'],
        datasets: [{
          label: 'Shipping Cost Distribution',
          data: [
            shippingData.filter(v => v < 10).length,
            shippingData.filter(v => v >= 10 && v < 20).length,
            shippingData.filter(v => v >= 20 && v < 30).length,
            shippingData.filter(v => v >= 30 && v < 40).length,
            shippingData.filter(v => v >= 40).length,
          ],
          backgroundColor: ['#4fc3f7','#81c784','#ffb74d','#e57373','#ba68c8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Shipping Cost Distribution', font: { size: 16 } } }
      }
    });

    // Sales Units Distribution
    const salesData = ${JSON.stringify(cleanData.map((r) => r.Sales_Units))};
    new Chart(document.getElementById('salesBox'), {
      type: 'bar',
      data: {
        labels: ['1-5','6-8','9-11','12-15'],
        datasets: [{
          label: 'Sales Units Distribution',
          data: [
            salesData.filter(v => v <= 5).length,
            salesData.filter(v => v > 5 && v <= 8).length,
            salesData.filter(v => v > 8 && v <= 11).length,
            salesData.filter(v => v > 11).length,
          ],
          backgroundColor: ['#4fc3f7','#81c784','#ffb74d','#e57373'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Sales Units Distribution', font: { size: 16 } } }
      }
    });
  </script>
</body>
</html>`;

const chartsPath = path.resolve(
  "C:/Users/SriniAchuthan/OneDrive/Desktop/Typescript Machine Learning/Sales Dataset/charts.html",
);
fs.writeFileSync(chartsPath, chartsHtml);
console.log(`  Charts saved to: ${chartsPath}`);
console.log(
  "  Open charts.html in your browser to see interactive visualizations!\n",
);
