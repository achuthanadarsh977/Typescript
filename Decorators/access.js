var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function First(target, key, descriptor) {
    console.log('First descriptor applied to', key);
}
function Second(target, key, descriptor) {
    console.log('Second descriptor applied to', key);
}
let Example = class Example {
    show() {
        console.log('Hello');
    }
};
Example = __decorate([
    First,
    Second
], Example);
