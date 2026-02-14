/* Project Standards:
 - Logging standards:
 - Naming Standards:
    function, method, variable =>  CAMEL      goHome
    class => PASCAL     MemberService
    folder => KEBAB
    css => SNAKE        button_style
    - Error handling:

*/
/* Request:
Traditional API
Rest Api
GraphQL API
*/

/* Fronted development:
Traditional FD => SSR => EJS
Modern FD => SPA
 */

/* Cookies:
request join
self destroy

*/

/* Validation:
Fronted validation
Backend validation
Database validation 


*/

// // MIT TASK G

// function getHighestIndex(arr: number[]): number {
//   if (arr.length === 0) return -1; // bo‘sh array bo‘lsa, -1 qaytaradi

//   let max: number = arr[0];
//   let index: number = 0;

//   for (let i = 1; i < arr.length; i++) {
//     if (arr[i] > max) {
//       max = arr[i];
//       index = i;
//     }
//   }

//   return index;
// }

// // Test
// console.log(getHighestIndex([5, 21, 12, 21, 8])); // 1
// console.log(getHighestIndex([3, 7, 2, 1])); // 1
// console.log(getHighestIndex([10, 10, 9])); // 0
// console.log(getHighestIndex([])); // -1

// // MIT H-TASK
// function getPositive(arr: number[]): string {
//   return arr.filter((num) => num >= 0).join("");
// }

// console.log(getPositive([1, -4, 2]));
// console.log(getPositive([-1, -2, -3]));
// console.log(getPositive([5, 0, 8]));
// console.log(getPositive([10, -10, 3]));

// // MIT H-2 task
// export function getDigits(input: string): string {

//   return (input.match(/\d/g) || []).join('');
// }
// console.log(getDigits("b5u74y6"));
// console.log(getDigits("e78hf87"));

// //.  MIT task I

// function majorityElement(arr: number[]): number | null {
//   const count: Record<number, number> = {};

//   for (const num of arr) {
//     count[num] = (count[num] || 0) + 1;
//   }

//   let maxCount = 0;
//   let majority: number | null = null;

//   for (const num in count) {
//     if (count[num] > maxCount) {
//       maxCount = count[num];
//       majority = Number(num);
//     }
//   }

//   return majority;
// }

// // ✅ Test
// console.log(majorityElement([1, 2, 3, 4, 5, 4, 3, 4])); // 👉 4

// // MIT task J

// function findLongestWord(str: string): string {
//   const words = str.split(" ");
//   let longestWord = "";

//   for (const word of words) {
//     if (word.length > longestWord.length) {
//       longestWord = word;
//     }
//   }

//   return longestWord;
// }

// // Test
// console.log(findLongestWord("I come from Uzbekistan")); //  "Uzbekistan"

// // MIT TASK - K
// function countVowels(str: string): number {
//   const vowels = "aeiouAEIOU";
//   let count = 0;

//   for (const char of str) {
//     if (vowels.includes(char)) {
//       count++;
//     }
//   }

//   return count;
// }

// // Test
// console.log(countVowels("string")); // Output: 1
// console.log(countVowels("Hello World")); // Output: 3

// // MIT TASK-L

// function reverseSentence(str: string): string {

//   return str
//     .split(" ")
//     .map(word => word.split("").reverse().join(""))
//     .join(" ");
// }

// // Test
// console.log(reverseSentence("we like coding!")); // Output: "ew ekil gnidoc!"

// // MIT TASK

// type NumberSquare = {
//   number: number;
//   square: number;
// };

// function getSquareNumbers(arr: number[]): NumberSquare[] {
//   return arr.map((num) => ({
//     number: num,
//     square: num * num,
//   }));
// }

// // Misol:
// console.log(getSquareNumbers([1, 2, 3]));

// // N-TASK:

// function palindromeCheck(word: string): boolean {
//   const reversed = word.split("").reverse().join("");
//   return word === reversed;
// }

// console.log(palindromeCheck("dad")); // true
// console.log(palindromeCheck("son")); // false
// console.log(palindromeCheck("level")); // false

// TASK-O

// function calculateSumOfNumbers(arr: any[]): number {
//   let sum = 0;

//   for (const item of arr) {
//     if (typeof item === "number" && !isNaN(item)) {
//       sum += item;
//     }
//   }

//   return sum;
// }

// // test
// console.log(calculateSumOfNumbers([10, "10", { son: 10 }, true, 35])); // Output: 45

// // TASK-P

// function objectToArray(obj: Record<string, any>): [string, any][] {
//   return Object.entries(obj);
// }

// // Test
// console.log(objectToArray({ a: 10, b: 20 }));

// MIT TASK Q

// function hasProperty(obj: Record<string, any>, key: string): boolean {
//   return obj.hasOwnProperty(key);
// }

// console.log(hasProperty({ name: "BMW", model: "M3" }, "model")); // 👉 true
// console.log(hasProperty({ name: "BMW", model: "M3" }, "year")); // 👉 false

// MIT TASK-R

// function calculate(str: string): number {
//   return str
//     .split("+")
//     .map(Number)
//     .reduce((sum, num) => sum + num, 0);
// }

// console.log(calculate("1+3"));      // 4
// console.log(calculate("1+2+3+4"));  // 10
// console.log(calculate("10+20+30")); // 60

// // MIT task S

// function missingNumber(nums: number[]): number {
//     const n: number = nums.length;
//     const total: number = (n * (n + 1)) / 2;
//     const sum: number = nums.reduce((acc, curr) => acc + curr, 0);
//     return total - sum;
// }

// // Test
// console.log(missingNumber([3, 0, 1])); // 2
// console.log(missingNumber([0, 1]));    // 2
// console.log(missingNumber([9,6,4,2,3,5,7,0,1])); // 8

// // // MIT task T

// function mergeSortedArrays(arr1: number[], arr2: number[]): number[] {
//   return [...arr1, ...arr2].sort((a, b) => a - b);
// }

// console.log(mergeSortedArrays([0, 3, 4, 31], [4, 6, 30]));
// // ➜ [0, 3, 4, 4, 6, 30, 31]

// MIT task U

// const sumOdds = (n: number): number => {
//   return Math.floor((n + 1) / 2);
// };

// console.log(sumOdds(9));  // 4
// console.log(sumOdds(11)); // 5

// MIT TASK-- V

// function countChars(str: string): Record<string, number> {
//   const result: Record<string, number> = {};

//   for (const char of str) {
//     result[char] = (result[char] || 0) + 1;
//   }

//   return result;
// }

// console.log(countChars("hello"));
// // { h: 1, e: 1, l: 2, o: 1 }

// // MIT TASK W

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const result: T[][] = [];

//   for (let i = 0; i < arr.length; i += size) {
//     result.push(arr.slice(i, i + size));
//   }

//   return result;
// }

// // // MIT TASK X

// export function countOccurrences(obj: unknown, key: string): number {
//   let count = 0;

//   if (obj === null || obj === undefined) return 0;

//   if (Array.isArray(obj)) {
//     for (const item of obj) {
//       count += countOccurrences(item, key);
//     }
//     return count;
//   }

//   if (typeof obj === "object") {
//     for (const k of Object.keys(obj as Record<string, unknown>)) {
//       if (k === key) count += 1;
//       count += countOccurrences((obj as Record<string, unknown>)[k], key);
//     }
//   }

//   return count;
// }

// const data = {
//   model: "Bugatti",
//   steer: { model: "HANKOOK", size: 30 },
//   parts: [{ model: "X" }, { name: "y" }]
// };

// console.log(countOccurrences(data, "model")); // 3
// // (Bugatti, HANKOOK, "X")

// // // MIT TASK Y

// export function findIntersection(arr1: number[], arr2: number[]): number[] {
//   const set2 = new Set(arr2);
//   const result: number[] = [];

//   for (const num of arr1) {
//     if (set2.has(num)) {
//       result.push(num);
//     }
//   }

//   return result;
// }

// // // // MIT TASK Z

// function sumEvens(arr: number[]): number {
//   return arr
//     .filter((num: number) => num % 2 === 0)
//     .reduce((sum: number, num: number) => sum + num, 0);
// }

// console.log(sumEvens([1, 2, 3]));     // 2
// console.log(sumEvens([2, 4, 6]));     // 12
// console.log(sumEvens([1, 3, 5]));     // 0

// function sortByAge(arr: { age: number }[]): { age: number }[] {
//   return arr.sort((a, b) => a.age - b.age);
// }

// // TEST
// console.log(sortByAge([{ age: 23 }, { age: 21 }, { age: 13 }]));
// // natija: [ { age: 13 }, { age: 21 }, { age: 23 } ]

// // MIT TASK ZC

// function celsiusToFahrenheit(celsius: number): number {
//   return (celsius * 9) / 5 + 32;
// }

// // Test
// console.log(celsiusToFahrenheit(0));   // 32
// console.log(celsiusToFahrenheit(25));  // 77
// console.log(celsiusToFahrenheit(100)); // 212

// // // MIT TASK ZD

// function changeNumberInArray(
//   findNumber: number,
//   arr: number[],
//   newNumber: number
// ): number[] {
//   const index = arr.indexOf(findNumber);

//   if (index !== -1) {
//     arr[index] = newNumber;
//   }

//   return arr;
// }

// // Test
// console.log(changeNumberInArray(1, [1, 3, 7, 2], 2));
// // Output: [1, 2, 7, 2]

// // // // MIT TASK ZE

// function removeDuplicate(str: string): string {
//   return [...new Set(str)].join("");
// }

// console.log(removeDuplicate("stringg")); // "string"

// // MIT TASK ZF

// function capitalizeWords(text: string): string {
//   return text
//     .split(" ")
//     .map(word => {
//       if (word.length <= 2) return word;
//       return word[0].toUpperCase() + word.slice(1);
//     })
//     .join(" ");
// }

// console.log(capitalizeWords("name should be a string"));
// // "Name Should be a String"

// // // MIT TASK ZG

// function toSnakeCase(str: string): string {
//   return str
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, "_");
// }

// // Example
// toSnakeCase("name should be a string");
// // "name_should_be_a_string"

// // // MIT TASK ZH

// function findDisappearedNumbers(arr: number[]): number[] {
//   const max = Math.max(...arr);
//   const set = new Set(arr);
//   const result: number[] = [];

//   for (let i = 1; i <= max; i++) {
//     if (!set.has(i)) {
//       result.push(i);
//     }
//   }

//   return result;
// }

// findDisappearedNumbers([1, 3, 4, 7]);
// // [2, 5, 6]

// // // MIT TASK ZI

// function delayHelloWorld(message: string): Promise<string> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(message);
//     }, 3000);
//   });
// }

// async function run() {
//   const result = await delayHelloWorld("Hello World!");
//   console.log(result);
// }

// run();

// // // MIT TASK ZJ

// function reduceNestedArray(arr: any[]): number {
//   let sum = 0;

//   for (const item of arr) {
//     if (Array.isArray(item)) {
//       sum += reduceNestedArray(item);
//     } else if (typeof item === "number") {
//       sum += item;
//     }
//   }

//   return sum;
// }

// // Test
// console.log(reduceNestedArray([1, [1, 2, [4]]])); // 8
// console.log(reduceNestedArray([1, 4, [5]])); // 10

// // // // MIT TASK ZK

// function printNumbers(): void {
//   let count = 1;

//   const intervalId = setInterval(() => {
//     console.log(count);
//     count++;

//     if (count > 5) {
//       clearInterval(intervalId);
//     }
//   }, 1000);
// }

// printNumbers();

// // // // // MIT TASK ZL

// function stringToKebab(str: string): string {
//   return str
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "-");
// }

// stringToKebab("I love Kebab"); // "i-love-kebab"
// stringToKebab("  Hello   World  "); // "hello-world"

// // // // // MIT TASK ZM
// function squareDigits(num: number): string {
//   return num
//     .toString()
//     .split("")
//     .map((digit) => {
//       const n = Number(digit);
//       return (n * n).toString();
//     })
//     .join("");
// }
// console.log(squareDigits(222));

// // MIT TASK ZN

// function rotateArray(arr: number[], index: number): number[] {
//   const cutPart = arr.slice(0, index);
//   const remainingPart = arr.slice(index);

//   return [...remainingPart, ...cutPart];
// }

// console.log(rotateArray([1, 2, 3, 4, 5, 6], 2));
// // 👉 [3, 4, 5, 6, 1, 2]



// // // MIT TASK ZO
// function areParenthesesBalanced(str: string): boolean {
//     let count = 0;
    
//     for (let i = 0; i < str.length; i++) {
//         if (str[i] === '(') {
//             count++;
//         } else if (str[i] === ')') {
//             count--;
//         }
        
       
//         if (count < 0) {
//             return false;
//         }
//     }
    
   
//     return count === 0;
// }

// // Test cases
// console.log(areParenthesesBalanced("string()ichida(qavslar)soni()balansda")); // true
// console.log(areParenthesesBalanced("((()))")); // true
// console.log(areParenthesesBalanced("()()()"));  // true
// console.log(areParenthesesBalanced("(()"));     // false
// console.log(areParenthesesBalanced("())"));     // false
// console.log(areParenthesesBalanced(")(")); // false
// console.log(areParenthesesBalanced("hello")); // true (qavslar yo'q)


// // // // MIT TASK ZP

// type CountResult = {
// 	number: number;
// 	letter: number;
// };

// function countNumberAndLetters(text: string): CountResult {
// 	let number = 0;
// 	let letter = 0;

// 	for (const char of text) {
// 		if (/[0-9]/.test(char)) {
// 			number++;
// 		} else if (/[a-zA-Z]/.test(char)) {
// 			letter++;
// 		}
// 	}

// 	return { number, letter };
// }

// // // // // MIT TASK ZQ
// function findDuplicates(arr: number[]): number[] {
//     const count: { [key: number]: number } = {};
//     const duplicates: number[] = [];
    
//     // Count occurrences of each number
//     for (const num of arr) {
//         count[num] = (count[num] || 0) + 1;
//     }
    
//     // Find numbers that appear exactly 2 times or more
//     for (const num in count) {
//         if (count[num] >= 2) {
//             duplicates.push(Number(num));
//         }
//     }
    
//     return duplicates;
// }

// // Test
// console.log(findDuplicates([1, 2, 3, 4, 5, 4, 3, 4])); // [3, 4]


// // // // // MIT TASK ZR


// function areArraysEqual(arr1: number[], arr2: number[]): boolean {
// 	if (arr1.length !== arr2.length) return false;

// 	const sorted1 = [...arr1].sort((a, b) => a - b);
// 	const sorted2 = [...arr2].sort((a, b) => a - b);

// 	for (let i = 0; i < sorted1.length; i++) {
// 		if (sorted1[i] !== sorted2[i]) return false;
// 	}

// 	return true;
// }

// // examples
// areArraysEqual([1, 2, 3], [3, 1, 2]); // true
// areArraysEqual([1, 2, 2], [2, 1, 1]); // false



// // MIT TASK ZS

// function singleNumber(nums: number[]): number {
//   let result = 0;

//   for (const num of nums) {
//     result ^= num;
//   }

//   return result;
// }

// // MIT TASK ZT

// function firstUniqueCharIndex(s: string): number {
//     const charCount: Map<string, number> = new Map();
    
//     for (const char of s) {
//         charCount.set(char, (charCount.get(char) || 0) + 1);
//     }

//     for (let i = 0; i < s.length; i++) {
//         if (charCount.get(s[i]) === 1) {
//             return i;
//         }
//     }

//     return -1;
// }

// // Test
// console.log(firstUniqueCharIndex("stamp"));  // 0 (chunki 's' birinchi takrorlanmagan harf)
// console.log(firstUniqueCharIndex("aabbcc"));  // -1 (hamma harflar takrorlangan)
// console.log(firstUniqueCharIndex("loveleetcode"));  // 2 (chunki 'v' birinchi takrorlanmagan harf)
// console.log(firstUniqueCharIndex("aabb"));  // -1



// function sumOfUnique(nums: number[]): number {
//   const count: Record<number, number> = {};
//   let sum = 0;

//   // 1️⃣ Necha marta kelganini sanaymiz
//   for (const num of nums) {
//     count[num] = (count[num] ?? 0) + 1;
//   }

//   // 2️⃣ Faqat 1 marta kelganlarni qo‘shamiz
//   for (const num in count) {
//     if (count[num] === 1) {
//       sum += Number(num);
//     }
//   }

//   return sum;
// }

// sumOfUnique([1, 2, 3, 2]);      // 4  (1 + 3)
// sumOfUnique([1, 1, 1, 1]);     // 0
// sumOfUnique([5, 6, 7, 8]);     // 26
// sumOfUnique([10]);             // 10



// MIT TASK ZV 
function moveZeroes(nums: number[]): number[] {
  const result: number[] = [];
  let zeroCount = 0;

  for (const num of nums) {
    if (num === 0) {
      zeroCount++;
    } else {
      result.push(num);
    }
  }

  while (zeroCount > 0) {
    result.push(0);
    zeroCount--;
  }

  return result;
}

// Test
console.log(moveZeroes([0, 1, 0, 3, 12])); // [1, 3, 12, 0, 0]