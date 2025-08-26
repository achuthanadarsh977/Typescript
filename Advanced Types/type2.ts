



// function mysquare(x:number):number{
//     return x*x
// }

// console.log(mysquare(18888))

// type square = (a:number) => number
// type cube = (c:number) => number
// let sq : square = x => x*x
// let c : cube = c => c*c*c

// console.log(sq(23))
// console.log(c(99))

type direction = 'up' | 'down' | 'left' | 'right'

function move(direction){
    console.log(`Moving ${direction}`)

}

move('up')
move('down')
move('left')
move('right')
