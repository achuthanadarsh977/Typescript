let fruits : string[] = ['apple','banana','grapes','pineapple','mango','cherry'];
let vegetables: string[] = ['carrot','cucumber','beetroot','potato','tomato','brinjal'];

let pros : number[] = [10,12,14,23,44,55];

let both : any[] = [...fruits,...vegetables,...pros]
let flags : boolean[] = [true,false,true]

let flags1: Array<any> = [...pros,true,...fruits]

console.log('Fruits:',fruits);
console.log('Vegetables:',vegetables);
console.log('Numericals:',pros);
console.log('Both:',both);
console.log('Boolean:',flags);
console.log('All variables:',flags1);
