# Personal Movie Ratings Analyser

EDA and visualization of a personal movie ratings dataset (500 movies, 10 columns) using TypeScript and Chart.js.

Converted from a Python/pandas/seaborn Jupyter notebook to a Node.js CLI application.

## Dataset

`data/movie_ratings_500_with_missing.csv` — 500 rows with columns:
Movie, Genre, Year, Rating, Watched_On, Duration, Director, Lead_Actor, Language, Rewatch

## Setup

```bash
npm install
npm start
```

## Output

- Console: EDA summary (shape, dtypes, head, tail, describe, missing values, correlation matrix)
- `output/` folder: PNG chart files (generated on each run)

## Charts Generated

1. Missing values bar chart
2. Ratings over the years (line chart)
3. Duration vs Rating (scatter plot)
4. Watched On platform distribution (bar chart)
5. Rewatch frequency by rating (box plot stats)
6. Histogram of ratings
7. Movies by genre (horizontal bar chart)
8. Correlation heatmap (console table)
9. Language distribution (pie chart)
10. Director counts (horizontal bar chart)

## Tech Stack

- **csv-parse** — CSV parsing
- **Chart.js + @napi-rs/canvas** — server-side chart rendering to PNG
- **TypeScript** — type safety
