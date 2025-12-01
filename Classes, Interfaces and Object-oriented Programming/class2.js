// enum StatusCode{
//     NotFound = 404,
//     Success = 200,
//     Accepted = 202,
//     BadRequest = 400
// }
// interface Animal{
//     species:String,
//     age:number
// }
// const animal : Animal = {
//     name:'Donny',
//     id:'D1001',
//     species:'Dog',
//     age:13
// }
// console.log(animal)
// function typing(x:string,y:string){
//     if(x === y){
//         return true
//     }
//     return false
// }
// console.log(typing('animal','Animal'))
// type Species = {
//     name:string
// }
// type Animal1 = Species & {blood:string}
// const annie:Animal1 = {
//     name:"Annie",
//     blood:"B+"
// }
// console.log(annie)
// function printstatuscode(code : string | number){
//     console.log(code)
// }
// printstatuscode(404)
// interface Drawable{
//     draw():void
// }
// class Circle implements Drawable{
//     draw(){
//         console.log("Circle drawn")
//     }
// }
// class Square extends Circle{
//     draw(){
//         console.log('Square Drawn')
//     }
// }
// class Rectangle extends Circle{
//     draw(){
//         console.log('Rectangle Drawn')
//     }
// }
// const s = new Square()
// s.draw()
// const c = new Circle()
// c.draw()
// const r1 = new Rectangle()
// r1.draw()
// class Person{
//     name:String
//     age:Number
//     constructor(name:String,age:Number){
//         this.name = name
//         this.age = age
//     }
//     display(){
//         console.log(`Name:${this.name}`)
//         console.log(`Age:${this.age}`)
//     }
// }
// const p = new Person('Johnny Sins',69)
// p.display()
// class Student{
//     private marks:number = 0
//     get mark():number{
//         return this.marks
//     }
//     set mark(value:number){
//         if(value < 0 || value > 100){
//             throw new Error('Marks must be between 0 and 100')
//         }
//         this.marks = value
//     }
// }
// const s = new Student()
// s.mark = 90
// console.log(s)
var Subject = /** @class */ (function () {
    function Subject() {
        this.subject = '';
    }
    Object.defineProperty(Subject.prototype, "sub", {
        get: function () {
            return this.subject;
        },
        set: function (value) {
            if (value === "") {
                throw new Error('Subject is not empty');
            }
            this.sub = value;
        },
        enumerable: false,
        configurable: true
    });
    return Subject;
}());
var dictionarytowords = {
    "One": 1,
    "Two": 2,
    "Three": 3,
    "Four": 4,
    "Five": 5,
    "Six": 6
};
console.log(dictionarytowords);
