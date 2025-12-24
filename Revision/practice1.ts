// ===============================
// ALL MATH FUNCTION PROBLEMS
// File: mathProblems.ts
// Run: npx ts-node mathProblems.ts
// ===============================

// 1. Reverse a Number
function reverseNumber(n: number): number {
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev;
}

// 2. Palindrome Number
function isPalindrome(n: number): boolean {
  const original = n;
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return original === rev;
}

// 3. Factorial
function factorial(n: number): number {
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

// 4. Prime Check
function isPrime(n: number): boolean {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// 5. Print Prime Numbers
function printPrimes(limit: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

// 6. Fibonacci Series
function fibonacci(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr;
}

// 7. GCD
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// 8. LCM
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// 9. Count Digits
function countDigits(n: number): number {
  return n.toString().length;
}

// 10. Sum of Digits
function sumOfDigits(n: number): number {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

// 11. Armstrong Number
function isArmstrong(n: number): boolean {
  const digits = n.toString().split("").map(Number);
  const power = digits.length;
  let sum = 0;
  for (const d of digits) {
    sum += Math.pow(d, power);
  }
  return sum === n;
}

// 12. Power of a Number
function power(base: number, exp: number): number {
  return Math.pow(base, exp);
}

// 13. Square Root
function squareRoot(n: number): number {
  return Math.sqrt(n);
}

// 14. Even or Odd
function isEven(n: number): boolean {
  return n % 2 === 0;
}

// 15. Swap Two Numbers (without temp)
function swap(a: number, b: number): [number, number] {
  a = a + b;
  b = a - b;
  a = a - b;
  return [a, b];
}

// 16. Absolute Value
function absolute(n: number): number {
  return Math.abs(n);
}

// 17. Maximum of Two Numbers
function max(a: number, b: number): number {
  return Math.max(a, b);
}

// 18. Minimum of Two Numbers
function min(a: number, b: number): number {
  return Math.min(a, b);
}

// 19. Random Number in Range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 20. Sum of First N Numbers
function sumN(n: number): number {
  return (n * (n + 1)) / 2;
}

// ===============================
// TESTING ALL FUNCTIONS
// ===============================

console.log("Reverse:", reverseNumber(123));
console.log("Palindrome:", isPalindrome(121));
console.log("Factorial:", factorial(5));
console.log("Is Prime:", isPrime(11));
console.log("Primes till 20:", printPrimes(20));
console.log("Fibonacci:", fibonacci(7));
console.log("GCD:", gcd(24, 36));
console.log("LCM:", lcm(4, 6));
console.log("Digits Count:", countDigits(12345));
console.log("Sum of Digits:", sumOfDigits(123));
console.log("Armstrong:", isArmstrong(153));
console.log("Power:", power(2, 3));
console.log("Square Root:", squareRoot(16));
console.log("Is Even:", isEven(10));
console.log("Swap:", swap(5, 10));
console.log("Absolute:", absolute(-10));
console.log("Max:", max(10, 20));
console.log("Min:", min(10, 20));
console.log("Random:", randomInRange(1, 6));
console.log("Sum N:", sumN(10));
