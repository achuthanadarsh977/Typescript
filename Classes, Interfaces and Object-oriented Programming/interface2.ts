


// interface Animal{
//     name:string;
// }


// interface Dog extends Animal{
//     barking() :void
// }

// let f: Dog = {name:'Dog', barking:()=>console.log('Woof!') }

// console.log(f)


// interface Species{
//     name:string;
// }

// interface Cat extends Species{
//     type:string;
//     meow():void;
// }

// let c: Cat = {name:'Cat',type:'Animal',meow:()=>console.log('Meow!')}
// console.log(c)

interface Area{
    length:number;
    breadth:number;
}

interface Rectangle extends Area{
    calculate():void;
}

let r : Rectangle = {length:32,breadth:42,calculate:()=>(this.length*this.breadth)}
console.log(r)


// interface Circle{
//     radius:number;
// }

// interface Area extends Circle{
//     area:number
// }

// let a : Area = {radius:4.14,area:(Math.PI*this.radius**2)}
// console.log('Area:'+a)