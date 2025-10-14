// function identity<T>(arg:T):T{
//     return arg
// }
// const a = identity<string>('John Samuel')
// const b = identity<number>(1001)
// const c = identity<number>(7550277362)
// console.log("Name:"+a)
// console.log("ID:"+b)
// console.log("Phone Number:"+c)
function identity1(key, value) {
    return [key, value];
}
var i = identity1(23, "John Samuel");
console.log(i);
