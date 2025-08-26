


// interface Jain<T extends number | string | boolean>{
//     value:T
// }


// const p1 : Jain<string> = {value:"John Samuel"}
// const p2 : Jain<boolean> = {value:true}

// const p3 : Jain<number> = {value:23}
// console.log(p1)

// console.log(p2)
// console.log(p3)


function index<T extends number | string>(value:T):T{
    return value
}


console.log(index<string>('Bool'))
console.log(index<number>(12))


interface Person4{
    name:string
    age:number
}


function inex<T extends Person4>(value1:T):T{
    return value1
}

console.log(inex({name:'Frank Castle' , age:37}))


