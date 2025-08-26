function addition(f) {
    return f.reduce(function (a, b) { return a + b; }, 0);
}
console.log(addition([1, 2, 3, 4, 5, 6]));
function multiplication(a, b) {
    return a * b;
}
function even(g) {
    return g.reduce(function (a, b) { return a * b; }, 0);
}
var square = function (x) {
    return x * x;
};
var cubic = function (y) {
    return Math.pow(y, 3);
};
function taxcollection(income, year) {
    if (year > 2020) {
        console.log("Income generated:" + (income + (income * 1.2)));
    }
    else {
        console.log("Income generated:" + (income + (income * 0.2)));
    }
}
function log(id, text, user) {
    console.log(id + '' + text);
}
console.log('Square:' + square(12));
console.log('Cube root:' + cubic(27));
console.log(multiplication(12, 23));
console.log(even([1, 2, 3, 4, 5, 6, 7, 8]));
taxcollection(23000, 2023);
log(1001, 'Welcome');
