"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var module2_1 = require("./module2");
var module1_1 = require("./module1");
console.log((0, module2_1.greeting)('Johnny D'));
console.log((0, module2_1.add)(19, 18));
var e = new module1_1.Area(23, 34);
e.calculate();
