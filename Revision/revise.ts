
// let sum = (a:number,b:number):number => {
//     return a+b
// }

// console.log(sum(20,30))

// let product = (a:number,b:number):number => {
//     return a*b
// }

// console.log(product(20,30))

// let divide = (a:number,b:number):number => {
//     return a/b;
// }

// console.log(Math.floor(divide(30,20)))

// class Operations{
//     name:string
//     age:number
//     constructor(name:string,age:number){
//         this.name = name
//         this.age = age
//     }
    
//     display(){
//         console.log(`Name:${this.name}`)
//         console.log(`Age:${this.age}`)
//     }
// }

// const o = new Operations('Jack Daniels' , 23)
// o.display()

// class Operations{
//     a:number
//     b:number
//     constructor(a:number,b:number){
//         this.a = a
//         this.b = b
//     }
    
//     display(){
//         console.log(`Sum of two numbers:${this.a+this.b}`)
//         console.log(`Difference of two numbers:${this.a - this.b}`)
//         console.log(`Product of two numbers:${this.a*this.b}`)
//         console.log(`Quotient of two numbers:${(this.a)/(this.b)}`)
//         console.log(`Modulus of two numbers:${(this.a)%(this.b)}`)
//     }
// }
// const o = new Operations(34,23)
// o.display()

// class BankBalance{
//     private balance:number
//     constructor(balance:number){
//         this.balance = balance
//     }
    
//     getdeposit(amount:number){
//         this.balance+=amount
//     }
    
//     getBalance(){
//         console.log(`Total Balance:${this.balance}`)
//     }
// }

// const bank = new BankBalance(20000)
// bank.getdeposit(5000)
// bank.getBalance()

// class Animal{
    
//     move(){
//         console.log("Moving")
//     }
// }

// class Dog extends Animal{
//     bark(){
//         console.log("Barking")
//     }
// }

// const d = new Dog()
// d.move()
// d.bark()

// abstract class Vehicle{
//     abstract startengine():void
    
//     stopengine(){
//         console.log("Engine has stopped")
//     }
// }

// class Car extends Vehicle{
//     startengine(){
//         console.log("Engine has started")
//     }
// }

// const c = new Car()
// c.startengine()
// c.stopengine()

// interface Drawable{
//     draw():void;
// }

// class Circle implements Drawable{
//     draw():void{
//         console.log("Circle is drawn")
//     }
// }

// const c = new Circle()
// c.draw()

// class Student{
//     private mark:number;
  
//     get marks():number{
//         return this.mark
//     }
    
//     set marks(value:number){
//         if(value < 0 || value > 100){
//             throw new Error('Error has handled')
//         }
//       this.mark = value
//     }
// }

// const s = new Student()
// s.marks = 67
// console.log(s.marks)

// class Make{
//     public rollno:number;
    
//     get roll():number{
//         return this.rollno
//     }
    
//     set roll(value:number){
//         this.rollno = value
//     }
// }

// const t = new Make()
// t.rollno = 1003
// console.log(t.roll)


