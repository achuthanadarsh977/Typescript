

let profile : any[] = ["Name:John Samuel" , "Age:23" , "Address:Chennai","ID:1001","Gender:Male"]

let profile2 : any[] = ["Blood Group:B++","Date Of Birth:20/12/2001"]


for(let i in profile){
    console.log(profile[i])
}


let copyprofile = [...profile]

let profile3 = profile.concat(profile2)

console.log(copyprofile)

console.log(profile3)

console.log(profile.lastIndexOf("Name:John Samuel"))

console.log(profile3.slice(5))

console.log(profile3.shift())

profile3[0] = "Name:John Samuel"
console.log(profile3)