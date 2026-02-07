



// function normalize(data:number[]):number[]{

//     let x = Math.max(...data)
//     let y = Math.min(...data)

//     return data.map(v => (v - y) / (x - y))
// }


// console.log(normalize([10,20,30,40,50]))


function normalize1(data1:number[]):number[]{
    let min = Math.min(...data1)
    let max = Math.max(...data1)

    return data1.map(n => (n - min) / (max - min))
}

console.log(normalize1([100,200,300,400,500]))
