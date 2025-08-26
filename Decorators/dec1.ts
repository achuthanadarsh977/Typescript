
// function Logger(constructor:Function){
//     console.log('Logger:'+constructor.name)

// }


// @Logger
// class Person{
//     constructor(public name:string){}
// }

// const p1 = new Person('John Matthews')
// const p2 = new Person('Mike Banning')

// console.log(p1)
// console.log(p2)


function Logger1(constructor:Function){
    console.log('Constructor name:'+constructor.name)
}

@Logger1
class Person1{
    constructor(public firstname:string,public lastname:string){}
}

const r = new Person1('Mike','Banning')
const q = new Person1('James','Bond')
console.log(r)
console.log(q)