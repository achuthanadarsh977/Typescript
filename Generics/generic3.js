// class Box<T>{
//     constructor(public fed : string){}
// }
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// const b = new Box<string>('Fedex')
// console.log(b) 
var Pair1 = /** @class */ (function () {
    function Pair1(key, value) {
        this.key = key;
        this.value = value;
    }
    return Pair1;
}());
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(key, value, label) {
        var _this = _super.call(this, key, value) || this;
        _this.key = key;
        _this.value = value;
        _this.label = label;
        return _this;
    }
    return Label;
}(Pair1));
var w = { key: 'One', value: 1 };
var v = { key: 'One', value: 1, label: 'Primary' };
console.log(w);
console.log(v);
