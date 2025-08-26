


function addition(f){
    return f.reduce((a,b) => a + b,0)

}

console.log(addition([1,2,3,4,5,6]))


function multiplication(a:number,b:number):number{
    return a*b
}



function even(g){
    return g.reduce((a,b) => a*b,0)
}

const square = function(x: number):number{
    return x*x

}

const cubic = function(y:number):number{
    return y**3
}

function taxcollection(income:number,year:number){
    if(year > 2020){
        console.log("Income generated:"+(income+(income*1.2)))
    }

    else{
        console.log("Income generated:"+(income+(income*0.2)))
    }
}


function log(id:number,text:string,user?:number){
    console.log(id+''+text)
}

console.log('Square:'+square(12))
console.log('Cube root:'+cubic(27))
console.log(multiplication(12,23))
console.log(even([1,2,3,4,5,6,7,8]))
taxcollection(23000,2023)
log(1001,'Welcome')