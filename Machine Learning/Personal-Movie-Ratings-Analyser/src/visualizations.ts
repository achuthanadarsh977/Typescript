import { createCanvas } from "@napi-rs/canvas";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import * as fs from "fs";
import * as path from "path";
import { MovieRow } from "./dataframe";
import { getMissingCounts } from "./eda";

Chart.register(...registerables);

const WIDTH = 800;
const HEIGHT = 600;
const OUTPUT_DIR = path.join(__dirname, "..", "output");

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function saveChart(config: ChartConfiguration, filename: string): void {
  ensureOutputDir();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Fill white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  new Chart(ctx as unknown as CanvasRenderingContext2D, {
    ...config,
    options: {
      ...config.options,
      responsive: false,
      animation: false,
    },
  });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`  Saved: output/${filename}`);
}

// 1. Missing Values Bar Chart
function plotMissingValues(data: MovieRow[]): void {
  const { columns, counts } = getMissingCounts(data);
  saveChart(
    {
      type: "bar",
      data: {
        labels: columns,
        datasets: [
          {
            label: "Missing Values",
            data: counts,
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
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
    },
    "01_missing_values.png",
  );
}

// 2. Ratings Over the Years (Line Chart)
function plotRatingsOverYears(data: MovieRow[]): void {
  const points: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Rating !== null && row.Year !== null) {
      points.push({ x: row.Rating, y: row.Year });
    }
  }
  points.sort((a, b) => a.x - b.x);

  saveChart(
    {
      type: "line",
      data: {
        labels: points.map((p) => p.x.toString()),
        datasets: [
          {
            label: "Year",
            data: points.map((p) => p.y),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            pointRadius: 1,
            borderWidth: 1.5,
            fill: true,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Ratings Over the Years",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Rating" } },
          y: { title: { display: true, text: "Year" } },
        },
      },
    },
    "02_ratings_over_years.png",
  );
}

// 3. Duration vs Rating (Scatter Plot)
function plotDurationVsRating(data: MovieRow[]): void {
  const points: { x: number; y: number }[] = [];
  for (const row of data) {
    if (row.Duration !== null && row.Rating !== null) {
      points.push({ x: row.Duration, y: row.Rating });
    }
  }

  saveChart(
    {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Duration vs Rating",
            data: points,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            pointRadius: 3,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Duration vs Rating",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Duration (min)" } },
          y: { title: { display: true, text: "Rating" } },
        },
      },
    },
    "03_duration_vs_rating.png",
  );
}

// 4. Watched On Platform Distribution
function plotWatchedOnDistribution(data: MovieRow[]): void {
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

  saveChart(
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Count",
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Watched On Platform Distribution",
            font: { size: 18 },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Count" } },
        },
      },
    },
    "04_watched_on_distribution.png",
  );
}

// 5. Rewatch vs Rating (Box Plot Stats)
function plotRewatchVsRating(data: MovieRow[]): void {
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

  saveChart(
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Min",
            data: stats.map((s) => s.min),
            backgroundColor: "rgba(54, 162, 235, 0.3)",
            borderWidth: 1,
          },
          {
            label: "Q1",
            data: stats.map((s) => s.q1),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderWidth: 1,
          },
          {
            label: "Median",
            data: stats.map((s) => s.median),
            backgroundColor: "rgba(255, 206, 86, 0.8)",
            borderWidth: 1,
          },
          {
            label: "Q3",
            data: stats.map((s) => s.q3),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderWidth: 1,
          },
          {
            label: "Max",
            data: stats.map((s) => s.max),
            backgroundColor: "rgba(255, 99, 132, 0.3)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Rewatch Frequency by Rating (Box Plot Stats)",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Rewatch" } },
          y: { title: { display: true, text: "Rating" }, beginAtZero: true },
        },
      },
    },
    "05_rewatch_vs_rating.png",
  );
}

// 6. Histogram of Ratings
function plotRatingHistogram(data: MovieRow[]): void {
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

  saveChart(
    {
      type: "bar",
      data: {
        labels: binLabels,
        datasets: [
          {
            label: "Frequency",
            data: bins,
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Histogram of Ratings",
            font: { size: 18 },
          },
        },
        scales: {
          x: { title: { display: true, text: "Rating" } },
          y: { beginAtZero: true, title: { display: true, text: "Frequency" } },
        },
      },
    },
    "06_rating_histogram.png",
  );
}

// 7. Movies by Genre (Horizontal Bar)
function plotGenreDistribution(data: MovieRow[]): void {
  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.Genre !== null) {
      counts[row.Genre] = (counts[row.Genre] || 0) + 1;
    }
  }
  const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const values = labels.map((l) => counts[l]);

  saveChart(
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Count",
            data: values,
            backgroundColor: "rgba(153, 102, 255, 0.7)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: {
          title: { display: true, text: "Movies by Genre", font: { size: 18 } },
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: "Count" } },
        },
      },
    },
    "07_genre_distribution.png",
  );
}

// 8. Language Distribution (Pie Chart)
function plotLanguageDistribution(data: MovieRow[]): void {
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

  saveChart(
    {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Language Distribution",
            font: { size: 18 },
          },
          legend: { position: "right" },
        },
      },
    },
    "08_language_distribution.png",
  );
}

// 9. Director Counts (Horizontal Bar - top 20)
function plotDirectorCounts(data: MovieRow[]): void {
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

  saveChart(
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Movie Count",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: {
          title: {
            display: true,
            text: "Top 20 Directors by Movie Count",
            font: { size: 18 },
          },
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: "Count" } },
        },
      },
    },
    "09_director_counts.png",
  );
}

export function generateAllCharts(data: MovieRow[]): void {
  console.log("\n=== Generating Charts ===");
  plotMissingValues(data);
  plotRatingsOverYears(data);
  plotDurationVsRating(data);
  plotWatchedOnDistribution(data);
  plotRewatchVsRating(data);
  plotRatingHistogram(data);
  plotGenreDistribution(data);
  plotLanguageDistribution(data);
  plotDirectorCounts(data);
  console.log("\nAll charts saved to output/ folder.");
}
