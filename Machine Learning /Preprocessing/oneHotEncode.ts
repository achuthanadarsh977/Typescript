



function oneHotEncode(value:string , category:string[]):number[]{
   return category.map(cat => (cat === value ? 1:0))
}


console.log(oneHotEncode("Red" , ["Red","Blue","Green"]))
console.log(oneHotEncode("Blue" , ["Red","Blue","Green"]))
console.log(oneHotEncode("Green" , ["Red","Blue","Green"]))
