



// class KeyValuePair<K,T>{
//     constructor(public key:number , public value:string){}
// }


// const k = new KeyValuePair<number,string>(1,'A')
// console.log(k)


class NameValuePair<P,T>{
    constructor(public key:string , public value:string){}
}

const n = new NameValuePair<string,string>('John Samuel','P1001')
console.log("Name:"+n.key)
console.log("ID:"+n.value)