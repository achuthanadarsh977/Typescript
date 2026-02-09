import { createCanvas } from "@napi-rs/canvas";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import * as fs from "fs";
import * as path from "path";
import { SleepRow } from "./dataframe";
import { getMissingCounts } from "./eda";

Chart.register(...registerables);

const WIDTH = 800;
const HEIGHT = 600;
const OUTPUT_DIR = path.join(__dirname, "..", "output");

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function savePng(config: ChartConfiguration, filename: string): void {
  ensureOutputDir();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  new Chart(ctx as unknown as CanvasRenderingContext2D, {
    ...config,
    options: { ...config.options, responsive: false, animation: false },
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, filename),
    canvas.toBuffer("image/png"),
  );
  console.log(`  Saved: output/${filename}`);
}

function saveHtml(
  title: string,
  chartConfig: string,
  filename: string,
  h = 600,
): void {
  ensureOutputDir();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}.container{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);padding:30px;max-width:900px;width:95%}h1{text-align:center;color:#333;margin-bottom:20px;font-size:1.4rem}canvas{max-width:100%}</style>
</head>
<body>
  <div class="container"><h1>${title}</h1><canvas id="chart" width="800" height="${h}"></canvas></div>
  <script>new Chart(document.getElementById('chart').getContext('2d'), ${chartConfig});</script>
</body>
</html>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
  console.log(`  Saved: output/${filename}`);
}

// Helper: group by string col → mean of numeric col
function groupByMean(
  data: SleepRow[],
  groupCol: string,
  valueCol: string,
): { labels: string[]; values: number[] } {
  const groups: Record<string, number[]> = {};
  for (const row of data) {
    const key = (row as any)[groupCol] as string | null;
    const val = (row as any)[valueCol] as number | null;
    if (key !== null && val !== null) {
      if (!groups[key]) groups[key] = [];
      groups[key].push(val);
    }
  }
  const labels = Object.keys(groups).sort();
  const values = labels.map(
    (l) => groups[l].reduce((s, v) => s + v, 0) / groups[l].length,
  );
  return { labels, values };
}

// Helper: box plot stats by group
function groupBoxStats(data: SleepRow[], groupCol: string, valueCol: string) {
  const groups: Record<string, number[]> = {};
  for (const row of data) {
    const key = (row as any)[groupCol];
    const val = (row as any)[valueCol];
    if (key !== null && val !== null) {
      const k = String(key);
      if (!groups[k]) groups[k] = [];
      groups[k].push(val as number);
    }
  }
  const labels = Object.keys(groups).sort((a, b) => Number(a) - Number(b));
  const stats = labels.map((l) => {
    const vals = groups[l].sort((a, b) => a - b);
    const n = vals.length;
    return {
      min: vals[0],
      q1: vals[Math.floor(n * 0.25)],
      median: vals[Math.floor(n * 0.5)],
      q3: vals[Math.floor(n * 0.75)],
      max: vals[n - 1],
    };
  });
  return { labels, stats };
}

// 1. Missing Values
function chart1(data: SleepRow[]): void {
  const { columns, counts } = getMissingCounts(data);
  const cfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels: columns,
      datasets: [
        {
          label: "Missing Values",
          data: counts,
          backgroundColor: "rgba(255,99,132,0.7)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Missing Values per Column",
          font: { size: 18 },
        },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Count" } },
      },
    },
  };
  savePng(cfg, "01_missing_values.png");
  saveHtml(
    "Missing Values per Column",
    `{ type:'bar', data:{ labels:${JSON.stringify(columns)}, datasets:[{ label:'Missing Values', data:${JSON.stringify(counts)}, backgroundColor:'rgba(255,99,132,0.7)', borderWidth:1 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Missing Values per Column', font:{size:18} } }, scales:{ y:{ beginAtZero:true } } } }`,
    "01_missing_values.html",
  );
}

// 2. Mood Score Histogram
function chart2(data: SleepRow[]): void {
  const vals = data
    .map((r) => r.Mood_Score)
    .filter((v): v is number => v !== null);
  const bins: number[] = new Array(10).fill(0);
  const binLabels = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  for (const v of vals) {
    const idx = Math.min(Math.floor(v) - 1, 9);
    if (idx >= 0) bins[idx]++;
  }
  const cfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels: binLabels,
      datasets: [
        {
          label: "Frequency",
          data: bins,
          backgroundColor: "rgba(255,69,58,0.7)",
          borderColor: "rgba(255,69,58,1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Mood Score Distribution",
          font: { size: 18 },
        },
      },
      scales: {
        x: { title: { display: true, text: "Mood Score" } },
        y: { beginAtZero: true, title: { display: true, text: "Frequency" } },
      },
    },
  };
  savePng(cfg, "02_mood_score_histogram.png");
  saveHtml(
    "Mood Score Distribution",
    `{ type:'bar', data:{ labels:${JSON.stringify(binLabels)}, datasets:[{ label:'Frequency', data:${JSON.stringify(bins)}, backgroundColor:'rgba(255,69,58,0.7)', borderColor:'rgba(255,69,58,1)', borderWidth:1 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Mood Score Distribution', font:{size:18} } }, scales:{ x:{ title:{ display:true, text:'Mood Score' } }, y:{ beginAtZero:true, title:{ display:true, text:'Frequency' } } } } }`,
    "02_mood_score_histogram.html",
  );
}

// 3. Sleep Duration vs Mood Score (scatter)
function chart3(data: SleepRow[]): void {
  const pts: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Sleep_Duration !== null && row.Mood_Score !== null)
      pts.push({ x: row.Sleep_Duration, y: row.Mood_Score });
  }
  const cfg: ChartConfiguration = {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Sleep vs Mood",
          data: pts,
          backgroundColor: "rgba(54,162,235,0.6)",
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Sleep Duration vs Mood Score",
          font: { size: 18 },
        },
      },
      scales: {
        x: { title: { display: true, text: "Sleep Duration (hrs)" } },
        y: { title: { display: true, text: "Mood Score" } },
      },
    },
  };
  savePng(cfg, "03_sleep_vs_mood.png");
  saveHtml(
    "Sleep Duration vs Mood Score",
    `{ type:'scatter', data:{ datasets:[{ label:'Sleep vs Mood', data:${JSON.stringify(pts)}, backgroundColor:'rgba(54,162,235,0.6)', pointRadius:3 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Sleep Duration vs Mood Score', font:{size:18} } }, scales:{ x:{ title:{ display:true, text:'Sleep Duration (hrs)' } }, y:{ title:{ display:true, text:'Mood Score' } } } } }`,
    "03_sleep_vs_mood.html",
  );
}

// 4. Alcohol Consumed vs Mood Score (bar)
function chart4(data: SleepRow[]): void {
  const { labels, values } = groupByMean(
    data,
    "Alcohol_Consumed",
    "Mood_Score",
  );
  const cfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Mean Mood Score",
          data: values,
          backgroundColor: ["rgba(54,162,235,0.7)", "rgba(255,159,64,0.7)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Drinkers vs Non-drinkers (Mean Mood)",
          font: { size: 18 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Mean Mood Score" },
        },
      },
    },
  };
  savePng(cfg, "04_alcohol_vs_mood.png");
  saveHtml(
    "Drinkers vs Non-drinkers",
    `{ type:'bar', data:{ labels:${JSON.stringify(labels)}, datasets:[{ label:'Mean Mood Score', data:${JSON.stringify(values)}, backgroundColor:['rgba(54,162,235,0.7)','rgba(255,159,64,0.7)'], borderWidth:1 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Drinkers vs Non-drinkers (Mean Mood)', font:{size:18} } }, scales:{ y:{ beginAtZero:true } } } }`,
    "04_alcohol_vs_mood.html",
  );
}

// 5. Journaling vs Mood Score (bar)
function chart5(data: SleepRow[]): void {
  const { labels, values } = groupByMean(data, "Journaled", "Mood_Score");
  const cfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Mean Mood Score",
          data: values,
          backgroundColor: ["rgba(75,192,192,0.7)", "rgba(153,102,255,0.7)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Journaling vs Mood Score",
          font: { size: 18 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Mean Mood Score" },
        },
      },
    },
  };
  savePng(cfg, "05_journaling_vs_mood.png");
  saveHtml(
    "Journaling vs Mood Score",
    `{ type:'bar', data:{ labels:${JSON.stringify(labels)}, datasets:[{ label:'Mean Mood Score', data:${JSON.stringify(values)}, backgroundColor:['rgba(75,192,192,0.7)','rgba(153,102,255,0.7)'], borderWidth:1 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Journaling vs Mood Score', font:{size:18} } }, scales:{ y:{ beginAtZero:true } } } }`,
    "05_journaling_vs_mood.html",
  );
}

// 6. Screen Time vs Mood Score (scatter)
function chart6(data: SleepRow[]): void {
  const pts: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Screen_Time_Hours !== null && row.Mood_Score !== null)
      pts.push({ x: row.Screen_Time_Hours, y: row.Mood_Score });
  }
  const cfg: ChartConfiguration = {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Screen Time vs Mood",
          data: pts,
          backgroundColor: "rgba(255,206,86,0.6)",
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Screen Time vs Mood Score",
          font: { size: 18 },
        },
      },
      scales: {
        x: { title: { display: true, text: "Screen Time (hrs)" } },
        y: { title: { display: true, text: "Mood Score" } },
      },
    },
  };
  savePng(cfg, "06_screen_time_vs_mood.png");
  saveHtml(
    "Screen Time vs Mood Score",
    `{ type:'scatter', data:{ datasets:[{ label:'Screen Time vs Mood', data:${JSON.stringify(pts)}, backgroundColor:'rgba(255,206,86,0.6)', pointRadius:3 }] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Screen Time vs Mood Score', font:{size:18} } }, scales:{ x:{ title:{ display:true, text:'Screen Time (hrs)' } }, y:{ title:{ display:true, text:'Mood Score' } } } } }`,
    "06_screen_time_vs_mood.html",
  );
}

// 7. Stress Level vs Screen Time (box plot stats)
function chart7(data: SleepRow[]): void {
  const { labels, stats } = groupBoxStats(
    data,
    "Stress_Level",
    "Screen_Time_Hours",
  );
  const cfg: ChartConfiguration = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Min",
          data: stats.map((s) => s.min),
          backgroundColor: "rgba(54,162,235,0.3)",
          borderWidth: 1,
        },
        {
          label: "Q1",
          data: stats.map((s) => s.q1),
          backgroundColor: "rgba(54,162,235,0.5)",
          borderWidth: 1,
        },
        {
          label: "Median",
          data: stats.map((s) => s.median),
          backgroundColor: "rgba(255,206,86,0.8)",
          borderWidth: 1,
        },
        {
          label: "Q3",
          data: stats.map((s) => s.q3),
          backgroundColor: "rgba(75,192,192,0.5)",
          borderWidth: 1,
        },
        {
          label: "Max",
          data: stats.map((s) => s.max),
          backgroundColor: "rgba(255,99,132,0.3)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Stress Level vs Screen Time (Box Plot Stats)",
          font: { size: 18 },
        },
      },
      scales: {
        x: { title: { display: true, text: "Stress Level" } },
        y: { title: { display: true, text: "Screen Time (hrs)" } },
      },
    },
  };
  savePng(cfg, "07_stress_vs_screen_time.png");
  saveHtml(
    "Stress Level vs Screen Time",
    `{ type:'bar', data:{ labels:${JSON.stringify(labels)}, datasets:[
    { label:'Min', data:${JSON.stringify(stats.map((s) => s.min))}, backgroundColor:'rgba(54,162,235,0.3)', borderWidth:1 },
    { label:'Q1', data:${JSON.stringify(stats.map((s) => s.q1))}, backgroundColor:'rgba(54,162,235,0.5)', borderWidth:1 },
    { label:'Median', data:${JSON.stringify(stats.map((s) => s.median))}, backgroundColor:'rgba(255,206,86,0.8)', borderWidth:1 },
    { label:'Q3', data:${JSON.stringify(stats.map((s) => s.q3))}, backgroundColor:'rgba(75,192,192,0.5)', borderWidth:1 },
    { label:'Max', data:${JSON.stringify(stats.map((s) => s.max))}, backgroundColor:'rgba(255,99,132,0.3)', borderWidth:1 }
  ] }, options:{ responsive:true, plugins:{ title:{ display:true, text:'Stress Level vs Screen Time (Box Plot Stats)', font:{size:18} } }, scales:{ x:{ title:{ display:true, text:'Stress Level' } }, y:{ title:{ display:true, text:'Screen Time (hrs)' } } } } }`,
    "07_stress_vs_screen_time.html",
  );
}

// Dashboard
function chartDashboard(data: SleepRow[]): void {
  ensureOutputDir();
  const { columns, counts } = getMissingCounts(data);
  const moodVals = data
    .map((r) => r.Mood_Score)
    .filter((v): v is number => v !== null);
  const moodBins: number[] = new Array(10).fill(0);
  for (const v of moodVals) {
    const idx = Math.min(Math.floor(v) - 1, 9);
    if (idx >= 0) moodBins[idx]++;
  }
  const moodBinLabels = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const sleepMood: { x: number; y: number }[] = [];
  for (const r of data) {
    if (r.Sleep_Duration !== null && r.Mood_Score !== null)
      sleepMood.push({ x: r.Sleep_Duration, y: r.Mood_Score });
  }
  const alc = groupByMean(data, "Alcohol_Consumed", "Mood_Score");
  const jour = groupByMean(data, "Journaled", "Mood_Score");
  const screenMood: { x: number; y: number }[] = [];
  for (const r of data) {
    if (r.Screen_Time_Hours !== null && r.Mood_Score !== null)
      screenMood.push({ x: r.Screen_Time_Hours, y: r.Mood_Score });
  }

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Mood vs Sleep Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#f0f2f5;padding:20px}h1.t{text-align:center;color:#333;margin-bottom:30px;font-size:2rem}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:24px;max-width:1400px;margin:0 auto}.c{background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:20px}.c h2{text-align:center;color:#555;margin-bottom:12px;font-size:1rem}canvas{max-width:100%}</style>
</head><body>
<h1 class="t">Mood vs Sleep Tracker Dashboard</h1>
<div class="g">
  <div class="c"><h2>Missing Values</h2><canvas id="c1"></canvas></div>
  <div class="c"><h2>Mood Score Distribution</h2><canvas id="c2"></canvas></div>
  <div class="c"><h2>Sleep Duration vs Mood</h2><canvas id="c3"></canvas></div>
  <div class="c"><h2>Alcohol vs Mood</h2><canvas id="c4"></canvas></div>
  <div class="c"><h2>Journaling vs Mood</h2><canvas id="c5"></canvas></div>
  <div class="c"><h2>Screen Time vs Mood</h2><canvas id="c6"></canvas></div>
</div>
<script>
new Chart(document.getElementById('c1'),{type:'bar',data:{labels:${JSON.stringify(columns)},datasets:[{label:'Missing',data:${JSON.stringify(counts)},backgroundColor:'rgba(255,99,132,0.7)',borderWidth:1}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
new Chart(document.getElementById('c2'),{type:'bar',data:{labels:${JSON.stringify(moodBinLabels)},datasets:[{label:'Frequency',data:${JSON.stringify(moodBins)},backgroundColor:'rgba(255,69,58,0.7)',borderWidth:1}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
new Chart(document.getElementById('c3'),{type:'scatter',data:{datasets:[{label:'Sleep vs Mood',data:${JSON.stringify(sleepMood)},backgroundColor:'rgba(54,162,235,0.6)',pointRadius:3}]},options:{responsive:true,scales:{x:{title:{display:true,text:'Sleep (hrs)'}},y:{title:{display:true,text:'Mood'}}}}});
new Chart(document.getElementById('c4'),{type:'bar',data:{labels:${JSON.stringify(alc.labels)},datasets:[{label:'Mean Mood',data:${JSON.stringify(alc.values)},backgroundColor:['rgba(54,162,235,0.7)','rgba(255,159,64,0.7)'],borderWidth:1}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
new Chart(document.getElementById('c5'),{type:'bar',data:{labels:${JSON.stringify(jour.labels)},datasets:[{label:'Mean Mood',data:${JSON.stringify(jour.values)},backgroundColor:['rgba(75,192,192,0.7)','rgba(153,102,255,0.7)'],borderWidth:1}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
new Chart(document.getElementById('c6'),{type:'scatter',data:{datasets:[{label:'Screen Time vs Mood',data:${JSON.stringify(screenMood)},backgroundColor:'rgba(255,206,86,0.6)',pointRadius:3}]},options:{responsive:true,scales:{x:{title:{display:true,text:'Screen Time (hrs)'}},y:{title:{display:true,text:'Mood'}}}}});
</script></body></html>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, "00_dashboard.html"), html);
  console.log("  Saved: output/00_dashboard.html");
}

export function generateAllCharts(data: SleepRow[]): void {
  console.log("\n=== Generating Charts (PNG + HTML) ===");
  chartDashboard(data);
  chart1(data);
  chart2(data);
  chart3(data);
  chart4(data);
  chart5(data);
  chart6(data);
  chart7(data);
  console.log("\nAll charts saved to output/ folder.");
}
