var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var fruits = ['apple', 'banana', 'grapes', 'pineapple', 'mango', 'cherry'];
var vegetables = ['carrot', 'cucumber', 'beetroot', 'potato', 'tomato', 'brinjal'];
var pros = [10, 12, 14, 23, 44, 55];
var both = __spreadArray(__spreadArray(__spreadArray([], fruits, true), vegetables, true), pros, true);
var flags = [true, false, true];
var flags1 = __spreadArray(__spreadArray(__spreadArray([], pros, true), [true], false), fruits, true);
console.log('Fruits:', fruits);
console.log('Vegetables:', vegetables);
console.log('Numericals:', pros);
console.log('Both:', both);
console.log('Boolean:', flags);
console.log('All variables:', flags1);
