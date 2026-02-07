function mean(data) {
    var sum = data.reduce(function (a, b) { return a + b; }, 0);
    var n = data.length;
    return Math.floor(sum / n);
}
console.log(mean([12, 23, 34, 45, 56]));
