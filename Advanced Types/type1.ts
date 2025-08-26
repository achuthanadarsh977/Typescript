// type Point = {
//     a : Number,
//     b : Number
// }


// type Point1 = {
//     c : Number,
//     d : Number
// }

// type Point2 = Point & Point1

// let p3 : Point2 = {a:10,b:20,c:30,d:40}


// console.log(p3)


// type Point2 = {
//     Name : String, Age: Number
// }


// type Point3 = {
//     Roll_no:Number, Gender: String
// }

// type Point4 = Point2 & Point3

// let p4 : Point4 = {Name:'Jack Davis' , Age:23 , Roll_no:2023178015,Gender:'Male'}
// console.log(p4)


// type Status = 'success' | 'failure' | 'abort'
// let s1 : Status = 'success'

// let s2 : Status = 'failure'
// let s3 : Status = 'abort'
// console.log('Success:'+s1)
// console.log('Abort:'+s3)
// console.log('Failure:',s2)


type Name = String | null

let n1 : Name = 'AD'

n1 = null
console.log(n1)





