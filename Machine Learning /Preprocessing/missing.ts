


function missingvalues(data:number[]):number[]{

    let x = data.filter(v => v !== undefined)

    return x
}


console.log(missingvalues([1,undefined as any,2,undefined as any,3]))