const canBark = {
    bark() {
        console.log("Bark!")
    }
}

const canWagTail = {
    wagtail() {
        console.log("Tail wagged")
    }
}

class Dog {
    constructor(public name: string) {}
}

// Mix abilities into Dog
Object.assign(Dog.prototype, canBark, canWagTail)


const d = new Dog("Dog1")

d.bark()
d.wagtail()
