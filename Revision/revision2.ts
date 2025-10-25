class Rectangle {
  private _width: number;
  private _height: number;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  get area(): number {
    return this._width * this._height;
  }

  set width(value: number) {
    if (value <= 0) throw new Error("Width must be positive.");
    this._width = value;
  }

  set height(value: number) {
    if (value <= 0) throw new Error("Height must be positive.");
    this._height = value;
  }
}

const rect = new Rectangle(10, 5);
console.log(rect.area); // 50

rect.width = 20;
console.log(rect.area); // 100
