

// const labels = ["High" , "Low" , "Medium"]



// let map = new Map<string,number>()

// for(let i=0;i<labels.length;i++){

//     map.set(labels[i] , (map.get(labels[i]) || 0) + 1)
// }

// console.log(map)


const size = ["Small" , "Medium" , "Large"]


let map1 = new Map<string,number>()

for(let i=0;i<size.length;i++){

    map1.set(size[i] , (map1.get(size[i]) || 0 + 1))
}


console.log(map1)

console.log("Small:"+map1.get("Small"))