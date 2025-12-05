var canBark = {
    bark: function () {
        console.log('Dogs can bark');
    }
};
var canWagTail = {
    wagtail: function () {
        console.log('Tail wagged');
    }
};
var Dog = /** @class */ (function () {
    function Dog(name) {
        this.name = name;
    }
    return Dog;
}());
Object.assign(Dog.prototype, canBark, canWagTail);
var d = new Dog('Dog1');
d.bark();
d.wagtail();
