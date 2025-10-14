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
var Student1 = /** @class */ (function () {
    function Student1(studname, studcode) {
        this.studname = studname;
        this.studcode = studcode;
    }
    Student1.prototype.display = function () {
        console.log("Student Name:".concat(this.studname));
        console.log("Student Code:".concat(this.studcode));
    };
    return Student1;
}());
var Student2 = /** @class */ (function (_super) {
    __extends(Student2, _super);
    function Student2(studname, studgender, studcode) {
        var _this = _super.call(this, studname, studcode) || this;
        _this.studgender = studgender;
        return _this;
    }
    Student2.prototype.display = function () {
        console.log("Name:".concat(this.studname));
        console.log("Student Code:".concat(this.studcode));
        console.log("Student Gender:".concat(this.studgender));
    };
    return Student2;
}(Student1));
var Student3 = /** @class */ (function (_super) {
    __extends(Student3, _super);
    function Student3(studname, studgender, studcode, studaddress) {
        var _this = _super.call(this, studname, studgender, studcode) || this;
        _this.studaddress = studaddress;
        return _this;
    }
    Student3.prototype.display = function () {
        console.log("Name:".concat(this.studname));
        console.log("Student Code:".concat(this.studcode));
        console.log("Student Gender:".concat(this.studgender));
        console.log("Student Address:".concat(this.studaddress));
    };
    return Student3;
}(Student2));
var s1 = new Student1("John Nathan Jones", 10001);
var s3 = new Student3("Sara Paulson", "Female", 10003, "Chennai");
s1.display();
s3.display();
