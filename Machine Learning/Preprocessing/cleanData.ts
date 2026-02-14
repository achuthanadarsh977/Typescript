

function cleanData(data:any[]):number[]{
   
    let res = []

    for(let i of data){
        if(typeof i === "number"){
            res.push(i)
        }
    }

    return res
}


console.log(cleanData([10,"10",null as any, "20",20, "30",30]))