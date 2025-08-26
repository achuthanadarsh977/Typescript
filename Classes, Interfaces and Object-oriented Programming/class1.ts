

class Student{
    name:string;
    account_no:string;
    age:number;
    address:string;

    constructor(name:string,account_no:string,age:number,address:string){
        this.name=name;
        this.account_no=account_no;
        this.age=age;
        this.address=address;
    }

    display():void{
        console.log('Name:'+this.name)
        console.log('Age:'+this.age)
        console.log('Address:'+this.address)
        console.log('Account_no:'+this.account_no)
    }
    
}

let s = new Student('Vasudev Sajeev','A1001',23,'Chennai')
s.display()