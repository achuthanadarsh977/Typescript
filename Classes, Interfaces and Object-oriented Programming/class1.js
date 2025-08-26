var Student = /** @class */ (function () {
    function Student(name, account_no, age, address) {
        this.name = name;
        this.account_no = account_no;
        this.age = age;
        this.address = address;
    }
    Student.prototype.display = function () {
        console.log('Name:' + this.name);
        console.log('Age:' + this.age);
        console.log('Address:' + this.address);
        console.log('Account_no:' + this.account_no);
    };
    return Student;
}());
var s = new Student('Vasudev Sajeev', 'A1001', 23, 'Chennai');
s.display();
