# Chapter 14: 新的面向对象编程(OOP)特性（classes 除外）

ES6 的新 OOP 特性中，_Classes_（将在下一章介绍）是非常重要的内容。除此以外，它还包含了 _对象字面量(object literals)_ 的新特性以及 _Object_ 的新实用方法，本章先介绍它们。

## 14.1 概览

### 14.1.1 对象字面量的新特性

方法定义更简洁：

```javascript
const obj = {
  myMethod(x, y) {
    // ...
  }
};
```

属性值可简写：

```javascript
const first = "Jane";
const last = "Don";

// 下面两行代码是一样的
const obj = { first, last };
const obj = { first: first, last: last };
```

可计算的属性 key：

```javascript
const propKey = "foo";
const obj = {
  [propKry]: true,
  ["b" + "ar"]: 123
};
```

这种新语法也适用于方法定义：

```javascript
const obj = {
  ["h" + "ello"]() {
    return "hi";
  }
};
console.log(obj.hello()); // hi
```

可计算的属性 key 的主要使用场景是可以很方便地把 symbols 作为属性 key 来使用。

### 14.1.2 Object 中的新方法

Object 中最重要的新方法是 [assign()][object​.assign] 。传统上讲，这个功能在 JavaScript 世界中被称为 extend()。与此经典操作不同，Object.assign()只考虑本身（非继承）的属性。

[object​.assign]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

```javascript
const obj = { foo: 123 };
Object.assign(obj, { bar: true });
// {"foo":123,"bar":true}
console.log(JSON.stringify(obj));
```

({{

下面看个继承属性的例子：

```javascript
const obj = Object.create({ x: 1 });
obj.foo = 100;
const src = Object.create({ y: 2 });
src.bar = false;
Object.assign(obj, src);

// 结果没有属性x：因为JSON.stringify()不会序列化原型对象的属性。
// 结果没有属性y：因为Object.assign()只从src中拷贝可枚举的自有属性，
// y是src的继承属性，所以它不会被拷贝。
console.log(JSON.stringify(obj)); // => {"foo":100,"bar":false}

// 进一步验证下上面的结论
console.log(obj.x); // => 1
console.log(obj.y )l // => undefined
```

至于为什么 JSON.stringify()不会序列化原型对象的属性，有兴趣的同学可以看 [这里](https://stackoverflow.com/questions/12369543/why-is-json-stringify-not-serializing-prototype-values)。

}})
