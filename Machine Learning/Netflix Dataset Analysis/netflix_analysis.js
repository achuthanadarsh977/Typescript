"use strict";
// Netflix Dataset Analysis - TypeScript Version
// Corrected and improved version with proper data cleaning and analysis
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Papa = require("papaparse");
// ============================================
// Utility Functions
// ============================================
function countNulls(data, column) {
    return data.filter(row => row[column] === null || row[column] === '' || row[column] === undefined).length;
}
function getMode(arr) {
    const frequency = new Map();
    let maxFreq = 0;
    let mode = null;
    for (const item of arr) {
        if (item === null || item === undefined || item === '')
            continue;
        const count = (frequency.get(item) || 0) + 1;
        frequency.set(item, count);
        if (count > maxFreq) {
            maxFreq = count;
            mode = item;
        }
    }
    return mode;
}
function countValues(arr) {
    const counts = new Map();
    for (const item of arr) {
        if (item === null || item === undefined || item === '')
            continue;
        counts.set(item, (counts.get(item) || 0) + 1);
    }
    return counts;
}
function sortMapByValue(map, descending = true) {
    const entries = Array.from(map.entries());
    return entries.sort((a, b) => descending ? b[1] - a[1] : a[1] - b[1]);
}
function printHorizontalBar(label, value, maxValue, barWidth = 40) {
    const filledWidth = Math.round((value / maxValue) * barWidth);
    const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
    console.log(`${label.padEnd(25)} ${bar} ${value}`);
}
function printSeparator(char = '=', length = 60) {
    console.log(char.repeat(length));
}
// ============================================
// Data Loading
// ============================================
function loadDataset(filePath) {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parsed = Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    });
    return parsed.data;
}
// ============================================
// Missing Value Analysis
// ============================================
function analyzeMissingValues(data) {
    printSeparator();
    console.log('MISSING VALUE ANALYSIS (Before Cleaning)');
    printSeparator();
    const columns = ['show_id', 'type', 'title', 'director', 'cast', 'country',
        'date_added', 'release_year', 'rating', 'duration', 'listed_in', 'description'];
    console.log(`${'Column'.padEnd(20)} ${'Missing'.padStart(10)} ${'Percentage'.padStart(12)}`);
    printSeparator('-');
    for (const col of columns) {
        const missing = countNulls(data, col);
        const percentage = ((missing / data.length) * 100).toFixed(1);
        console.log(`${col.padEnd(20)} ${missing.toString().padStart(10)} ${(percentage + '%').padStart(12)}`);
    }
    console.log();
    console.log(`Total rows: ${data.length}`);
    console.log();
}
// ============================================
// Data Cleaning
// ============================================
function cleanDataset(data) {
    printSeparator();
    console.log('DATA CLEANING');
    printSeparator();
    // Get mode for rating to fill missing values
    const ratingMode = getMode(data.map(d => d.rating)) || 'TV-MA';
    console.log(`Filling missing ratings with mode: ${ratingMode}`);
    const cleaned = [];
    let droppedCount = 0;
    for (const row of data) {
        // Skip rows with critical missing values
        if (!row.title || !row.type || !row.release_year || !row.duration || !row.listed_in) {
            droppedCount++;
            continue;
        }
        // Extract main genre (first genre from comma-separated list)
        const mainGenre = row.listed_in ? row.listed_in.split(',')[0].trim() : 'Unknown';
        // Extract duration value (number from "90 min" or "2 Seasons")
        const durationMatch = row.duration ? row.duration.match(/(\d+)/) : null;
        const durationValue = durationMatch ? parseInt(durationMatch[1], 10) : 0;
        cleaned.push({
            show_id: row.show_id,
            type: row.type,
            title: row.title,
            country: row.country || 'Unknown',
            date_added: row.date_added,
            release_year: row.release_year,
            rating: row.rating || ratingMode,
            duration: row.duration,
            listed_in: row.listed_in,
            main_genre: mainGenre,
            duration_value: durationValue,
        });
    }
    // Remove duplicates based on show_id
    const uniqueMap = new Map();
    for (const item of cleaned) {
        if (!uniqueMap.has(item.show_id)) {
            uniqueMap.set(item.show_id, item);
        }
    }
    const uniqueData = Array.from(uniqueMap.values());
    const duplicatesRemoved = cleaned.length - uniqueData.length;
    console.log(`Rows dropped (missing critical values): ${droppedCount}`);
    console.log(`Duplicates removed: ${duplicatesRemoved}`);
    console.log(`Rows after cleaning: ${uniqueData.length}`);
    console.log();
    return uniqueData;
}
// ============================================
// Summary Statistics
// ============================================
function printSummaryStatistics(data) {
    printSeparator();
    console.log('NETFLIX DATASET SUMMARY');
    printSeparator();
    const movies = data.filter(d => d.type === 'Movie');
    const tvShows = data.filter(d => d.type === 'TV Show');
    const moviePercentage = ((movies.length / data.length) * 100).toFixed(1);
    const tvShowPercentage = ((tvShows.length / data.length) * 100).toFixed(1);
    const years = data.map(d => d.release_year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const uniqueCountries = new Set(data.map(d => d.country)).size;
    const uniqueGenres = new Set(data.map(d => d.main_genre)).size;
    const mostCommonRating = getMode(data.map(d => d.rating));
    // Calculate average movie duration
    const movieDurations = movies.map(m => m.duration_value).filter(d => d > 0);
    const avgMovieDuration = movieDurations.length > 0
        ? (movieDurations.reduce((a, b) => a + b, 0) / movieDurations.length).toFixed(0)
        : 'N/A';
    // Calculate average TV show seasons
    const tvSeasons = tvShows.map(t => t.duration_value).filter(d => d > 0);
    const avgSeasons = tvSeasons.length > 0
        ? (tvSeasons.reduce((a, b) => a + b, 0) / tvSeasons.length).toFixed(1)
        : 'N/A';
    console.log(`Total Titles:           ${data.length}`);
    console.log(`Movies:                 ${movies.length} (${moviePercentage}%)`);
    console.log(`TV Shows:               ${tvShows.length} (${tvShowPercentage}%)`);
    console.log(`Date Range:             ${minYear} - ${maxYear}`);
    console.log(`Unique Countries:       ${uniqueCountries}`);
    console.log(`Unique Genres:          ${uniqueGenres}`);
    console.log(`Most Common Rating:     ${mostCommonRating}`);
    console.log(`Avg Movie Duration:     ${avgMovieDuration} minutes`);
    console.log(`Avg TV Show Seasons:    ${avgSeasons} seasons`);
    console.log();
}
// ============================================
// Visualizations (Console-based)
// ============================================
function visualizeContentTypeDistribution(data) {
    printSeparator();
    console.log('CONTENT TYPE DISTRIBUTION');
    printSeparator();
    const typeCounts = countValues(data.map(d => d.type));
    const maxCount = Math.max(...typeCounts.values());
    for (const [type, count] of sortMapByValue(typeCounts)) {
        printHorizontalBar(type, count, maxCount);
    }
    console.log();
}
function visualizeTopRatings(data, top = 10) {
    printSeparator();
    console.log(`TOP ${top} CONTENT RATINGS`);
    printSeparator();
    const ratingCounts = countValues(data.map(d => d.rating));
    const sorted = sortMapByValue(ratingCounts).slice(0, top);
    const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
    for (const [rating, count] of sorted) {
        printHorizontalBar(rating, count, maxCount);
    }
    console.log();
}
function visualizeTopGenres(data, top = 10) {
    printSeparator();
    console.log(`TOP ${top} GENRES`);
    printSeparator();
    const genreCounts = countValues(data.map(d => d.main_genre));
    const sorted = sortMapByValue(genreCounts).slice(0, top);
    const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
    for (const [genre, count] of sorted) {
        printHorizontalBar(genre, count, maxCount);
    }
    console.log();
}
function visualizeTopCountries(data, top = 10) {
    printSeparator();
    console.log(`TOP ${top} CONTENT PRODUCING COUNTRIES`);
    printSeparator();
    // Handle multiple countries per title
    const countryCounts = new Map();
    for (const item of data) {
        const countries = item.country.split(',').map(c => c.trim());
        for (const country of countries) {
            if (country && country !== 'Unknown') {
                countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
            }
        }
    }
    const sorted = sortMapByValue(countryCounts).slice(0, top);
    const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
    for (const [country, count] of sorted) {
        printHorizontalBar(country, count, maxCount);
    }
    console.log();
}
function visualizeReleasesByYear(data, lastNYears = 15) {
    printSeparator();
    console.log(`CONTENT RELEASES (Last ${lastNYears} Years)`);
    printSeparator();
    const yearCounts = countValues(data.map(d => d.release_year));
    const sortedYears = sortMapByValue(yearCounts, false); // ascending by year
    // Get last N years
    const allYears = sortedYears.map(([year]) => year).sort((a, b) => b - a);
    const recentYears = allYears.slice(0, lastNYears).reverse();
    const maxCount = Math.max(...recentYears.map(y => yearCounts.get(y) || 0));
    for (const year of recentYears) {
        const count = yearCounts.get(year) || 0;
        printHorizontalBar(year.toString(), count, maxCount);
    }
    console.log();
}
function visualizeYearOverYearGrowth(data, lastNYears = 10) {
    printSeparator();
    console.log(`YEAR-OVER-YEAR GROWTH RATE`);
    printSeparator();
    const yearCounts = countValues(data.map(d => d.release_year));
    const years = Array.from(yearCounts.keys()).sort((a, b) => a - b);
    // Get recent years
    const recentYears = years.slice(-lastNYears);
    console.log(`${'Year'.padEnd(10)} ${'Titles'.padStart(10)} ${'Growth'.padStart(12)} ${'Trend'.padStart(20)}`);
    printSeparator('-');
    let prevCount = 0;
    for (const year of recentYears) {
        const count = yearCounts.get(year) || 0;
        let growth = '';
        let trend = '';
        if (prevCount > 0) {
            const growthRate = ((count - prevCount) / prevCount) * 100;
            growth = (growthRate >= 0 ? '+' : '') + growthRate.toFixed(1) + '%';
            // Visual trend indicator
            if (growthRate > 20)
                trend = '▲▲ Strong growth';
            else if (growthRate > 0)
                trend = '▲ Growth';
            else if (growthRate > -20)
                trend = '▼ Decline';
            else
                trend = '▼▼ Sharp decline';
        }
        else {
            growth = 'N/A';
            trend = '— Baseline';
        }
        console.log(`${year.toString().padEnd(10)} ${count.toString().padStart(10)} ${growth.padStart(12)} ${trend.padStart(20)}`);
        prevCount = count;
    }
    console.log();
}
// ============================================
// Additional Insights
// ============================================
function printDurationAnalysis(data) {
    printSeparator();
    console.log('DURATION ANALYSIS');
    printSeparator();
    const movies = data.filter(d => d.type === 'Movie');
    const tvShows = data.filter(d => d.type === 'TV Show');
    // Movie duration distribution
    const shortMovies = movies.filter(m => m.duration_value < 90).length;
    const mediumMovies = movies.filter(m => m.duration_value >= 90 && m.duration_value <= 120).length;
    const longMovies = movies.filter(m => m.duration_value > 120).length;
    console.log('Movie Duration Distribution:');
    console.log(`  Short (<90 min):      ${shortMovies} (${((shortMovies / movies.length) * 100).toFixed(1)}%)`);
    console.log(`  Standard (90-120):    ${mediumMovies} (${((mediumMovies / movies.length) * 100).toFixed(1)}%)`);
    console.log(`  Long (>120 min):      ${longMovies} (${((longMovies / movies.length) * 100).toFixed(1)}%)`);
    console.log();
    // TV show seasons distribution
    const singleSeason = tvShows.filter(t => t.duration_value === 1).length;
    const fewSeasons = tvShows.filter(t => t.duration_value >= 2 && t.duration_value <= 3).length;
    const manySeasons = tvShows.filter(t => t.duration_value > 3).length;
    console.log('TV Show Seasons Distribution:');
    console.log(`  Single season:        ${singleSeason} (${((singleSeason / tvShows.length) * 100).toFixed(1)}%)`);
    console.log(`  2-3 seasons:          ${fewSeasons} (${((fewSeasons / tvShows.length) * 100).toFixed(1)}%)`);
    console.log(`  4+ seasons:           ${manySeasons} (${((manySeasons / tvShows.length) * 100).toFixed(1)}%)`);
    console.log();
}
function printSampleData(data, n = 5) {
    printSeparator();
    console.log(`SAMPLE DATA (First ${n} rows)`);
    printSeparator();
    console.log(`${'Title'.padEnd(35)} ${'Type'.padEnd(10)} ${'Year'.padEnd(6)} ${'Rating'.padEnd(8)} ${'Genre'.padEnd(20)}`);
    printSeparator('-');
    for (let i = 0; i < Math.min(n, data.length); i++) {
        const row = data[i];
        const title = row.title.length > 33 ? row.title.substring(0, 30) + '...' : row.title;
        const genre = row.main_genre.length > 18 ? row.main_genre.substring(0, 15) + '...' : row.main_genre;
        console.log(`${title.padEnd(35)} ` +
            `${row.type.padEnd(10)} ` +
            `${row.release_year.toString().padEnd(6)} ` +
            `${row.rating.padEnd(8)} ` +
            `${genre.padEnd(20)}`);
    }
    console.log();
}
// ============================================
// Main Function
// ============================================
function main() {
    console.log();
    printSeparator('*');
    console.log('   NETFLIX DATASET ANALYSIS - TypeScript Version');
    printSeparator('*');
    console.log();
    // Try multiple possible paths for the dataset
    const possiblePaths = [
        'C:\\Users\\SriniAchuthan\\OneDrive\\Desktop\\Typescript Machine Learning\\Netflix Dataset Analysis\\netflix_titles_with_missing.csv',
        'C:\\Users\\SriniAchuthan\\Downloads\\netflix_titles_with_missing (1).csv',
        './netflix_titles_with_missing.csv',
    ];
    let data = null;
    let usedPath = '';
    for (const path of possiblePaths) {
        try {
            if (fs.existsSync(path)) {
                data = loadDataset(path);
                usedPath = path;
                break;
            }
        }
        catch (e) {
            continue;
        }
    }
    if (!data || data.length === 0) {
        console.log('Dataset not found. Please ensure the CSV file exists at one of these locations:');
        possiblePaths.forEach(p => console.log(`  - ${p}`));
        console.log('\nYou can download or copy the netflix_titles_with_missing.csv file to the project directory.');
        return;
    }
    console.log(`Loaded dataset from: ${usedPath}`);
    console.log(`Initial row count: ${data.length}`);
    console.log();
    // Step 1: Analyze missing values
    analyzeMissingValues(data);
    // Step 2: Clean the dataset
    const cleanedData = cleanDataset(data);
    // Step 3: Show sample data
    printSampleData(cleanedData);
    // Step 4: Summary statistics
    printSummaryStatistics(cleanedData);
    // Step 5: Visualizations
    visualizeContentTypeDistribution(cleanedData);
    visualizeTopRatings(cleanedData);
    visualizeTopGenres(cleanedData);
    visualizeTopCountries(cleanedData);
    visualizeReleasesByYear(cleanedData);
    // Step 6: Additional insights
    visualizeYearOverYearGrowth(cleanedData);
    printDurationAnalysis(cleanedData);
    // Final summary
    printSeparator('*');
    console.log('   ANALYSIS COMPLETE');
    printSeparator('*');
    console.log();
}
// Run the analysis
main();
