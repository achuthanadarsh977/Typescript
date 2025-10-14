




// function identity<T>(arg:T):T{
//     return arg
// }


// const a = identity<string>('John Samuel')
// const b = identity<number>(1001)
// const c = identity<number>(7550277362)
// console.log("Name:"+a)
// console.log("ID:"+b)
// console.log("Phone Number:"+c)


function identity1<T,U>(key:T,value:U):[T,U]{
    return [key,value]
    
}

const i = identity1<number,string>(23,"John Samuel")
console.log(i)