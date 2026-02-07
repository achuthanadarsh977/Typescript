var labels = ["High", "Low", "Medium"];
var map = new Map();
for (var i = 0; i < labels.length; i++) {
    map.set(labels[i], (map.get(labels[i]) || 0) + 1);
}
console.log(map);
