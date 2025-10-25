class Student {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  // Getter method
  get name(): string {
    return this._name;
  }

  // Setter method
  set name(newName: string) {
    if (newName.length < 3) {
      throw new Error("Name must be at least 3 characters long.");
    }
    this._name = newName;
  }
}

const student = new Student("Adarsh");

// Using the getter
console.log(student.name); // Output: Adarsh

// Using the setter
student.name = "Achuthan";
console.log(student.name); // Output: Achuthan


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

/
