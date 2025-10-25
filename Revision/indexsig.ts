interface StringDictionary{
    [key:string]:string
}

const profile:StringDictionary = {
    name:'fname',
    age:'fage',
    '100 Days':'Days'
}

console.log(profile['name'])
console.log(profile['age'])
console.log(profile['100 Days'])
