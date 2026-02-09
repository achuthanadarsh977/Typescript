import * as path from "path";
import { loadCSV } from "./dataframe";
import { runAllEDA } from "./eda";
import { generateAllCharts } from "./visualizations";

function main(): void {
  console.log("=== Task Mood vs Sleep Tracker ===");

  const csvPath = path.join(
    __dirname,
    "..",
    "data",
    "mood_sleep_tracker_1000.csv",
  );
  console.log(`\nLoading data from: ${csvPath}`);

  const data = loadCSV(csvPath);

  runAllEDA(data);
  generateAllCharts(data);

  console.log("\n=== Analysis Complete ===");
}

main();
