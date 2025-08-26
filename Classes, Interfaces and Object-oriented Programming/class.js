var Account = /** @class */ (function () {
    function Account(name, age, gender, address, account_no) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.address = address;
        this.account_no = account_no;
    }
    Account.prototype.greet = function () {
        console.log("Name:".concat(this.name));
        console.log("Age:".concat(this.age));
        console.log("Gender:".concat(this.gender));
        console.log("Address:".concat(this.address));
        console.log("Account_no:".concat(this.account_no));
    };
    return Account;
}());
var a1 = new Account('John', 23, 'Male', 'Chennai', 1001);
a1.greet();
