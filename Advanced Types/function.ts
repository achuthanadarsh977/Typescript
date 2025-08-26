

//Pure function(with no effect)
function add(a:number,b:number):number{
    return a+b
}


//Function(with effect)
function logSum(a:number,b:number):number{
    const sum = a + b
    console.log('Sum:'+sum)//Side effect logging into console
    return sum
}



//Another effect

let counter=0

function incrementcounter():void{
    counter++;
}



