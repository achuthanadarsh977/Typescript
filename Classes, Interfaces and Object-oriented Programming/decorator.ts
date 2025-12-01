


// function logclass(constructor:Function){
//     console.log(`Class ${constructor.name} was defined at ${new Date().toISOString()}`)
// }


// function logging(constructor:Function){
//     console.log(`Class ${constructor.name} was created at ${new Date().toISOString()}`)
// }

// @logging

// class UserService{

//     getusers(){
//         return ['Alice','Bob','Sarah']
//     }
// }

// const u = new UserService()
// console.log(u.getusers())


function logging(constructor:Function){
    console.log(`Class ${constructor.name} was created at ${new Date().toISOString()}`)
}

@logging

class UserService{
    getid(){
        return ['1001','1002','1003']
    }
}


const y = new UserService