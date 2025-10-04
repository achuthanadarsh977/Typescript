

// const vegetables = ['tomato','potato','brinjal','tomato','cauliflower','potato','tomato','brinjal']


// const counts:Record<string,number> = {}



// for(const v of vegetables){
//     counts[v] = (counts[v] || 0) + 1
// }

// console.log(counts)


const fruits = ['apple','banana','apple','grapes','banana','peach']


const counts:Record<string,number> = {}


for(const f of fruits){
    counts[f] = (counts[f] || 0) + 1
}

console.log(counts)