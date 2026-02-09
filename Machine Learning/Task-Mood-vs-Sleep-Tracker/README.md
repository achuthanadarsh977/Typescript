# Task Mood vs Sleep Tracker

EDA and visualization of a mood & sleep tracker dataset (1000 rows, 10 columns) using TypeScript and Chart.js.

Converted from a Python/pandas/seaborn Jupyter notebook to a Node.js CLI application.

## Dataset

`data/mood_sleep_tracker_1000.csv` — 1000 rows with columns:
Date, Sleep_Duration, Mood_Score, Caffeine_Intake_mg, Exercise_Minutes, Screen_Time_Hours, Stress_Level, Water_Intake_Liters, Alcohol_Consumed, Journaled

## Setup

```bash
npm install
npm start
```

## Output

- Console: EDA summary (shape, dtypes, head, tail, describe, missing values, groupby analysis)
- `output/` folder: PNG chart files + interactive HTML charts

## Charts Generated

1. Missing values bar chart
2. Mood Score histogram (with bins)
3. Sleep Duration vs Mood Score (scatter)
4. Alcohol Consumed vs Mood Score (bar)
5. Journaling vs Mood Score (bar)
6. Screen Time vs Mood Score (scatter)
7. Stress Level vs Screen Time (box plot stats)
8. Correlation heatmap (console)
9. Dashboard (all charts on one HTML page)

## Tech Stack

- **csv-parse** — CSV parsing
- **Chart.js + @napi-rs/canvas** — server-side chart rendering to PNG
- **TypeScript** — type safety
