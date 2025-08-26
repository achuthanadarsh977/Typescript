function Log(
  target: object,
  key: string | symbol,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as Function;

  descriptor.value = function (...args: any[]) {
    console.log(`-> ${String(key)} called with`, args);

    const result = original.apply(this, args);
    console.log(`-> ${String(key)} returned with result`, result);

    return result;
  };

  return descriptor; // ✅ return the modified descriptor
}

class access1{
  @Log
  add(a: number, b: number) {
    return a + b;
  }
}

new access1().add(2, 3);
