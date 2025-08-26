



export class Circle{

    radius:number
    constructor(radius:number){
        this.radius = radius
    }

    area():void{
        console.log("Circle Area:"+(Math.PI*this.radius**2))
    }
}


export class Rectangle{
    length:number
    breadth:number
    constructor(length:number,breadth:number){
        this.breadth = breadth
        this.length = length
    }




}



export class Area extends Rectangle{
    calculate():void{
        console.log(`Area of rectangle:+${this.breadth*this.length}`)
    }
}

const a = new Area(23,34)
a.calculate()