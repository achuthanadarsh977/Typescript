


// const fruit = ['apple','banana','grapes','apple','banana','peach','watermelon']


// const fruitCount =  new Map<string,number>()


// for(const f of fruit){
//     fruitCount.set(f , (fruitCount.get(f) || 0 ) + 1)
// }

// console.log(fruitCount)

// console.log(Object.fromEntries(fruitCount))

const vegetables = ['tomato','potato','cauliflower','tomato','cucumber','brinjal']

const vegcount = new Map<string,number>()

for(const v of vegetables){
    vegcount.set(v ,  (vegcount.get(v) || 0) + 1)
}

console.log(Object.fromEntries(vegcount))