// const fruit = ['apple','banana','grapes','apple','banana','peach','watermelon']
// const fruitCount =  new Map<string,number>()
// for(const f of fruit){
//     fruitCount.set(f , (fruitCount.get(f) || 0 ) + 1)
// }
// console.log(fruitCount)
// console.log(Object.fromEntries(fruitCount))
var vegetables = ['tomato', 'potato', 'cauliflower', 'tomato', 'cucumber', 'brinjal'];
var vegcount = new Map();
for (var _i = 0, vegetables_1 = vegetables; _i < vegetables_1.length; _i++) {
    var v = vegetables_1[_i];
    vegcount.set(v, (vegcount.get(v) || 0) + 1);
}
console.log(Object.fromEntries(vegcount));
