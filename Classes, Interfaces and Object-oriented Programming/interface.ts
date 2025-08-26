

// interface Chambers{
//     name:string;
//     age:number;
//     address:string;
// }

// interface Chambers{
//     gender:string;
//     id:string;
// }

// let ch1 : Chambers = {name:'Mike Matthews' , age:23,address:'Ahmedabad',gender:'Male',id:'P1001'}

// let ch2 : Chambers = {name:'Nina Williams' , age:34,address:'Los Angeles',gender:'Female',id:'P1002'}


// console.log(ch1)
// console.log(ch2)

//Interface intersection
interface Animal{
    name:string
}

interface Dog extends Animal{
    bark:void;
}


//Type intersection

// type Animal1 = {
//     name:string
// }

// type Animal2 = {
//     bark():void
// }


// interface User{
//     id:string;
//     name:string;
//     isAdmin?:boolean;
// }


// let u1 : User = {id:'007',name:'James Bond',isAdmin:true}
// console.log('Id:'+u1.id)
// console.log('Name:'+u1.name)
// console.log('Admin:'+u1.isAdmin)

interface Car{
    carid:string;
    model:string;
    name:string;
    car_no:number;
}

interface Car{
    car_date:string;
    car_crash_date?:string;
}

const d : Car = {carid:'C1001',model:'audi',name:'AUDI1001',car_no:1001,car_date:'2005-12-17'}

console.log(d)