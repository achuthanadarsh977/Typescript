// interface Jain<T extends number | string | boolean>{
//     value:T
// }
// const p1 : Jain<string> = {value:"John Samuel"}
// const p2 : Jain<boolean> = {value:true}
// const p3 : Jain<number> = {value:23}
// console.log(p1)
// console.log(p2)
// console.log(p3)
function index(value) {
    return value;
}
console.log(index('Bool'));
console.log(index(12));
function inex(value1) {
    return value1;
}
console.log(inex({ name: 'Frank Castle', age: 37 }));
