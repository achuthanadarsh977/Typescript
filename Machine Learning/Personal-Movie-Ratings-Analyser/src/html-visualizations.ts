import * as fs from "fs";
import * as path from "path";
import { MovieRow } from "./dataframe";
import { getMissingCounts } from "./eda";

const OUTPUT_DIR = path.join(__dirname, "..", "output");

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function wrapHtml(
  title: string,
  chartConfig: string,
  canvasHeight = 600,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 30px; max-width: 900px; width: 95%; }
    h1 { text-align: center; color: #333; margin-bottom: 20px; font-size: 1.4rem; }
    canvas { max-width: 100%; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <canvas id="chart" width="800" height="${canvasHeight}"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, ${chartConfig});
  </script>
</body>
</html>`;
}

function saveHtml(
  title: string,
  chartConfig: string,
  filename: string,
  canvasHeight = 600,
): void {
  ensureOutputDir();
  const html = wrapHtml(title, chartConfig, canvasHeight);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
  console.log(`  Saved: output/${filename}`);
}

// 1. Missing Values
function htmlMissingValues(data: MovieRow[]): void {
  const { columns, counts } = getMissingCounts(data);
  saveHtml(
    "Missing Values per Column",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(columns)},
      datasets: [{
        label: 'Missing Values',
        data: ${JSON.stringify(counts)},
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Missing Values per Column', font: { size: 18 } } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Count' } } }
    }
  }`,
    "01_missing_values.html",
  );
}

// 2. Ratings Over the Years
function htmlRatingsOverYears(data: MovieRow[]): void {
  const points: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Rating !== null && row.Year !== null) {
      points.push({ x: row.Rating, y: row.Year });
    }
  }
  points.sort((a, b) => a.x - b.x);
  const labels = points.map((p) => p.x);
  const values = points.map((p) => p.y);

  saveHtml(
    "Ratings Over the Years",
    `{
    type: 'line',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: 'Year',
        data: ${JSON.stringify(values)},
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointRadius: 1,
        borderWidth: 1.5,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Ratings Over the Years', font: { size: 18 } } },
      scales: {
        x: { title: { display: true, text: 'Rating' } },
        y: { title: { display: true, text: 'Year' } }
      }
    }
  }`,
    "02_ratings_over_years.html",
  );
}

// 3. Duration vs Rating
function htmlDurationVsRating(data: MovieRow[]): void {
  const points: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Duration !== null && row.Rating !== null) {
      points.push({ x: row.Duration, y: row.Rating });
    }
  }

  saveHtml(
    "Duration vs Rating",
    `{
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Duration vs Rating',
        data: ${JSON.stringify(points)},
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Duration vs Rating', font: { size: 18 } } },
      scales: {
        x: { title: { display: true, text: 'Duration (min)' } },
        y: { title: { display: true, text: 'Rating' } }
      }
    }
  }`,
    "03_duration_vs_rating.html",
  );
}

// 4. Watched On Platform Distribution
function htmlWatchedOnDistribution(data: MovieRow[]): void {
  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.Watched_On !== null) {
      counts[row.Watched_On] = (counts[row.Watched_On] || 0) + 1;
    }
  }
  const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const values = labels.map((l) => counts[l]);
  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(199, 199, 199, 0.7)",
    "rgba(83, 102, 255, 0.7)",
  ];

  saveHtml(
    "Watched On Platform Distribution",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: 'Count',
        data: ${JSON.stringify(values)},
        backgroundColor: ${JSON.stringify(colors.slice(0, labels.length))},
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Watched On Platform Distribution', font: { size: 18 } } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Count' } } }
    }
  }`,
    "04_watched_on_distribution.html",
  );
}

// 5. Rewatch vs Rating
function htmlRewatchVsRating(data: MovieRow[]): void {
  const groups: Record<string, number[]> = {};
  for (const row of data) {
    if (row.Rewatch !== null && row.Rating !== null) {
      if (!groups[row.Rewatch]) groups[row.Rewatch] = [];
      groups[row.Rewatch].push(row.Rating);
    }
  }
  const labels = Object.keys(groups).sort();
  const stats = labels.map((label) => {
    const vals = groups[label].sort((a, b) => a - b);
    const n = vals.length;
    return {
      min: vals[0],
      q1: vals[Math.floor(n * 0.25)],
      median: vals[Math.floor(n * 0.5)],
      q3: vals[Math.floor(n * 0.75)],
      max: vals[n - 1],
    };
  });

  saveHtml(
    "Rewatch Frequency by Rating (Box Plot Stats)",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [
        { label: 'Min', data: ${JSON.stringify(stats.map((s) => s.min))}, backgroundColor: 'rgba(54, 162, 235, 0.3)', borderWidth: 1 },
        { label: 'Q1', data: ${JSON.stringify(stats.map((s) => s.q1))}, backgroundColor: 'rgba(54, 162, 235, 0.5)', borderWidth: 1 },
        { label: 'Median', data: ${JSON.stringify(stats.map((s) => s.median))}, backgroundColor: 'rgba(255, 206, 86, 0.8)', borderWidth: 1 },
        { label: 'Q3', data: ${JSON.stringify(stats.map((s) => s.q3))}, backgroundColor: 'rgba(75, 192, 192, 0.5)', borderWidth: 1 },
        { label: 'Max', data: ${JSON.stringify(stats.map((s) => s.max))}, backgroundColor: 'rgba(255, 99, 132, 0.3)', borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Rewatch Frequency by Rating (Box Plot Stats)', font: { size: 18 } } },
      scales: {
        x: { title: { display: true, text: 'Rewatch' } },
        y: { title: { display: true, text: 'Rating' }, beginAtZero: true }
      }
    }
  }`,
    "05_rewatch_vs_rating.html",
  );
}

// 6. Histogram of Ratings
function htmlRatingHistogram(data: MovieRow[]): void {
  const validRatings = data
    .map((r) => r.Rating)
    .filter((v): v is number => v !== null);
  const binSize = 0.5;
  const bins: number[] = [];
  const binLabels: string[] = [];
  for (let b = 1; b <= 10; b += binSize) {
    bins.push(0);
    binLabels.push(`${b.toFixed(1)}-${(b + binSize).toFixed(1)}`);
  }
  for (const r of validRatings) {
    const idx = Math.min(Math.floor((r - 1) / binSize), bins.length - 1);
    if (idx >= 0) bins[idx]++;
  }

  saveHtml(
    "Histogram of Ratings",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(binLabels)},
      datasets: [{
        label: 'Frequency',
        data: ${JSON.stringify(bins)},
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Histogram of Ratings', font: { size: 18 } } },
      scales: {
        x: { title: { display: true, text: 'Rating' } },
        y: { beginAtZero: true, title: { display: true, text: 'Frequency' } }
      }
    }
  }`,
    "06_rating_histogram.html",
  );
}

// 7. Movies by Genre
function htmlGenreDistribution(data: MovieRow[]): void {
  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.Genre !== null) {
      counts[row.Genre] = (counts[row.Genre] || 0) + 1;
    }
  }
  const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const values = labels.map((l) => counts[l]);

  saveHtml(
    "Movies by Genre",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: 'Count',
        data: ${JSON.stringify(values)},
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { title: { display: true, text: 'Movies by Genre', font: { size: 18 } } },
      scales: { x: { beginAtZero: true, title: { display: true, text: 'Count' } } }
    }
  }`,
    "07_genre_distribution.html",
  );
}

// 8. Language Distribution (Pie)
function htmlLanguageDistribution(data: MovieRow[]): void {
  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.Language !== null) {
      counts[row.Language] = (counts[row.Language] || 0) + 1;
    }
  }
  const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const values = labels.map((l) => counts[l]);
  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(199, 199, 199, 0.7)",
    "rgba(83, 102, 255, 0.7)",
    "rgba(255, 99, 255, 0.7)",
    "rgba(99, 255, 132, 0.7)",
  ];

  saveHtml(
    "Language Distribution",
    `{
    type: 'pie',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        data: ${JSON.stringify(values)},
        backgroundColor: ${JSON.stringify(colors.slice(0, labels.length))},
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Language Distribution', font: { size: 18 } },
        legend: { position: 'right' }
      }
    }
  }`,
    "08_language_distribution.html",
    500,
  );
}

// 9. Director Counts
function htmlDirectorCounts(data: MovieRow[]): void {
  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.Director !== null) {
      counts[row.Director] = (counts[row.Director] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 20);
  const labels = top.map((e) => e[0]);
  const values = top.map((e) => e[1]);

  saveHtml(
    "Top 20 Directors by Movie Count",
    `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: 'Movie Count',
        data: ${JSON.stringify(values)},
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { title: { display: true, text: 'Top 20 Directors by Movie Count', font: { size: 18 } } },
      scales: { x: { beginAtZero: true, title: { display: true, text: 'Count' } } }
    }
  }`,
    "09_director_counts.html",
    700,
  );
}

// 10. Dashboard — all charts on one page
function htmlDashboard(data: MovieRow[]): void {
  ensureOutputDir();

  const { columns, counts } = getMissingCounts(data);

  // Ratings over years
  const ratingYearPts: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Rating !== null && row.Year !== null)
      ratingYearPts.push({ x: row.Rating, y: row.Year });
  }
  ratingYearPts.sort((a, b) => a.x - b.x);

  // Duration vs Rating
  const durRatPts: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Duration !== null && row.Rating !== null)
      durRatPts.push({ x: row.Duration, y: row.Rating });
  }

  // Platform counts
  const platCounts: Record<string, number> = {};
  for (const row of data) {
    if (row.Watched_On !== null)
      platCounts[row.Watched_On] = (platCounts[row.Watched_On] || 0) + 1;
  }
  const platLabels = Object.keys(platCounts).sort(
    (a, b) => platCounts[b] - platCounts[a],
  );

  // Histogram bins
  const validRatings = data
    .map((r) => r.Rating)
    .filter((v): v is number => v !== null);
  const binSize = 0.5;
  const bins: number[] = [];
  const binLabels: string[] = [];
  for (let b = 1; b <= 10; b += binSize) {
    bins.push(0);
    binLabels.push(`${b.toFixed(1)}-${(b + binSize).toFixed(1)}`);
  }
  for (const r of validRatings) {
    const idx = Math.min(Math.floor((r - 1) / binSize), bins.length - 1);
    if (idx >= 0) bins[idx]++;
  }

  // Genre counts
  const genreCounts: Record<string, number> = {};
  for (const row of data) {
    if (row.Genre !== null)
      genreCounts[row.Genre] = (genreCounts[row.Genre] || 0) + 1;
  }
  const genreLabels = Object.keys(genreCounts).sort(
    (a, b) => genreCounts[b] - genreCounts[a],
  );

  // Language counts
  const langCounts: Record<string, number> = {};
  for (const row of data) {
    if (row.Language !== null)
      langCounts[row.Language] = (langCounts[row.Language] || 0) + 1;
  }
  const langLabels = Object.keys(langCounts).sort(
    (a, b) => langCounts[b] - langCounts[a],
  );

  // Director counts top 20
  const dirCounts: Record<string, number> = {};
  for (const row of data) {
    if (row.Director !== null)
      dirCounts[row.Director] = (dirCounts[row.Director] || 0) + 1;
  }
  const dirSorted = Object.entries(dirCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const colors8 = [
    "rgba(255,99,132,0.7)",
    "rgba(54,162,235,0.7)",
    "rgba(255,206,86,0.7)",
    "rgba(75,192,192,0.7)",
    "rgba(153,102,255,0.7)",
    "rgba(255,159,64,0.7)",
    "rgba(199,199,199,0.7)",
    "rgba(83,102,255,0.7)",
  ];
  const colors10 = [...colors8, "rgba(255,99,255,0.7)", "rgba(99,255,132,0.7)"];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Movie Ratings Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 20px; }
    h1.main-title { text-align: center; color: #333; margin-bottom: 30px; font-size: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px; max-width: 1400px; margin: 0 auto; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 20px; }
    .card h2 { text-align: center; color: #555; margin-bottom: 12px; font-size: 1rem; }
    canvas { max-width: 100%; }
  </style>
</head>
<body>
  <h1 class="main-title">Personal Movie Ratings Dashboard</h1>
  <div class="grid">
    <div class="card"><h2>Missing Values</h2><canvas id="c1"></canvas></div>
    <div class="card"><h2>Ratings Over the Years</h2><canvas id="c2"></canvas></div>
    <div class="card"><h2>Duration vs Rating</h2><canvas id="c3"></canvas></div>
    <div class="card"><h2>Platform Distribution</h2><canvas id="c4"></canvas></div>
    <div class="card"><h2>Rating Histogram</h2><canvas id="c5"></canvas></div>
    <div class="card"><h2>Movies by Genre</h2><canvas id="c6"></canvas></div>
    <div class="card"><h2>Language Distribution</h2><canvas id="c7"></canvas></div>
    <div class="card"><h2>Top 20 Directors</h2><canvas id="c8"></canvas></div>
  </div>
  <script>
    const opts = (t) => ({ responsive: true, plugins: { title: { display: false }, legend: { display: true } } });
    // 1
    new Chart(document.getElementById('c1'), { type:'bar', data:{ labels:${JSON.stringify(columns)}, datasets:[{ label:'Missing', data:${JSON.stringify(counts)}, backgroundColor:'rgba(255,99,132,0.7)', borderWidth:1 }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } } });
    // 2
    new Chart(document.getElementById('c2'), { type:'line', data:{ labels:${JSON.stringify(ratingYearPts.map((p) => p.x))}, datasets:[{ label:'Year', data:${JSON.stringify(ratingYearPts.map((p) => p.y))}, borderColor:'rgba(54,162,235,1)', backgroundColor:'rgba(54,162,235,0.2)', pointRadius:1, borderWidth:1.5, fill:true }] }, options:{ responsive:true, scales:{ x:{ title:{ display:true, text:'Rating' } }, y:{ title:{ display:true, text:'Year' } } } } });
    // 3
    new Chart(document.getElementById('c3'), { type:'scatter', data:{ datasets:[{ label:'Duration vs Rating', data:${JSON.stringify(durRatPts)}, backgroundColor:'rgba(75,192,192,0.6)', pointRadius:3 }] }, options:{ responsive:true, scales:{ x:{ title:{ display:true, text:'Duration (min)' } }, y:{ title:{ display:true, text:'Rating' } } } } });
    // 4
    new Chart(document.getElementById('c4'), { type:'bar', data:{ labels:${JSON.stringify(platLabels)}, datasets:[{ label:'Count', data:${JSON.stringify(platLabels.map((l) => platCounts[l]))}, backgroundColor:${JSON.stringify(colors8.slice(0, platLabels.length))}, borderWidth:1 }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } } });
    // 5
    new Chart(document.getElementById('c5'), { type:'bar', data:{ labels:${JSON.stringify(binLabels)}, datasets:[{ label:'Frequency', data:${JSON.stringify(bins)}, backgroundColor:'rgba(54,162,235,0.7)', borderColor:'rgba(54,162,235,1)', borderWidth:1 }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } } });
    // 6
    new Chart(document.getElementById('c6'), { type:'bar', data:{ labels:${JSON.stringify(genreLabels)}, datasets:[{ label:'Count', data:${JSON.stringify(genreLabels.map((l) => genreCounts[l]))}, backgroundColor:'rgba(153,102,255,0.7)', borderWidth:1 }] }, options:{ indexAxis:'y', responsive:true, scales:{ x:{ beginAtZero:true } } } });
    // 7
    new Chart(document.getElementById('c7'), { type:'pie', data:{ labels:${JSON.stringify(langLabels)}, datasets:[{ data:${JSON.stringify(langLabels.map((l) => langCounts[l]))}, backgroundColor:${JSON.stringify(colors10.slice(0, langLabels.length))}, borderWidth:1 }] }, options:{ responsive:true, plugins:{ legend:{ position:'right' } } } });
    // 8
    new Chart(document.getElementById('c8'), { type:'bar', data:{ labels:${JSON.stringify(dirSorted.map((e) => e[0]))}, datasets:[{ label:'Movies', data:${JSON.stringify(dirSorted.map((e) => e[1]))}, backgroundColor:'rgba(75,192,192,0.7)', borderWidth:1 }] }, options:{ indexAxis:'y', responsive:true, scales:{ x:{ beginAtZero:true } } } });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "00_dashboard.html"), html);
  console.log("  Saved: output/00_dashboard.html");
}

export function generateAllHtmlCharts(data: MovieRow[]): void {
  console.log("\n=== Generating HTML Charts ===");
  htmlDashboard(data);
  htmlMissingValues(data);
  htmlRatingsOverYears(data);
  htmlDurationVsRating(data);
  htmlWatchedOnDistribution(data);
  htmlRewatchVsRating(data);
  htmlRatingHistogram(data);
  htmlGenreDistribution(data);
  htmlLanguageDistribution(data);
  htmlDirectorCounts(data);
  console.log("\nAll HTML charts saved to output/ folder.");
}
