// function Logger3(prefix:string){
//     return function(constructor:Function){
//         console.log(`${prefix} present in ${constructor.name}`)
//     }
// }
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// @Logger3("Info")
// class Person{
//     constructor(public name:string, public age:number){}
// }
// const e = new Person('John',25)
// console.log(e)
function Logger4(name) {
    return function (constructor) {
        console.log(`Identity:${name}`);
        console.log(`Class Name:${constructor.name}`);
    };
}
let Person4 = class Person4 {
    constructor(age, address) {
        this.age = age;
        this.address = address;
    }
};
Person4 = __decorate([
    Logger4("Logger 4")
], Person4);
const p4 = new Person4(23, 'Ahmedbad');
console.log(p4);
