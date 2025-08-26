


// type Point = {x:Number , y:Number}
// type Point2 = {c: number , d: number}

// let p3 : Point2 = {c:30,d:40}

// let p1 : Point = {x : 10 , y : 20};


// type Point1 = {a:Number , b:Number}
// let p2 : Point1 = {a:10,b:20}

// console.log(p1)
// console.log(p2)
// console.log(p3)

type Mathematicaloperation = (a:number , b:number) => number;

let add : Mathematicaloperation = (x,y) => x + y

let sub : Mathematicaloperation = (x,y) => x - y;
let div : Mathematicaloperation = (x,y) => x / y;
let mul : Mathematicaloperation = (x,y) => x * y;

let mod : Mathematicaloperation = (x,y) => x % y;



console.log(add(12,13))
console.log(sub(199,188))
console.log(div(192,32))

console.log(mul(177,188))
console.log(mod(99,3))