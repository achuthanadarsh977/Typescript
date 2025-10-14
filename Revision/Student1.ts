




class Student1{

    studname:string
    studcode:number

    constructor(studname:string,studcode:number){
        this.studname = studname
        this.studcode = studcode
    }

    display(){
        console.log(`Student Name:${this.studname}`)
        console.log(`Student Code:${this.studcode}`)
    }
}


class Student2 extends Student1{
    studgender:string
    
    constructor(studname:string,studgender:string,studcode:number){
        super(studname,studcode)
        this.studgender = studgender
    }

    display(): void {
        console.log(`Name:${this.studname}`)
        console.log(`Student Code:${this.studcode}`)
        console.log(`Student Gender:${this.studgender}`)
        
    }
}

class Student3 extends Student2{
    studaddress:string

    constructor(studname:string,studgender:string,studcode:number,studaddress:string){
        super(studname,studgender,studcode)
        this.studaddress = studaddress
    }

    display():void{
        console.log(`Name:${this.studname}`)
        console.log(`Student Code:${this.studcode}`)
        console.log(`Student Gender:${this.studgender}`)
        console.log(`Student Address:${this.studaddress}`)
    }
}




const s1 = new Student1("John Nathan Jones",10001)
const s3 = new Student3("Sara Paulson","Female",10003,"Chennai")

s1.display()
s3.display()