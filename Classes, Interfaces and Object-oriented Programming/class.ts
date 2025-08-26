
class Account{
    name:string;
    age:number;
    gender:string;
    address:string;
    account_no:number;

    constructor(name:string,age:number,gender:string,address:string,account_no:number){
        this.name=name
        this.age=age
        this.gender=gender
        this.address=address
        this.account_no=account_no
    }

    greet():void{
        console.log(`Name:${this.name}`)
        console.log(`Age:${this.age}`)
        console.log(`Gender:${this.gender}`)
        console.log(`Address:${this.address}`)
        console.log(`Account_no:${this.account_no}`)
    }
}

let a1 = new Account('John',23,'Male','Chennai',1001);
a1.greet()



