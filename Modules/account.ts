



export class Account{

    name:string
    age:number
    id:string
    address:string
    transcation_id:string

    constructor(name:string,age:number,id:string,address:string,transcation_id:string){
        this.name = name
        this.age = age
        this.id = id
        this.address = address
        this.transcation_id = transcation_id
    }

    display(){
        console.log('Name:'+this.name)
        console.log('Age:'+this.age)
        console.log('Account_id:'+this.id)
        console.log('Address:'+this.address)
        console.log('Transaction Id:'+this.transcation_id)
    }


}

const d = new Account('Johnny D',23,'1001','Chennai','T10001')
d.display()