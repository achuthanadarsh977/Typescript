



type  Individual ={
    name:string
    age:number
    gender:string
}



type Indy = keyof Individual
let indi : Indy = "name"

let indi1 : Indy = "age"
let indi2 : Indy = "gender"

console.log(indi1,indi2,indi)