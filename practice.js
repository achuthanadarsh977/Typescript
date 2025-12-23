/***********************
 * MATH FUNCTIONS
 ***********************/

// Sum of two numbers
function sum(a: number, b: number): number {
  return a + b;
}

// Factorial
function factorial(n: number): number {
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Prime number check
function isPrime(n: number): boolean {
  if (n <= 1) return false;

  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Greatest Common Divisor (GCD)
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/***********************
 * HASH TABLES
 ***********************/

// Frequency count using object
function frequencyCount(arr: number[]): Record<number, number> {
  const freq: Record<number, number> = {};

  for (const num of arr) {
    freq[num] = (freq[num] || 0) + 1;
  }

  return freq;
}

// Using Map (hash table)
function mapExample(): void {
  const map = new Map<string, number>();

  map.set("apple", 2);
  map.set("banana", 3);

  console.log("Map apple:", map.get("apple"));
}

// Find first duplicate
function firstDuplicate(arr: number[]): number | null {
  const seen = new Set<number>();

  for (const num of arr) {
    if (seen.has(num)) return num;
    seen.add(num);
  }

  return null;
}

/***********************
 * STRING ALGORITHMS
 ***********************/

// Reverse a string
function reverseString(str: string): string {
  return str.split("").reverse().join("");
}

// Palindrome check
function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase();
  return cleaned === cleaned.split("").reverse().join("");
}

// Character frequency
function charFrequency(str: string): Record<string, number> {
  const freq: Record<string, number> = {};

  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  return freq;
}

// Anagram check
function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const count: Record<string, number> = {};

  for (const char of a) {
    count[char] = (count[char] || 0) + 1;
  }

  for (const char of b) {
    if (!count[char]) return false;
    count[char]--;
  }

  return true;
}

// Substring search
function containsSubstring(str: string, sub: string): boolean {
  return str.includes(sub);
}

/***********************
 * EXECUTION / OUTPUT
 ***********************/

console.log("Sum:", sum(5, 3));
console.log("Factorial:", factorial(5));
console.log("Is Prime:", isPrime(7));
console.log("GCD:", gcd(48, 18));

console.log("Frequency Count:", frequencyCount([1, 2, 2, 3, 3, 3]));
mapExample();
console.log("First Duplicate:", firstDuplicate([1, 2, 3, 2, 4]));

console.log("Reverse String:", reverseString("hello"));
console.log("Is Palindrome:", isPalindrome("madam"));
console.log("Char Frequency:", charFrequency("hello"));
console.log("Is Anagram:", isAnagram("listen", "silent"));
console.log("Contains Substring:", containsSubstring("typescript", "script"));
