var x = 3;
function func(randomize) {
  if (randomize) {
    var x = Math.random();
    return x;
  }
  return x;
}
func(false);

var x = 3;
function func(randomize) {
  var x;
  if (randomize) {
    x = Math.random();
    return x;
  }
  return x;
}
func(false);

let x = 3;
function func(randomize) {
  if (randomize) {
    let x = Math.random();
    return x;
  }
  return x;
}
func(false);

(function() {
  // open IIFE
  var tmp = "...";
  // ...
})(); // close IIFE

console.log(tmp); // ReferenceError

{
  // open block
  let tmp = "...";
  // ...
} // close block
console.log(tmp); // ReferenceError

function printCoord(x, y) {
  console.log("(" + x + ", " + y + ")");
}

function UiComponent() {
  var _this = this;
  var button = document.getElementById("myButton");
  button.addEventListener("click", function() {
    console.log("click");
    _this.handleClick();
  });
}

UiComponent.prototype.handleClick = function() {
  // ...
};

function UiComponent() {
  var button = document.getElementById("myButton");
  button.addEventListener("click", () => {
    console.log("click");
    this.handleClick(); // 这里的this指向UiComponent对象
  });
}

var arr = [1, 2, 3];
var squares = arr.map(function(x) {
  return x * x;
});

const arr = [1, 2, 3];
const squares = arr.map(x => x * x);

var matchObj = /^(\d\d\d\d)-(\d\d)-(\d\d)$/.exec("2999-12-31");
var year = matchObj[1];
var month = matchObj[2];
var day = matchObj[3];

const [, year, month, day] = /^(\d\d\d\d)-(\d\d)-(\d\d)$/.exec("2999-12-31");

var obj = { foo: 123 };
var propDesc = Object.getOwnPropertyDescriptor(obj, "foo");
var writable = propDesc.writable;
var configurable = propDesc.configurable;
console.log(writable, configurable);

const obj = { foo: 123 };
const { writable, configurable } = Object.getOwnPropertyDescriptor(obj, "foo");
console.log(writable, configurable);

var arr = ["a", "b", "c"];
for (var i = 0; i < arr.length; i++) {
  var elem = arr[i];
  console.log(elem);
}

var arr = ["a", "b", "c"];
arr.forEach(function(elem) {
  console.log(elem);
});

const arr = ["a", "b", "c"];
for (const elem of arr) {
  console.log(elem);
}

const arr = ["a", "b", "c"];
for (const [index, value] of arr.entries()) {
  console.log(index + ", " + value);
}

function selectEntries({ start = 0, end = -1, step = 1 } = {}) {
  console.log(start, end, step);
  // ...
}

function logAllArguments() {
  for (var i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}

Math.max.apply(Math, [-1, 5, 11, 3]);

Math.max(...[-1, 5, 11, 3]);

var arr1 = ["a", "b"];
var arr2 = ["c", "d"];

arr1.push.apply(arr1, arr2);

var arr1 = ["a", "b"];
var arr2 = ["c"];
var arr3 = ["d", "e"];

// [ 'a', 'b', 'c', 'd', 'e' ]
console.log(arr1.concat(arr2, arr3));

var obj = {
  foo: function() {
    // ...
  },
  bar: function() {
    this.foo();
  } // 尾部的逗号是ES5中式合法的，但是在IE中可能会报错
};

const obj = {
  foo() {},
  bar() {
    this.foo;
  }
};

function Person(name) {
  this.name = name;
}
Person.prototype.describe = function() {
  return "Person called " + this.name;
};

function Employee(name, title) {
  Person.call(this, name); // super(name)
  this.title = title;
}
Employee.prototype = Object.create(Person.prototype);
Employee.prototype.constructor = Employee;
Employee.prototype.describe = function() {
  return (
    Person.prototype.describe.call(this) + // super.describe()
    " (" +
    this.title +
    ")"
  );
};

class Person {
  constructor(name) {
    this.name = name;
  }

  describe() {
    return "Person called " + this.name;
  }
}

class Employee extends Person {
  constructor(name, title) {
    super(name);
    this.title = title;
  }
  describe() {
    return super.describe() + " (" + this.title + ")";
  }
}

function MyError() {
  var superInstance = Error.apply(null, arguments);
  copyOwnPropertiesFrom(this, superInstance);
}
MyError.prototype = Object.create(Error.prototype);
MyError.prototype.constructor = MyError;

function copyOwnPropertiesFrom(target, source) {
  Object.getOwnPropertyNames(source).forEach(function(propKey) {
    var desc = Object.getOwnPropertyDescriptor(source, propKey);
    Object.defineProperty(target, propKey, desc);
  });
  return target;
}

var dict = Object.create(null);
function countWords(word) {
  var escapedWord = escapeKey(word);
  if (escapedWord in dict) {
    dict[escapedWord]++;
  } else {
    dict[escapedWord] = 1;
  }
}

function escapeKey(key) {
  // 对特殊的key转义
  if (key.indexOf("__proto__") === 0) {
    return key + "%";
  } else {
    return key;
  }
}

const map = new Map();
function countWords(word) {
  const count = map.get(word) || 0;
  map.set(word, count + 1);
}

if (str.indexOf("x") === 0) {
} // ES5
if (str.startsWith("x")) {
} // ES6

function endsWith(str, suffix) {
  var index = str.indexOf(suffix);
  return index >= 0 && index === str.length - suffix.length;
}
str.endsWith(suffix);

const arr = ["a", NaN];
arr.indexOf(NaN);
arr.findIndex(x => Number.isNaN(x));

var arr1 = Array.prototype.slice.call(arguments); // ES5
const arr2 = Array.from(arguments); // ES6

const arr1 = [..."abc"];
const arr2 = [...new Set().add("a").add("b")];

var arr1 = new Array(2);
var arr2 = Array.apply(null, arr1);

// ----- lib.js-----
var sqrt = Math.sqrt;
function square(x) {
  return x * x;
}
function diag(x, y) {
  return sqrt(square(x) + square(y));
}
module.exports = {
  sqrt: sqrt,
  square: square,
  diag: diag
};

// ----- main1.js -----
var square = require("lib").square;
var diag = require("lib").diag;

console.log(square(11)); // 121
console.log(diag(4, 3)); // 5

// ----- main2.js -----
var lib = require("lib");

console.log(lib.square(11)); // 121
console.log(lib.diag(4, 3)); // 5

// ----- lib.js -----
export const sqrt = Math.sqrt;
export function square(x) {
  return x * x;
}
export function diag(x, y) {
  return sqrt(square(x) + square(y));
}

// ----- main1.js -----
import { square, diag } from "lib";
console.log(square(11));
console.log(diag(4, 3));

// ----- main2.js -----
import * as lib from "lib"; // (A)
console.log(lib.square(11)); // 121
console.log(lib.diag(4, 3)); // 5

// ----- myFunc.js -----
module.exports = function() {
  // ...
};

// ----- main1.js -----
var myFunc = require("myFunc");
myFunc();

// ----- myFunc.js -----
export default function() {
  // ...
} // 注意这里没有分号！

// ----- main1.js -----
import myFunc from "myFunc";
myFunc();
