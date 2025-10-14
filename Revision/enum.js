var Size;
(function (Size) {
    Size[Size["Small"] = 1] = "Small";
    Size[Size["Large"] = 2] = "Large";
    Size[Size["Medium"] = 3] = "Medium";
})(Size || (Size = {}));
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(Direction || (Direction = {}));
console.log("Up Direction:" + Direction.Up);
console.log("Down Direction:" + Direction.Down);
console.log("Left Direction:" + Direction.Left);
console.log("Right Direction:" + Direction.Right);
