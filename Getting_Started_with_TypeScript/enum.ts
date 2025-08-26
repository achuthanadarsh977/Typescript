

enum Size{Small = 1,Medium = 2,Large = 3 }

enum Role{user = 'Adarsh' , password = 'dba123'}

let mysize : Size = Size.Medium

enum Direction{Up = 10,Down = 11,Left = 12,Right = 13}
let mydirection : Direction = Direction.Down
let mydirect : Direction = Direction.Left

let myrole : Role=Role.user
let mypassword: Role=Role.password
console.log(mysize)


console.log('Down:'+mydirection)
console.log('Left:'+mydirect)
console.log('Username:'+myrole)
console.log('Password:'+mypassword)
console.log(Size[0])