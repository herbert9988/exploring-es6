# Chapter 04: ES6 核心特性

本章将描述 ES6 的核心特性。这些特性都很易于使用，而余下的特性主要适用于一些库的开发者(本章暂不做讨论)。接下来，我将通过 ES5 的代码来逐个解释这些核心特性。

## 4.1 从 var 到 const / let

在 ES5 中，你可以通过 var 关键字来定义变量。这样的变量具有函数作用域 (function-scoped)，它的作用域是整个(定义该变量的)最内层函数。var 变量的这种行为有时令人困惑。这里有一个例子：

    var x = 3;
    function func(randomize) {
        if (randomize) {
            var x = Math.random(); // (A) 作用域：整个函数
            return x;
        }
        return x; // 从行A中获取x
    }
    func(false);  // 这里返回什么？

你可能很惊讶，func(false)最后返回 undefined。如果按照下面的方式重写代码，看看到底发生了什么，你就能明白为什么会有这样的结果了：

    var x = 3;
    function func(randomize) {
        var x; // 声明提前 hoisting
        if (randomize) {
            x = Math.random();
            return x;
        }
        return x;
    }
    func(false);

({{ 上面2段代码是完全等价的，因为通过var声明的变量会被提前到函数或者全局代码的顶部，这种行为叫做声明提前 [hoisting][var.hoisting]。 }})

[var.hoisting]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var#var_hoisting

在 ES6 中，你还可以另外通过 let 和 const 这两个关键字来定义变量。
这样的变量具有块级作用域(block-scoped)，它的作用域是整个(定义该变量的)最内层代码块。let 大致相当于块级作用域版的 var。除了 const 创建的变量的值不能被修改之外，const 跟 let 差不多一样。

let 和 const 的行为更加严格，并且可能抛出更多的异常（比如当你在定义它们的变量之前，直接访问这些变量）。块级作用域有助于使代码片段的影响更加局部化（参见下一节的演示），而且它比函数作用域更为主流，使得 JavaScript 和其他编程语言之间迁移时变得更加简单。

在上一个例子中，如果你使用 let 来替换 var，你将得到不同的行为(及结果)：

    let x = 3;
    function func(randomize) {
        if (randomize) {
            let x = Math.random();
            return x;
        }
        return x;
    }
    func(false); // 3

也就是说，在现有代码中，你不能盲目地使用 let 或 const 来替换 var，在重构的时候需要小心。

我的建议是：

- 优先使用 const，适用于那些值重不改变的变量。
- 其次，使用 let，适用于那些值会改变的变量。
- 避免使用 var。

[comment]: # "更多信息请参考 [第 9 章：变量和作用域][chapter09]。"
[chapter09]: http://todo.com

## 4.2 从 IIFEs 到代码块(blocks)

在 ES5 中，如果你想限制一个变量 tmp 的作用域在一个代码块中，那你必须使用 IIFE(Immediately-Invoked Function Expression, 即时调用函数表达式)来实现：

    (function () { // open IIFE
        var tmp = "...";
        // ...
    })(); // close IIFE

    console.log(tmp); // ReferenceError

在 ES6 中，你只需要简单使用一个代码块和一个 let(或 const)声明即可：

    { // open block
        let tmp = "...";
        // ...
    } // close block
    console.log(tmp); // ReferenceError

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"
[avoid-iifes-in-es6]: http://todo.com

## 4.3 从连接字符串到模板文字(template literals)

在 ES6 中，JavaScript 终于可以获取文本插入(string interpolation)和多行文本(multi-line strings)的值了。

### 4.3.1 文本插入(String interpolation)

在 ES5 中，如果要向字符串中插入值，需要把这些值和字符片段依次串联起来：

    function printCoord(x, y) {
        console.log("(" + x + ", " + y + ")");
    }

在 ES6 中，你可以使用模板文字来完成文本插入：

    function printCoord(x, y) {
        console.log(`(${x}, ${y})`);
    }

### 4.3.2 多行文本(Multi-line strings)

模板文字也有助于表示多行文本。

比如，如果你想在把一个 html 网页骨架的源代码保存到一个变量里，你需要在 ES5 中写出下面这样的代码：

    var HTML5_SKELETON =
        '<!doctype html>\n' +
        '<html>\n' +
        '<head>\n' +
        '    <meta charset="UTF-8">\n' +
        '    <title></title>\n' +
        '</head>\n' +
        '<body>\n' +
        '</body>\n' +
        '</html>\n';

如果你使用反斜线来代替换行符，代码看起来好一点了（但是你依然要明确地添加换行符）：

    var HTML5_SKELETON = '\
        <!doctype html>\n\
        <html>\n\
        <head>\n\
            <meta charset="UTF-8">\n\
            <title></title>\n\
        </head>\n\
        <body>\n\
        </body>\n\
        </html>';

ES6 的模板文字是可以直接跨行的：

    const HTML5_SKELETON = `
        <!doctype html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title></title>
        </head>
        <body>
        </body>
        </html>`;

(这些例子的区别在于它们包含的空白数不同，但是在这个场景里这点无关紧要)

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.4 从函数表达式到箭头函数(arrow functions)

在当前的 ES5 代码中，每当你使用函数表达式(function expressions)时，你必须要格外小心 _this_ 的值。在下面的例子中，我将创建一个辅助变量\_this(行 A 处)，以便在行 B 处可以访问 UiComponent 对象的 this 值。

    function UiComponent() {
        var _this = this;        // (A)
        var button = document.getElementById("myButton");
        button.addEventListener("click", function () {
            console.log("click");
            _this.handleClick(); // (B)
        });
    }

    UiComponent.prototype.handleClick = function () {
        // ...
    };

在 ES6 中，你可以使用箭头函数(arrow functions)，这样就不需要从外部保存并传入外部对象的 this 值了。

    function UiComponent() {
        var button = document.getElementById("myButton");
        button.addEventListener("click", () => {
            console.log("click");
            this.handleClick(); // 这里的this指向UiComponent对象
        });
    }

(在 ES6 中，你也可以选择使用 class 来代替构造函数。我们将会在稍后讨论这点。)

对于那些仅仅返回表达式结果的回调函数，使用箭头函数会变得特别方便。这样的回调函数在 ES5 中相对冗长一些：

    var arr = [1, 2, 3];
    var squares = arr.map(function(x) {
      return x * x;
    });

使用箭头函数会简洁得多：

    const arr = [1, 2, 3];
    const squares = arr.map(x => x * x);

当定义形参的时候，如果只有单个参数，你甚至可以省略括号。因此：(x) => x \* x 和 x => x \* x 都是允许的。

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.5 处理多个返回值

有些函数或方法通过数组或者对象返回多个返回值。在 ES5 中，你往往需要创建中间变量来访问这些值。但是在 ES6 中，你可以使用解构(destructuring)
来避免创建中间变量。

### 4.5.1 通过数组返回多个值

[exec()][regexp.prototype​.exec] 方法通过类数组对象返回捕获的组。在 ES5 中，即使你只是对组的内容感兴趣，你也需要通过一个中间变量(下面例子中的 matchObj)来获取它们。

[regexp.prototype​.exec]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec

    var matchObj = /^(\d\d\d\d)-(\d\d)-(\d\d)$/.exec("2999-12-31");
    var year = matchObj[1];
    var month = matchObj[2];
    var day = matchObj[3];

在 ES6 中，解构使得代码更加简单：

    const [, year, month, day] =
      /^(\d\d\d\d)-(\d\d)-(\d\d)$/
      .exec("2999-12-31");

### 4.5.2 通过对象返回多个值

[Object.getOwnPropertyDescriptor()][object​.get​ownproperty​descriptor] 方法返回一个属性描述符对象，这个对象在它的属性(properties)中包含多个值。

[object​.get​ownproperty​descriptor]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor

在 ES5 中，即使你只对某个对象的属性感兴趣，你仍然需要通过一个中间变量（下面例子中的 propDesc）来获取它们。

    var obj = { foo: 123 };
    var propDesc = Object.getOwnPropertyDescriptor(obj, "foo");
    var writable = propDesc.writable;
    var configurable = propDesc.configurable;
    console.log(writable, configurable); // true true

在 ES6 中，你可以使用解构：

    const obj = { foo: 123 };
    const { writable, configurable } =
        Object.getOwnPropertyDescriptor(obj, "foo");
    console.log(writable, configurable);

{ writable, configurable } 是下面代码的缩写：

    { writable: writable, configurable: configurable }

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.6 从 for 到 forEach() 再到 for-of

在 ES5 之前，你需要按照如下的方式来遍历一个数组:

    var arr = ["a", "b", "c"];
    for (var i = 0; i < arr.length; i++) {
      var elem = arr[i];
      console.log(elem);
    }

在 ES5 中，你可以选择使用数组的 [forEach()][array​.prototype​.for​each] 方法：

[array​.prototype​.for​each]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach

    var arr = ["a", "b", "c"];
    arr.forEach(function(elem) {
      console.log(elem);
    });

for 循环的优点是你可以随时跳出循环，而 forEach() 方法的优点是代码简洁。

在 ES6 中，for-of 循环同时具有上述 2 种优点：

    const arr = ["a", "b", "c"];
    for (const elem of arr) {
      console.log(elem);
    }

如果你同时需要每一个数组元素的索引和值，结合使用新的数组方法 [entries()][array​.prototype​.entries]，for-of 也能满足你的需要。

[array​.prototype​.entries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries

    const arr = ["a", "b", "c"];
    for (const [index, value] of arr.entries()) {
      console.log(index + ", " + value);
    }

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.7 处理参数的默认值

在 ES5 中，你可以像下面这样给参数指定默认值：

    function foo(x, y) {
        x = x || 0;
        y = y || 0;
        // ...
    }

ES6 有更好的语法：

    function foo(x = 0, y = 0) {
        // ...
    }

在 ES6 中还有一个额外的好处：只有当传入 undefined 的时候，参数的默认值才会生效。而在我们前面的 ES5 代码中，任何假值都会使得参数的默认值生效。

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.8 处理命名参数

JavaScript 中的命名参数通常是通过对象字面量(object literals)来实现的，也就是所谓的选项对象模式(_options object pattern_)。比如：

    selectEntries({start:0, end: -1});

这种方式有 2 个优点：

- 代码变得更加自描述(self-descriptive)
- 可以更容易地省略任意参数

在 ES5 中，你可以像下面这样实现 selectEntries() 方法：

    function selectEntries(options) {
        var start = options.start || 0;
        var end = options.end || -1;
        var step = options.step || 1;
        // ...
    }

在 ES6 中，你可以在参数定义中使用解构，使得代码变得更加简单：

    function selectEntries({ start = 0, end = -1, step = 1 }) {
      console.log(start, end, step);
      // ...
    }

### 4.8.1 使得参数可选

在 ES5 中，为了使参数 options 可选，你需要添加下例中行 A 处的代码：

    function selectEntries(options) {
        options = options || {};  // (A) 新加的代码行
        var start = options.start || 0;
        var end = options.end || -1;
        var step = options.step || 1;
        // ...
    }

在 ES6 中，你也可以指定"{}"作为参数的默认值：

    function selectEntries({ start = 0, end = -1, step = 1 } = {}) {
      console.log(start, end, step);
      // ...
    }

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.9 从 arguments 到剩余参数(rest parameters)

在 ES5 中，如果你想一个函数（或方法）接收任意数量的实参，你必须使用一个特殊变量 _arguments_。

    function logAllArguments() {
      for (var i = 0; i < arguments.length; i++) {
        console.log(arguments[i]);
      }
    }

在 ES6 中，你可以通过"..."操作符定义一个剩余参数（下例中的 args）：

    function logAllArguments(...args) {
        for (const arg of args) {
            console.log(arg)
        }
    }

如果你仅仅对尾部的参数感兴趣的话，使用剩余参数更加便捷：

    function format(pattern, ...args) {
        // ...
    }

在 ES5 中实现上例的功能，看起来会笨拙一点：

    function format(pattern) {
        var args = [].slice.call(arguments, 1);
        // ...
    }

剩余参数使得代码更易阅读：你可以通过查看参数定义来判断函数是否具有可变数量的参数。

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.10 从 apply() 到扩展操作符(spread operator)

ES5 中，你可以通过 [apply()][function​.prototype​.apply] 方法把数组转换为参数。ES
6 中的扩展操作符也可以达到同样的目的。

[function​.prototype​.apply]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

### 4.10.1 Math.max() 方法

[Math.max()][math​.max] 方法返回数值最大的实参。它适用于任意数量的参数，但不适用于数组。

[math​.max]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max

ES5 中使用 apply()方法：

    Math.max.apply(Math, [-1, 5, 11, 3]);

ES6 中使用扩展操作符：

    Math.max(...[-1, 5, 11, 3]);

### 4.10.2 Array.prototype.push() 方法

[Array.prototype.push()][array​.prototype​.push] 方法把它的实参全部追加到目标数组中。但是没有方法可以破环性地把一个数组追加到另一个数组中。

({{ [Array​.prototype​.concat()][array​.prototype​.concat] 方法可以连接2个数组，但是它不改变现有的数组，而是返回一个全新的数组 }})

[array​.prototype​.push]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
[array​.prototype​.concat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat

ES5 中使用 apply()方法：

    var arr1 = ["a", "b"];
    var arr2 = ["c", "d"];

    // arr1 变成了 ['a', 'b', 'c', 'd']
    arr1.push.apply(arr1, arr2);

ES6 中使用扩展操作符：

    const arr1 = ["a", "b"];
    const arr2 = ["c", "d"];

    arr1.push(...arr2);

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.11 从 concat() 方法到扩展操作符

扩展操作符也可以（非破坏性地）把它的操作数的内容转换成数组元素。这意味这它可以成为数组 concat()方法的代替品。

ES5 - concat():

    var arr1 = ["a", "b"];
    var arr2 = ["c"];
    var arr3 = ["d", "e"];

    // [ 'a', 'b', 'c', 'd', 'e' ]
    console.log(arr1.concat(arr2, arr3));

ES6 - 扩展操作符：

    const arr1 = ["a", "b"];
    const arr2 = ["c"];
    const arr3 = ["d", "e"];

    // [ 'a', 'b', 'c', 'd', 'e' ]
    console.log([...arr1, ...arr2, ...arr3]);

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.12 从对象字面量中的函数表达式到方法定义(method definitions)

在 JavaScript 中，方法是值为函数的属性。

在 ES5 的对象字面量中，创建方法和创建其他属性是一样的。方法的属性值是一个函数表达式。

    var obj = {
      foo: function() {
        // ...
      },
      bar: function() {
        this.foo()
      }, // 尾部的逗号是ES5中式合法的，但是在IE中可能会报错
    }

ES6 可以通过方法定义这种特殊语法来创建方法

    const obj = {
      foo() {
        // ...
      },
      bar() {
        this.foo();
      }
    };

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.13 从构造函数(constructors)到类(classes)

ES6 的类主要为构造函数提供了更便捷的书写语法。

### 4.13.1 基类(base classes)

在 ES5 中，你可以通过构造函数直接实现：

    function Person(name) {
      this.name = name;
    }
    Person.prototype.describe = function() {
      return "Person called " + this.name;
    };

ES6 中的类为构造函数提供了更方便的语法：

    class Person {
      constructor(name) {
        this.name = name;
      }

      describe() {
        return "Person called " + this.name;
      }
    }

注意定义方法时不需要关键字 _function_，并且 class 的各个部分之间不需要逗号分隔。

### 4.13.2 派生类(derived classes)

子类化在 ES5 中比较复杂，尤其是引用父类的构造函数和父类的属性。下面是创建 Person 的子类 Employee 的常规做法：

    function Employee(name, title) {
      Person.call(this, name); // super(name)
      this.title = title;
    }
    Employee.prototype = Object.create(Person.prototype);
    Employee.prototype.constructor = Employee;
    Employee.prototype.describe = function() {
      return Person.prototype.describe.call(this) // super.describe()
        + " (" + this.title + ")"
    };

ES6 通过 extends 子句内置了对子类的原生支持：

    class Employee extends Person {
      constructor(name, title) {
        super(name);
        this.title = title;
      }
      describe() {
        return super.describe() + " (" + this.title + ")";
      }
    }

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.14 从自定义错误构造函数到 Error 子类

在 ES5 中，无法子类化异常(Error)的内置构造函数。下面的例子展示了一个变通的方法，它为构造函数 MyError 提供了重要的功能，例如堆栈跟踪：

    function MyError() {
      // Use Error as a function
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

ES6 所有的内置构造函数都可以被子类化，因此，无须像 ES5 那样麻烦地去模拟实现，ES6 可以轻易地创建自定义的 Error 类型。

    class MyError extends Error {
    }

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.15 从对象(objects) 到 Maps

构建一个对象(object)并用作从字符串到任意值的映射(map)一直是 JavaScript 中的临时解决方案。这种方案最安全的做法是创建一个原型为 null 的对象。但是你仍然要确保 key 值不能是"\_\_proto\_\_"，因为属性的这个 key 值在很多 JavaScript 引擎中都会触发特殊的功能。

下例中的 ES5 代码包含函数 countWords，它把 dict 对象当作 map 来使用：

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

你可以在 ES6 中直接使用内置的数据结构 Map 而不必对 key 转义。这里有个小缺点：在 map 中增加值不如上例方便：

    const map = new Map();
    function countWords(word) {
      const count = map.get(word) || 0;
      map.set(word, count + 1);
    }

Maps 的另一个好处是：你可以使用任意值作为 key，而不仅仅是字符串。

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"
[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.16 新的字符串方法

ES6 标准库为字符串(string)提供了几个新方法:

- 从 indexOf 到 startsWith

        if (str.indexOf('x') === 0) {} // ES5
        if (str.startsWith('x')) {}    // ES6

- 从 indexOf 到 endsWith

        function endsWith(str, suffix) { // ES5
          var index = str.indexOf(suffix);
          return index >= 0 && index === str.length - suffix.length;
        }
        str.endsWith(suffix);            // ES6

- 从 indexOf 到 includes

        if (str.indexOf('x') >= 0) {} // ES5
        if (str.includes('x')) {}     // ES6

- 从 join 到 repeat（ES5 重复字符串的方式更像是一种 hack）

        new Array(3+1).join("#"); // ES5
        '#'.repeat(3);            // ES6

({{

这里解释一下，new Array(3+1).join("#")为什么会返回"###"？如果你对 join()方法不熟悉，可以先点 [这里][array​.prototype​.join] 看下文档。

new Array(3+1)生成一个包含 4 个元素的数组，其中每个元素值都是 undefined。而 join()方法中，undefined 或 null 都会转化成空白字符串。因此，new Array(3+1).join("#")会返回"空白 1#空白 2#空白 3#空白 4"，把空白 1-4 去掉，就是我们看到的"###"了。

}})

[array​.prototype​.join]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.17 新的数组方法

ES6 中同样也提供了一些新的数组方法。

### 4.17.1 从 Array.prototype.indexOf 到 Array.prototype.findIndex

后者可以查找前者无法检测到的 NaN。

    const arr = ["a", NaN];

    arr.indexOf(NaN);                    // -1
    arr.findIndex(x => Number.isNaN(x)); //  1

另外，新的 [Number.isNaN()][number​.isnan] 方法提供了一种安全的方法来检测 NaN (因为它不会将非数值强制转换为数值)。

[number​.isnan]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN

    isNaN("abc")        // true
    Number.isNaN("abc") // false

### 4.17.2 从 Array.prototype.slice 到 Array.from 或扩展操作符(spread operator)

ES5 使用 Array.prototype.slice()方法可以把一个类数组对象转换为数组。在 ES6 中，你可以使用 Array.from()方法：

    var arr1 = Array.prototype.slice.call(arguments); // ES5
    const arr2 = Array.from(arguments);               // ES6

如果值是可迭代的（iterable, 比如，目前 DOM 数据结构中所有的类数组对象），你还可以使用扩展操作符来把它转化成数组：

    // ["a", "b", "c"]
    const arr1 = [..."abc"];
    // ["a", "b"]
    const arr2 = [...new Set().add("a").add("b")];

### 4.17.3 从 apply()到 Array.prototype.fill()

在 ES5 中，你可以使用 apply()方法作为 hack 来创建一个任意长度的数组，这个数组的元素都是 undefined。

    var arr1 = new Array(2);            // [empty x 2]
    var arr2 = Array.apply(null, arr1); // [undefined, undefined]

({{ 注意上例中的arr1和arr2两个数组的区别：arr1中并不存在任何元素（只有length和\_\_proto\_\_2个属性），而arr2中有2个元素，值都是undefined。详情可查看 [创建Array实例 - MDN文档][array#syntax] 。 }})

[array#syntax]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Syntax

在 ES6 中，fill()是一个更简单的选择。

    const arr2 = new Array(2).fill(undefined);

如果你想创建一个填充了任意值的数组，使用 fill()方法更方便：

    // ES5
    var arr3 = Array.apply(null, new Array(2))
        .map(function(x) {return 'x'});  // ['x', 'x']

    // ES6
    const arr4 = new Array(2).fill('x'); // ['x', 'x']

fill()用给定的值替换数组中的所有元素。[Holes][holes-in-arrays] 被视为数组元素（值为 undefined）。

[holes-in-arrays]: http://2ality.com/2015/09/holes-arrays-es6.html
[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.18 从 CommonJS 模块到 ES6 模块

即使在 ES5 中，基于 AMD 语法或 CommonJS 语法的模块化系统已大部分取代了手写的解决方法(如，[the revealing module pattern][revealing-module-pattern])。

[revealing-module-pattern]: http://christianheilmann.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/

ES6 内置支持模块化，然而目前还没有 JavaScript 引擎原生支持它们。不过像 browserify, webpack 和 jspm 之类的工具允许你使用 ES6 的语法来创建模块，使你能够编写面向未来的代码。

### 4.18.1 复合导出(Multiple exports)

#### 4.18.1.1 CommonJS 中的复合导出

在 CommonJS 中，你可以按如下方式导出多个实体：

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

或者，你可以将整个模块作为对象导入，并通过它访问 square 和 diag：

    // ----- main2.js -----
    var lib = require("lib")

    console.log(lib.square(11)); // 121
    console.log(lib.diag(4, 3)); // 5

#### 4.18.1.2 ES6 中的复合导出

ES6 中的复合导出称为命名导出，并按如下方式处理：

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

将模块导入为对象的语法如下所示(行 A 处)：

    // ----- main2.js -----
    import * as lib from "lib";  // (A)
    console.log(lib.square(11)); // 121
    console.log(lib.diag(4, 3)); // 5

### 4.18.2 单一导出(Single exports)

#### 4.18.2.1 CommonJS 中的单一导出

NodeJS 扩展了 CommonJS，允许你通过 module.exports 从模块中导出单个值：

    // ----- myFunc.js -----
    module.exports = function() {
      // ...
    };

    // ----- main1.js -----
    var myFunc = require("myFunc");
    myFunc();

#### 4.18.2.2 ES6 中的单一导出

在 ES6 中，同样的事情是通过 **默认导出**（通过 export default 声明）来完成的：

    // ----- myFunc.js -----
    export default function() {
      // ...
    } // 注意这里没有分号！

    // ----- main1.js -----
    import myFunc from "myFunc";
    myFunc();

[comment]: # "更多信息请参考 [avoid-iifes-in-es6]。"

## 4.19 接下来做什么

现在你已经初步了解了 ES6，你可以通过浏览后续章节继续探索它：每章都从概述开始，涵盖了一个功能或一组相关功能。最后一章集中收集了所有这些概述部分。
