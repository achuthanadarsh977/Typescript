// const vegetables = ['tomato','potato','brinjal','tomato','cauliflower','potato','tomato','brinjal']
// const counts:Record<string,number> = {}
// for(const v of vegetables){
//     counts[v] = (counts[v] || 0) + 1
// }
// console.log(counts)
var fruits = ['apple', 'banana', 'apple', 'grapes', 'banana', 'peach'];
var counts = {};
for (var _i = 0, fruits_1 = fruits; _i < fruits_1.length; _i++) {
    var f = fruits_1[_i];
    counts[f] = (counts[f] || 0) + 1;
}
console.log(counts);
