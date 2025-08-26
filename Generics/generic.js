// class KeyValuePair<K,T>{
//     constructor(public key:number , public value:string){}
// }
// const k = new KeyValuePair<number,string>(1,'A')
// console.log(k)
var NameValuePair = /** @class */ (function () {
    function NameValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
    return NameValuePair;
}());
var n = new NameValuePair('John Samuel', 'P1001');
console.log("Name:" + n.key);
console.log("ID:" + n.value);
