


// interface A {
//     a:string
// }

// interface A{
//     b:string
// }


// let obj: A = {

//     a :'a',
//     b: 'b'
// }

// console.log(obj.a)
// console.log(obj.b)

interface Student{
    name:string,
    age:number,
    address:string,
    id:number
}

interface Student{
    gender:string,
    bloodgroup:string
}

let obj:Student ={
    name:'Sam Matthew',
    age:18,
    address:'Chennai',
    id:2001,
    gender:'Male',
    bloodgroup:'B+'
}

console.log('Name:'+obj.name)
console.log('Age:'+obj.age)
console.log('Address:'+obj.address)
console.log('Gender:'+obj.gender)