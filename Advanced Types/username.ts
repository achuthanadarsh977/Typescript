


const userRoles = new Map<string,string>()

userRoles.set("John","pass123")
userRoles.set("Sarah","pass456")
userRoles.set("Sam","pass345")


console.log("Users are:",userRoles.keys())
console.log("Users are:",userRoles.values())

console.log("Password of John is",userRoles.get("John"))
console.log("Password of Sarah is",userRoles.get("Sarah"))
console.log("Password of Sam is",userRoles.get("Sam"))


console.log("Total number of user:"+userRoles.size)

userRoles.delete("Sam")

console.log("Does Sam have a password?",userRoles.has("Sam"))


console.log("Usernames:")
for(let k of userRoles.keys()){
    console.log("Map Keys:"+k)
}



