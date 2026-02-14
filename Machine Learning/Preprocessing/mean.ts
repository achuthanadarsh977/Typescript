


function mean(data:number[]):number{

    let sum = data.reduce((a,b) => a+b,0)

    let n = data.length

    return Math.floor(sum/n)
}


console.log(mean([12,23,34,45,56]))