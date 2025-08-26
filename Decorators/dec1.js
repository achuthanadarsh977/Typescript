// function Logger(constructor:Function){
//     console.log('Logger:'+constructor.name)
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// }
// @Logger
// class Person{
//     constructor(public name:string){}
// }
// const p1 = new Person('John Matthews')
// const p2 = new Person('Mike Banning')
// console.log(p1)
// console.log(p2)
function Logger1(constructor) {
    console.log('Constructor name:' + constructor.name);
}
let Person1 = class Person1 {
    constructor(firstname, lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }
};
Person1 = __decorate([
    Logger1
], Person1);
const r = new Person1('Mike', 'Banning');
const q = new Person1('James', 'Bond');
console.log(r);
console.log(q);
