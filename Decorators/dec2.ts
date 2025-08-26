


// function Logger3(prefix:string){
//     return function(constructor:Function){
//         console.log(`${prefix} present in ${constructor.name}`)
//     }
// }

// @Logger3("Info")
// class Person{
//     constructor(public name:string, public age:number){}
// }


// const e = new Person('John',25)
// console.log(e)


function Logger4(name:string){
    return function(constructor:Function)
        {
        console.log(`Identity:${name}`)
        console.log(`Class Name:${constructor.name}`)
    }
}

@Logger4("Logger 4")

class Person4{
    constructor(public age:number,public address:string){}
}

const p4 = new Person4(23,'Ahmedbad')
console.log(p4)