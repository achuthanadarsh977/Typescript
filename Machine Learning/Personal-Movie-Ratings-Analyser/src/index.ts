import * as path from "path";
import { loadCSV } from "./dataframe";
import { runAllEDA } from "./eda";
import { generateAllCharts } from "./visualizations";
import { generateAllHtmlCharts } from "./html-visualizations";

function main(): void {
  console.log("=== Personal Movie Ratings Analyser ===");

  const csvPath = path.join(
    __dirname,
    "..",
    "data",
    "movie_ratings_500_with_missing.csv",
  );
  console.log(`\nLoading data from: ${csvPath}`);

  const data = loadCSV(csvPath);

  // Run all EDA analysis
  runAllEDA(data);

  // Generate PNG charts
  generateAllCharts(data);

  // Generate interactive HTML charts
  generateAllHtmlCharts(data);

  console.log("\n=== Analysis Complete ===");
}

main();
