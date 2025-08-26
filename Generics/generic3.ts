


// class Box<T>{
//     constructor(public fed : string){}
// }


// const b = new Box<string>('Fedex')
// console.log(b) 


class Pair1<K,V>{
    constructor(public key : string , public value: number){}
}


class Label<K,V,L> extends Pair1<K,V>{
    constructor(public key : string , public value : number, public label : string){
        super(key,value)
    }
}


const w: Pair1<string,number> = {key:'One',value:1}
const v : Label<string,number,string> = {key:'One',value:1,label:'Primary'}
console.log(w)
console.log(v)