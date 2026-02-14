"use strict";
// Multiple Linear Regression
Object.defineProperty(exports, "__esModule", { value: true });
// Importing the libraries
const fs = require("fs");
const Papa = require("papaparse");
// ============================================
// Matrix utilities
// ============================================
function matTranspose(A) {
    const rows = A.length;
    const cols = A[0].length;
    const result = [];
    for (let j = 0; j < cols; j++) {
        result[j] = [];
        for (let i = 0; i < rows; i++) {
            result[j][i] = A[i][j];
        }
    }
    return result;
}
function matMultiply(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result = [];
    for (let i = 0; i < rowsA; i++) {
        result[i] = [];
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
function matInverse(A) {
    const n = A.length;
    // Build augmented matrix [A | I]
    const aug = [];
    for (let i = 0; i < n; i++) {
        aug[i] = [];
        for (let j = 0; j < n; j++) {
            aug[i][j] = A[i][j];
        }
        for (let j = 0; j < n; j++) {
            aug[i][n + j] = i === j ? 1 : 0;
        }
    }
    // Gauss-Jordan elimination with partial pivoting
    for (let col = 0; col < n; col++) {
        // Find pivot
        let maxVal = Math.abs(aug[col][col]);
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > maxVal) {
                maxVal = Math.abs(aug[row][col]);
                maxRow = row;
            }
        }
        // Swap rows
        if (maxRow !== col) {
            [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
        }
        const pivot = aug[col][col];
        if (Math.abs(pivot) < 1e-12) {
            throw new Error('Matrix is singular and cannot be inverted');
        }
        // Scale pivot row
        for (let j = 0; j < 2 * n; j++) {
            aug[col][j] /= pivot;
        }
        // Eliminate column in all other rows
        for (let row = 0; row < n; row++) {
            if (row === col)
                continue;
            const factor = aug[row][col];
            for (let j = 0; j < 2 * n; j++) {
                aug[row][j] -= factor * aug[col][j];
            }
        }
    }
    // Extract inverse from right half
    const inv = [];
    for (let i = 0; i < n; i++) {
        inv[i] = [];
        for (let j = 0; j < n; j++) {
            inv[i][j] = aug[i][n + j];
        }
    }
    return inv;
}
function matVecMultiply(A, v) {
    const rows = A.length;
    const cols = A[0].length;
    const result = [];
    for (let i = 0; i < rows; i++) {
        let sum = 0;
        for (let j = 0; j < cols; j++) {
            sum += A[i][j] * v[j];
        }
        result[i] = sum;
    }
    return result;
}
// ============================================
// One-Hot Encoding
// ============================================
function oneHotEncode(X, columnIndex) {
    // Extract unique categories from the specified column, sorted
    const categories = [...new Set(X.map(row => row[columnIndex]))].sort();
    return X.map(row => {
        // One-hot columns for each category
        const oneHot = categories.map(cat => (row[columnIndex] === cat ? 1 : 0));
        // Remaining numeric columns (all columns except the categorical one)
        const numeric = [];
        for (let j = 0; j < row.length; j++) {
            if (j !== columnIndex) {
                numeric.push(row[j]);
            }
        }
        // One-hot columns first, then numeric columns (matches sklearn ColumnTransformer remainder='passthrough')
        return [...oneHot, ...numeric];
    });
}
// ============================================
// Multiple Linear Regression class
// ============================================
class MultipleLinearRegression {
    constructor() {
        this.coefficients = null;
    }
    fit(X, y) {
        const n = X.length;
        const p = X[0].length;
        // Prepend intercept column of 1s
        const X_aug = X.map(row => [1, ...row]);
        // Normal Equation: beta = (X^T X)^{-1} X^T y
        const Xt = matTranspose(X_aug);
        const XtX = matMultiply(Xt, X_aug);
        // Add small epsilon to diagonal for numerical stability
        // (avoids singular matrix from dummy variable trap with all one-hot columns kept)
        const eps = 1e-10;
        for (let i = 0; i < XtX.length; i++) {
            XtX[i][i] += eps;
        }
        const XtX_inv = matInverse(XtX);
        const Xty = matVecMultiply(Xt, y);
        this.coefficients = matVecMultiply(XtX_inv, Xty);
    }
    predict(X) {
        // Prepend intercept column of 1s
        const X_aug = X.map(row => [1, ...row]);
        return X_aug.map(row => {
            let sum = 0;
            for (let j = 0; j < row.length; j++) {
                sum += row[j] * this.coefficients[j];
            }
            return sum;
        });
    }
}
function trainTestSplit(X, y, testSize = 0.2, randomState) {
    const n_samples = X.length;
    const n_test = Math.floor(n_samples * testSize);
    const n_train = n_samples - n_test;
    let indices = Array.from({ length: n_samples }, (_, i) => i);
    if (randomState !== undefined) {
        indices = seededShuffle(indices, randomState);
    }
    else {
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
    }
    const train_indices = indices.slice(0, n_train);
    const test_indices = indices.slice(n_train);
    return {
        X_train: train_indices.map(i => X[i]),
        X_test: test_indices.map(i => X[i]),
        y_train: train_indices.map(i => y[i]),
        y_test: test_indices.map(i => y[i]),
    };
}
function seededShuffle(array, seed) {
    const arr = [...array];
    let state = seed;
    const random = () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
// ============================================
// Main
// ============================================
function main() {
    // Importing the dataset
    const csvFile = fs.readFileSync('C:\\Users\\SriniAchuthan\\OneDrive\\Desktop\\Machine-Learning-A-Z-Codes-Datasets\\Machine Learning A-Z\\Part 2 - Regression\\Section 5 - Multiple Linear Regression\\Python\\50_Startups.csv', 'utf8');
    const parsed = Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    });
    const dataset = parsed.data;
    const columns = Object.keys(dataset[0]);
    // X = first 4 columns (R&D Spend, Administration, Marketing Spend, State)
    // y = last column (Profit)
    const X_raw = dataset.map(row => columns.slice(0, -1).map(col => row[col]));
    const y = dataset.map(row => row[columns[columns.length - 1]]);
    // Print raw X (first 5 rows)
    console.log('Raw X (first 5 rows):');
    for (let i = 0; i < 5; i++) {
        console.log(`[ ${X_raw[i].join(', ')} ]`);
    }
    console.log();
    // One-hot encode State column (index 3)
    const X_encoded = oneHotEncode(X_raw, 3);
    // Print encoded X (first 5 rows)
    console.log('Encoded X (first 5 rows):');
    for (let i = 0; i < 5; i++) {
        console.log(X_encoded[i].map(v => v.toFixed(2).padStart(12)).join(''));
    }
    console.log();
    // Splitting the dataset into Training set and Test set
    const { X_train, X_test, y_train, y_test } = trainTestSplit(X_encoded, y, 0.2, 0);
    console.log(`Training set size: ${X_train.length}`);
    console.log(`Test set size: ${X_test.length}\n`);
    // Training the Multiple Linear Regression model
    const regressor = new MultipleLinearRegression();
    regressor.fit(X_train, y_train);
    // Predicting the Test set results
    const y_pred = regressor.predict(X_test);
    // Output results
    console.log('Predictions vs Actual:');
    console.log('Predicted Profit  |  Actual Profit');
    console.log('-'.repeat(40));
    for (let i = 0; i < X_test.length; i++) {
        console.log(`${y_pred[i].toFixed(2).padStart(16)} | ` +
            `${y_test[i].toFixed(2).padStart(16)}`);
    }
}
main();
