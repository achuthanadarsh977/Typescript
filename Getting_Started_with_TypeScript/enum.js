var Size;
(function (Size) {
    Size[Size["Small"] = 1] = "Small";
    Size[Size["Medium"] = 2] = "Medium";
    Size[Size["Large"] = 3] = "Large";
})(Size || (Size = {}));
var Role;
(function (Role) {
    Role["user"] = "Adarsh";
    Role["password"] = "dba123";
})(Role || (Role = {}));
var mysize = Size.Medium;
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 10] = "Up";
    Direction[Direction["Down"] = 11] = "Down";
    Direction[Direction["Left"] = 12] = "Left";
    Direction[Direction["Right"] = 13] = "Right";
})(Direction || (Direction = {}));
var mydirection = Direction.Down;
var mydirect = Direction.Left;
var myrole = Role.user;
var mypassword = Role.password;
console.log(mysize);
console.log('Down:' + mydirection);
console.log('Left:' + mydirect);
console.log('Username:' + myrole);
console.log('Password:' + mypassword);
console.log(Size[0]);
