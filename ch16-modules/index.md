# Chapter16 模块

## 16.1 概览

JavaScript 中的模块已经存在很长时间了。但是，它们都是通过库来实现的，并没有构建到语言中。ES6 是 JavaScript 头一次拥有内置的模块。

ES6 模块存储在文件中。每个文件只有一个模块，每个模块只有一个文件。({{ 模块和文件是一一对应的。 }}) 你可以通过两种方式从模块中导出内容。这两种方式可以混合使用，但是最好单独使用它们。

### 16.1.1 多个命名导出(named exports)

命名导出的内容可以有多个：

```js
//------ lib.js ------
export const sqrt = Math.sqrt;
export function square(x) {
  return x * x;
}
export function diag(x, y) {
  return sqrt(squre(x) + square(y));
}

// ------ main.js ------
import { square, diag } from "./lib";

console.log(square(11));
console.log(diag(3, 4));
```

({{

Q：main.js 的第一行如果写成下面这样（原书的写法），用 webpack4 + bable7 转化后，运行会报错：_Module not found: Error: Can't resolve 'lib' in "..."_. 尚不能确定是否配置原因。

```js
import { square, diag } from "lib";
```

}})

你也可以导入整个模块：

```js
import * as lib from "./lib";

console.log(lib.square(11));
console.log(lib.diag(3, 4));
```

### 16.1.2 单个默认导出

默认导出只能有一个。例如，一个函数：

```js
//------ myFunc.js ------
export default function() {
  console.log("called from myFunc.js");
} // 这里没有分号！

//------ main1.js ------
import myFunc from "./myFunc";
myFunc();
// => called from myFunc.js
```

或者一个类：

```js
//------ MyClass.js ------
export default class {
  constructor() {
    console.log("print at class constructor.");
  }
} // 这里没有分号！

//------ main2.js ------
import myClass from "./myFunc";
new myClass();
// => print at class constructor.
```

注意，如果你默认导出一个（匿名声明的）函数或类，其结尾处不需要分号。

({{ 这里可能让人产生误解。事实上，无论是否匿名声明、是否默认导出，函数或类的结尾处都不需要分号。 }})

### 16.1.3 浏览器中 Scripts VS Modules

|                                     | Script         | Modules                      |
| ----------------------------------- | -------------- | ---------------------------- |
| HTML 元素                           | &lt;script&gt; | &lt;script type="module"&gt; |
| 默认模式                            | 非严格模式     | 严格模式                     |
| 顶层变量                            | global         | 模块的局部变量               |
| 顶层的 this 值                      | window         | undefined                    |
| 执行方式                            | 同步           | 异步                         |
| 支持声明性导入（import 语句）       | 否             | 是                           |
| 支持编程导入（基于 Promise 的 API） | 是             | 是                           |
| 文件扩展名                          | .js            | .js                          |

## 16.2 JavaScript 中的模块

在 ES6 之前，尽管 JavaScript 从未有过内置模块，但是社区已经融合了简单的模块方案，并在 ES5 及更早版本的库中得到支持。这种方案也被 ES6 采用：

- 每个模块都是一段代码，它一旦被加载就会执行。
- 在该代码中，可能存在一些声明（变量声明、函数声明等）。
  - 这些声明默认是模块的局部变量。
  - 你可把它们中的某些内容标记为可导出的(exports)，这样其他模块就可以导入它们。
- 一个模块可以从其他模块导入内容。通过模块说明符(module specifiers)来引用它们，可以是下列之一的字符串：
  - 相对路径：如"../model/user"，这些路径相对于导入模块的位置进行解释执行。文件扩展名.js 通常可以省略。
  - 绝对路径：如"/lib/js/helpers"，直接指向要导入模块的文件。
  - 模块名称：如"util"，模块名称引用的内容需要配置。
- 模块是单例的。即使一个模块被导入很多次，也只存在一个"实例"。

这种模块方法避免了全局变量，其中唯一全局的是模块说明符。

({{TODO:模块名称没有相应例子？}})

### 16.2.1 ES5 模块系统

即使没有明确的语言支持，ES5 模块系统也工作得很出色。其中最重要（但不兼容）的两种标准是：

- **CommonJS Modules**：该标准的主要实现是在 [Node.js](http://nodejs.org/api/modules.html) 中（Node.js 模块有些许特性超出了 CommonJS 范围）。它的特点是：
  - 紧凑的语法。
  - 为同步加载和服务端而设计。
- **Asynchronous Module Definition (AMD)**：该标准最受欢迎的实现是 [RequireJS](http://requirejs.org/)。
  - 略微复杂些的语法，使 AMD 能狗在没有 eval()（或编译步骤）的情况下工作。
  - 为异步加载和浏览器端而设计。

以上只是 ES5 模块的简单解释。如果你想要更深入的学习，可以参考 Addy Osmani 的 [Writing Modular JavaScript With AMD, CommonJS & ES Harmony](http://addyosmani.com/writing-modular-js/)。

### 16.2.2 ES6 模块

ES6 模块的目标是创建一种 CommonJS 和 AMD 用户都满意的格式：

- 与 CommonJS 类似，它具有紧凑的语法，偏向于单个导出，并支持循环依赖。
- 与 AMD 类似，它直接支持异步加载和可配置的模块加载。

内置于编程语言中的 ES6 模块超越了 CommonJS 和 AMD（细节稍后解释）：

- 语法比 CommonJS 更加紧凑。
- 结构可以静态分析（用于静态检查，优化等）。
- 它对循环依赖的支持比 CommonJS 更好。

ES6 模块标准有两部分：

- 声明语法（用于导入和导出）。
- 编程方式的加载器(loader)API：用来配置模块如何加载和有条件地加载模块。

## 16.3 ES6 模块的基础知识

这里有两种类型的导出：命名导出（一个模块可以有几个）和默认导出（一个模块只有一个）。后面将会讲到，这两种方式可以同时使用，但通常最好将它们分开。

### 16.3.1 命名导出

一个模块可以通过给声明添加 _export_ 关键字来导出多个内容。这些导出通过其名称区分，称为命名导出(named exports)。

```js
//------ lib.js ------
export const sqrt = Math.sqrt;
export function square(x) {
  return x * x;
}
export function diag(x, y) {
  return sqrt(square(x) + square(y));
}

//------ main.js ------
import { square, diag } from "lib";
console.log(square(11)); // 121
console.log(diag(4, 3)); // 5
```

还有其它指定命名导出的方法（稍后将介绍），但是我发现其中一个很方便：先只管编写你的代码（仿佛没有外部世界一样），然后再为你想要导出的内容打上 export 标签。

如果需要，你还可以导入整个模块、并通过属性表示法(property notation)来引用其命名导出。

```js
//------ main.js ------
import * as lib from "lib";
console.log(lib.square(11)); // 121
console.log(lib.diag(4, 3)); // 5
```

**CommonJS 语法中的等价代码**：有一段时间，我尝试了几种巧妙的策略，以减少 Node.js 中模块导出的冗余。现在我更喜欢以下简单但是略显冗长的风格，它让人联想到**揭示模块模式**( [revealing module pattern](http://christianheilmann.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/) )：

```js
//------ lib.js ------
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

//------ main.js ------
var square = require("lib").square;
var diag = require("lib").diag;
console.log(square(11));
console.log(diag(3, 4));
```

### 16.3.2 默认导出

只导出单个值的模块在 Node.js 社区非常受欢迎。然而它们在前端开发中也很常见，你经常会有为模型(models)和组件(components)而创建的类，一个类对应一个模块。ES6 模块可以选择默认导出，即主要导出值。默认导出特别容易导入。

以下 ES6 模块"是"一个函数：

```js
//------ myFunc.js ------
export default function() {} // no semicolon!

//------ main1.js ------
import myFunc from "myFunc";
myFunc();
```

以下模块的默认导出是一个类：

```js
//------ MyClass.js ------
export default class {} // no semicolon!

//------ main2.js ------
import MyClass from "MyClass";
const inst = new MyClass();
```

默认导出有两种写法：

1. 为声明打上（默认导出的）标签
1. 直接默认导出值

#### 16.3.2.1 默认导出方式一：为声明打标签

你可以将关键字 _export default_ 作为任意函数声明（或生成器函数声明）或类声明的前缀，以使其成为默认导出：

```js
export default function foo() {} // no semicolon!
export default class Bar {} // no semicolon!
```

这种情况下，你也可以省略名称。实际上，在目前的 JavaScript 版本中，匿名函数声明和匿名类声明只可能出现在默认导出中：

({{

Q：有的同学可能会问：我觉得上面的说法不是很严谨 —— 自调用函数(Self-invoking functions)：我不要面子的么？  
A：这里要注意区分[函数声明和函数表达式的区别](https://medium.com/@mandeep1012/function-declarations-vs-function-expressions-b43646042052)。自调用函数实际上使用的是匿名函数表达式，而非函数声明。

}})

```js
export default function() {} // no semicolon!
export default class {} // no semicolon!
```

##### 16.3.2.1.1 为什么是匿名函数声明而不是匿名函数表达式？

当你查看上例中的两行代码时，你可能期望 _export default_ 的操作数是表达式。但是它们只是**声明**，这是基于一致性考虑：操作数可以是命名声明，把它们的匿名版本解释为表达式将会让人感到困惑（甚至比引入新类型的声明更令人困惑）。

如果你想要操作数被解释为表达式，你需要使用括号：

```js
export default (function() {}); // 这里有分号
export default (class {}); // 这里有分号
```

#### 16.3.2.2 默认导出方式二：直接默认导出值

这些值通过表达式生成：

```js
export default "abc";
export default foo();
export default /^xyz$/;
export default 5 * 7;
export default { no: false, yes: true }
```

这些导出都有以下结构：

```js
export default «expression»;
```

它等价于：

```js
const __default = «expression»;
export { __default as default }; // (A)
```

行 A 的语句是一个导出子句(export clause)（将在后续章节介绍）。

##### 16.3.2.2.1 为什么有两种默认导出的方式？

引入第二种默认导出方式，是因为如果声明了多个变量，则不能有意义地把它们转化为默认导出：

```js
// 非法的JavaScript
export default const foo = 1, bar = 2, baz = 3;
```

这三个变量 foo、bar 和 baz，无法知道应该默认导出哪一个。

### 16.3.3 导入和导出必须在顶层

我们将在稍后更详细解释，ES6 模块的结构是静态(static)的，你不能有条件地导入或导出内容。这带来了多种好处。

只允许在模块顶层导入导出的这个限制，是在语法上强制执行的：

```js
if (Math.random()) {
  import "foo"; // SyntaxError
}

// 你甚至不能把导入导出嵌入到简单的代码块中
{
  import "foo"; // SyntaxError
}
```

### 16.3.4 导入提升(hoisted)

模块导入将会被提升（内置移动到当前作用域的开始处）。因此，无论你在模块中何处使用它们，以下代码都可以正常工作：

```js
foo();

import { foo } from "my_module";
```

### 16.3.5 导入是导出的只读视图

ES6 模块的导入是导出实体的只读视图。这意味着它与模块体内部声明的变量之间是 **"活"连接** ，如下面代码所示:

```js
// ------ lib.js ------
export let counter = 3;
export function incCounter() {
  counter++;
}

//------ main.js ------
import { counter, incCounter } from "./lib";

// 导入的"counter"值是"活"的。
console.log(counter); // => 3
incCounter();
console.log(counter); // => 4
```

其底层工作原理我们将在后面小节解释。

把导入作为视图有以下好处：

- 它可以支持循环依赖，即使对[非限定导入](https://stackoverflow.com/questions/34953549/what-is-the-difference-between-qualified-and-unqualified-imports-in-the-new-java)（如下一小节所述）也是如此。
- 限定和非限定导入的工作方式相同（它们都是中介(indirections)）。
- 你可以将代码拆分到多个模块中，它仍然可以工作（只要你不修改导入的内容）。

### 16.3.6 对循环依赖的支持

两个模块 A 和 B，如果 A 导入 B （可能是间接或传递的方式），并且 B 也导入 A，我们就称 A 和 B 互为[循环依赖](https://en.wikipedia.org/wiki/Circular_dependency)。如果可能，循环依赖是应当避免的，它们将导致 A 和 B 紧耦合(tightly coupled)——它们只能一起使用和演变。

那么，为什么要支持循环依赖呢？因为你有时候无法绕过它们，支持它们是一个重要的功能。（后面的小节有更多介绍）

让我们看看 CommonJS 和 ES6 如何处理循环依赖。

#### 16.3.6.1 CommonJS 中的循环依赖

以下 CommonJS 代码正确处理两个循环依赖的模块 a 和 b。

```js
//------ a.js ------
var b = require("b");
function foo() {
  b.bar();
}
exports.foo = foo;

//------ b.js ------
var a = require("a"); // (i)
function bar() {
  if (Math.random()) {
    a.foo(); // (ii)
  }
}
exports.bar = bar;
```

如果首先导入模块 a，那么在第 i 行中，模块 b 先获取 a 的导出对象(exports object)，然后再将导出内容添加到这个导出对象中。因此，b 不能在它的顶层立即访问 a.foo，但是一旦 a 的执行完成后，那个属性就存在了。如果之后调用 bar()，行 ii 的方法调用就可以正常工作了。

作为一个基本规则，请记住，对于循环依赖，你无法在模块体中直接访问导入内容。这是该现象所固有的，并不会因为 ES6 的模块而改变。

CommonJS 方案的局限性在于：

- Node.js 风格的单值导出不起作用。你在那里导出的是单个值而不是对象：

  ```js
  module.exports = function() {
    /* ... */
  };
  ```

  如果模块 a 这样做，模块 b 的变量 a 一旦完成赋值就不会再更新。它将继续引用原始导出对象。

- 你不能使用直接使用命名导出。即是说，模块 b 不能这样导入 foo：

  ```js
  var foo = require("a").foo;
  ```

  foo 只是 undefined。换句话说，你别无选择，只能通过 a.foo 引用 foo。

这些限制意味着导入导出必须了解循环依赖关系并明确支持它们。

#### 16.3.6.2 ES6 的循环依赖

ES6 模块自动支持循环依赖。即是说，它们没有上一节提到的 CommonJS 模块的两个限制：默认导出可以正常工作，像非限定命名导入一样（下例中的行 i 和 iii）。因此，你可以像下面这样实现模块的循环依赖。

```js
//------ a.js ------
import { bar } from "b"; // (i)
export function foo() {
  bar(); // (ii)
}

//------ b.js ------
import { foo } from "a"; // (iii)
export function bar() {
  if (Math.random()) {
    foo(); // (iv)
  }
}
```

这段代码可正常工作，因为，正如上节中解释的一样，导入是导出的试图。那意味着即使非限定导入（如行 ii 的 bar 和行 iv 的 foo）也是引用原始数据的中介(indirections)。因此，面对循环依赖，无论你通过非限定导入还是通过其模块访问命名导出都无关紧要：在任何一种情况下都涉及到中介(indirection)，并且它总是有效。

## 16.4 导入导出的细节

### 16.4.1 导入方式

ES6 提供以下几种导入方式：

1. 默认导入：

   ```js
   import localName from "src/my_lib";
   ```

1. 名称空间导入：将模块导入为一个对象（每个命名导出对应一个属性）。

   ```js
   import * as my_lib from "src/my_lib";
   ```

1. 命名导入：

   ```js
   import { name1, name2 } from "src/my_lib";
   ```

   你也可以为命名导出重命名：

   ```js
   // 重命名：将 name1 导入为 localName1
   import { name1 as localName1, name2 } from "src/my_lib";

   // 重命名：将"默认导出"导入为 foo
   import { default as foo } from "src/my_lib";
   ```

1. 空导入：只加载模块，不导入任何内容。程序中首次遇到这种导入将执行模块体中的代码。

   ```js
   import "src/my_lib";
   ```

   ({{

   下面是一个关于空导入的扩展例子：

   ```js
   // ------ empty-import.js ------
   const name = "ES6";
   console.log(`Hello ${name} @empty-import`);

   // ------ test-import.js ------
   import "./empty-import"; // (A)
   // 无法获取上一个模块中定义的name值
   console.log(`Can I get name(= ${name}) @test-import?`);

   // ------ main.js ------
   import "./empty-import"; // (B)
   import "./test-import";
   console.log(`How many times did 'empty-import' execute?`);

   // Output as follows:

   // Hello ES6 @empty-import
   // Can I get name(= ) @test-import?
   // How many times did 'empty-import' execute?
   ```

   我们可以看到，在代码中，"empty-import"被导入两次（行 A 和行 B），但是最后只执行了一次 —— 只输出一次"Hello ES6 @empty-import"。另外，从输出结果中，我们也可以看到，尽管 name 变量是在模块 1 的顶层定义的，但是在模块 2 中依然不能直接获取它的值，因为 name 是模块 1 的局部变量。

   }})

这里有两种方式来组合这些方式，它们出现的顺序是固定的：默认导出总是优先出现。

- 组合：默认导入 + 名称空间导入

  ```js
  import theDefault, * as my_lib from "src/my_lib";
  ```

- 组合：默认导入 + 命名导入

  ```js
  import theDefault, { name1, name2 } from "src/my_lib";
  ```

### 16.4.2 命名导出方式：内联和子句

在模块内，你可以有[两种方式](http://www.ecma-international.org/ecma-262/6.0/#sec-exports)导出命名的内容。

一种方式，你可以使用关键字 export 标记声明：

```js
export var myVar1 = ...;
export let myVar2 = ...;
export const MY_CONST = ...;

export function myFunc() {
  ...
}
export function* myGeneratorFunc() {
  ...
}
export class MyClass {
  ...
}
```

另一种方式，你可以在模块的最后列出所有你想要导出的内容（与 揭示模块模式(revealing module pattern) 类似）。

```js
const MY_CONST = ...;
function myFunc() {
  ...
}

export { MY_CONST, myFunc };
```

你也可以用不同的名称来导出内容：

```js
export { MY_CONST as FOO, myFunc };
```

### 16.4.3 再导出(Re-exporting)

再导出意味着将另一个模块的导出添加到当前模块的导出中。你可以添加其他模块的全部导出内容：

```js
export * from "src/other_module";
```

默认导出会在 _export \*_ 中被忽略。

或你可以更有选择性（可选择重命名）：

```js
export { foo, bar } from "src/other_module";

// 重命名：将"other_module"的 foo 导出为 myFoo
export { foo as myFoo, bar } from "src/other_module";
```

#### 16.4.3.1 对默认导出进行再导出

以下语句让另一个模块 foo 的默认导出成为当前模块的默认导出：

```js
export { default } from "foo";
```

以下语句让模块 foo 的命名导出 myFunc 成为当前模块的默认导出：

```js
export { myFunc as default } from "foo";
```

### 16.4.4 全部导出方式

ES6 提供以下几种方式的导出：

1. 再导出：

   - 再导出全部内容（除了默认导出）

     ```js
     export * from "src/other_module";
     ```

   - 通过子句再导出：

     ```js
     export { foo as myFoo, bar } from "src/other_module";

     export { default } from "src/other_module";
     export { default as foo } from "src/other_module";
     export { foo as default } from "src/other_module";
     ```

1. 通过子句的命名导出

   ```js
   export { MY_CONST as FOO, myFunc };
   export { foo as default };
   ```

1. 内联的命名导出

   - 变量声明：

     ```js
     export var foo;
     export let foo;
     export const foo;
     ```

   - 函数声明：

     ```js
     export function myFunc() {}
     export function* myGenFunc() {}
     ```

   - 类声明

     ```js
     export class MyClass {}
     ```

1. 默认导出

   - 函数声明（可匿名）

     ```js
     export default myFunc() {}
     export default function() {}
     ```

   - 类声明（可匿名）

     ```js
     export default class MyClass {}
     export default class {}
     ```

   - 表达式：导出值。注意末尾有分号。

     ```js
     export default foo;
     export default "Hello world!";
     export default 3 * 7;
     export default (function() {});
     ```

### 16.4.5 在一个模块中，同时具有命名导出和默认导出

以下模式在 JavaScript 中出奇地常见：库是一个单独的函数，但是附属的服务通过函数的属性来提供。比如，Jquery、Underscore.js 等。以下是将 Underscore 作为 CommonJS 模块的一个示意草图：

```js
//------ underscore.js ------
var _ = function(obj) {
  // ...
};
var each = (_.each = _.forEach = function(obj, iterator, context) {
  // ...
});
module.exports = _;

//------ main.js ------
var _ = require("underscore");
var each = _.each;
// ...
```

在 ES6 角度上看，函数 \_ 是默认导出，而 each 和 forEach 是命名导出。事实证明，你实际上可以同时使用命名导出和默认导出。例如，之前的 CommonJS 模块，重写为 ES6 模块之后，如下所示：

```js
//------ underscore.js ------
export default function(obj) {
  // ...
}
export function each(obj, iterator, context) {
  // ...
}
export { each as forEach };

// ------ main.js ------
import _, { each } from "underscore";
// ...
```

注意 CommonJS 版和 ES6 版只是大致相似。后者是扁平结构，而前者是嵌套结构。

#### 16.4.5.1 建议：避免混合默认导出和命名导出

我一般建议将这两种导出方式分开使用：每个模块，只使用默认导出或只使用命名导出。

然而，这并非一个非常强烈的建议：有时混和这两种方式也是合理的。例如，一个模块默认导出一个实体(entity)。对于单元测试，还可以通过命名导出使一些内部东西可用。

#### 16.4.5.2 默认导出仅仅是另一个命名导出

默认导出实际上也是一个命名导出，只是具有特殊的名称 default。即是说，下面两个语句是等价的：

```js
import { default as foo } from "lib";
import foo from "lib";
```

类似的，以下两个模块具有相同的默认导出：

```js
//------ module1.js ------
export default function foo() {} // 函数声明！

// ------ module2.js ------
function foo() {}
export { foo as default };
```

#### 16.4.5.3 保留字 default: 作为导出名称是 OK 的，但是不能作为变量名称

你不能使用保留字(reserved words)（如 default 和 new）作为变量名称，但是你可以把它们作为导出的名称（ES5 中，你也可以使用它们作为属性名称）。如果你想要直接导入这种命名导出，你必须把它们重命名为正确的变量名称。

这意味着 default 只能出现在重命名导入的左侧：

```js
import { default as foo } from "some_module";
```

并且它也只能出现重命名导出的右侧：

```js
export { foo as default };
```

在再导出中，_as_ 的两侧都是导出名称：

```js
export { myFunc as default } from "foo";
export { default as otherFunc } from "foo";

// 以下两个语句是等价的
export { default } from "foo";
export { default as default } from "foo";
```

## 16.5 ES6 模块加载器 API

除了使用模块的声明性语法之外，还有一个编程 API。它允许你：

- 以编程方式使用模块
- 配置模块加载

---

**_[INFO]_** - **模块加载器 API 不属于 ES6 标准**

它将在一个单独文档中指定，即"JavaScript Loader Standard"，它将比语言规范更加动态地进化。[该文档的知识库][whatwg.loader]指出：

[whatwg.loader]: https://github.com/whatwg/loader/

[The JavaScript Loader Standard]将 ECMAScript 模块加载语义化的工作与 Web 浏览器以及 Node.js 整合在一起。

**_[WARN]_** - 模块加载器 API 尚在进行中

正如在[知识库][whatwg.loader]中提到，模块加载器 API 尚在进行中。你在其中读到的内容都是实验性的。想要知道 API 看起来如何，你可以在 GitHub 上查看[ES6 Module Loader Polyfill](https://github.com/ModuleLoader/es6-module-loader)。

---

### 16.5.1 加载器

加载器处理模块说明符（在 import-from 末尾的字符串 ID）解析、模块加载等。它们的构造函数是 Reflect.Loader。每个平台在全局变量 System（system loader）保持一个默认实例，它实现了特定的模块加载方式。

### 16.5.2 加载器方法：导入模块

你可以通过基于 [Promises](http://exploringjs.com/es6/ch_promises.html#ch_promises) 的 API，以编程方式导入模块：

```js
System.import("some_module")
  .then(some_module => {
    // 使用some_module
  })
  .catch(error => {
    // ...
  });
```

System.import()使你能够：

- 使用&lt;script&gt;元素中的模块（不支持模块语法，详细参照[modules VS script](http://exploringjs.com/es6/ch_modules.html#sec_modules-vs-scripts)章节）。
- 有条件地加载模块。

System.import()只能获得单个模块，你可以使用 Promise.all()来导入多个模块：

```js
Promise.all(["module1", "module2", "module3"])
  .map(x => System.import(x))
  .then(([module1, module2, module3]) => {
    // 使用module1, module2, module3
  });
```

### 16.5.3 更多加载器方法

加载器有更多方法。以下是三种比较重要的：

1. System.module(source, options?)

   将 source 中的 JavaScript 代码求值(evaluate)为模块（通过 Promise 异步传送）

1. System.set(name, module)

   用于注册(registering)模块（如，一个你通过 System.module()创建的模块）

1. System.define(name, source, options?)

   对 source 中的模块代码求值，并将其结果注册。

### 16.5.4 配置模块加载

模块加载器 API 具有各种钩子(hooks)，用于配置加载过程。使用场景包括：

1. 导入时[检查(lint)](<https://en.wikipedia.org/wiki/Lint_(software)>)模块(如，通过 JSLint 或 JSHint)。
1. 导入时自动转译模块（它们可以包含 CoffeeScript 或 TypeScript 代码）。
1. 使用遗留模块（AMD，Node.js）。

可配置模块加载在 Node.js 和 CommonJS 中是受到限制的。

## 16.6 在浏览器中使用模块

让我们看看如何在浏览器中支持 ES6 模块。

---

**_[WARN]_** --- **在浏览器中，支持 ES6 模块的工作还在进行中**

与模块加载类似，浏览器中对模块其他方面的支持也仍在进行中。你在这里读到的一切都可能发生改变。

---

### 16.6.1 浏览器：异步模块 VS 同步模块

在浏览器中，有两种不同类型的实体(entities)：脚本(scripts)和模块(modules)。它们有略微不同的语法，工作方式也不一样。

下面是这两者不同点的概览，详情稍后解释：

|                                       | Scripts        | Modules                      |
| ------------------------------------- | -------------- | ---------------------------- |
| HTML 元素                             | &lt;script&gt; | &lt;script type="module"&gt; |
| 默认模式                              | 非严格         | 严格                         |
| 顶层变量是                            | global         | 模块的局部变量               |
| 顶层 this 值                          | window         | undefined                    |
| 执行方式                              | 同步           | 异步                         |
| 声明性导入（import 语句）             | 不支持         | 支持                         |
| 编程方式的导入（基于 Promise 的 API） | 支持           | 支持                         |
| 文件扩展名                            | .js            | .js                          |

#### 16.6.1.1 脚本

脚本是浏览器嵌入 JavaScript 代码和引用外部 JavaScript 文件最传统的方式。脚本具有[互联网媒体类型](https://en.wikipedia.org/wiki/Media_type)，用作：

- 通过 Web 服务器传送 JavaScript 文件的内容类型(content type)。
- &lt;script&gt;元素的 type 属性值。注意，对于 HTML5，如果它们包含或者引用 JavaScript，建议在&lt;script&gt;元素中省略 type 属性。

以下是最重要的值：

- text/javascript: 这是一个遗留的值，如果你在 script 标签中省略 type 属性，它将用作默认值。对于 IE8 及更早版本的浏览器来说，这是一个[最安全的选择](http://stackoverflow.com/questions/359895/what-are-the-most-likely-causes-of-javascript-errors-in-ie8/703590#703590)。
- application/javascript: [推荐](http://tools.ietf.org/html/rfc4329#section-7)在现代浏览器中使用它。

脚本通常同步加载或执行。JavaScript 线程将停止，直到代码加载或执行完成。

#### 16.6.1.2 模块

为了与 JavaScript 通常的运行至完成(run-to-completion)语义保持一致，模块体必须不间断执行。这为导入模块留下了两种选择：

1. 当主体被执行时，同步加载模块。这就是 Nodejs 的做法。
1. 在主体被执行前，异步加载所有的模块。这是处理 AMD 模块的方式。对浏览器来说，这是最佳选项，因为模块是通过互联网加载的，并且执行时不必暂停加载。此外，还有一个的好处，这种方法允许你并行加载多个模块。

ES6 为你提供了一个两全其美的方案：Nodejs 的同步语法 + AMD 的异步加载。为了实现这点，ES6 模块在语法上不如 Nodejs 模块灵活：导入导出只能在顶层出现。这意味着它们不能进行条件化处理。这种限制允许 ES6 模块加载器静态分析一个模块导入了哪些模块，并在执行这个模块的主体之前加载这些导入项。

脚本的同步性使它无法成为模块。脚本甚至无法以声明方式导入模块（如果你想这样做，你必须使用编程方式的模块加载器 API）。

在浏览器中，你可以通过使用一种新的完全异步的&lt;script&gt;元素，来使用模块：

```html
<script type="module">
  import $ from "lib/jquery";
  var x = 123;

  // 当前作用域不是global
  console.log("$" in window); // false
  console.log("x" in window); // false

  // this是undefined
  console.log(this === undefined); // true
</script>
```

你可以看到，该元素具有自己的作用域，而且其中的变量是该作用域下的局部变量。注意，模块代码隐式处于严格模式。这是个好消息 —— 不用再写"use strict"了。

和普通&lt;script&gt;元素类似，&lt;script type="module"&gt;也可以用来加载外部模块。例如，以下标签通过 main 模块开始了一个 web 应用（属性名 import 是我的发明，尚不清楚将使用什么名称）。

```html
<script type="module" import="impl/main"></script>
```

通过自定义的&lt;script&gt;类型，在 HTML 中支持模块的优点是，很容易通过 polyfill（一个库）为旧 JS 引擎提供支持。最终可能存在（也可能不存在）模块的专用元素（如&lt;module&gt;）。

#### 16.6.1.3 模块还是脚本 —— context 问题

一个文件是模块还是脚本只取决于它如何被导入或加载。大多数模块都有导入或导出，因此可以较容易识别。但是如果一个模块这两者都没有，那么它与脚本就无法区分了。例如：

```js
var x = 123;
```

这段代码根据其被解释为模块还是脚本，语义是不同的：

- 作为模块，变量 x 在模块作用域中创建。
- 作为脚本，变量 x 变成全局变量，并成为 global 对象的一个属性（浏览器中是 window 对象）。

更实际的例子是安装某些内容的模块，如全局变量中的 polyfill 或全局事件监听器。这种模块既不导入也不导出任何内容，并通过一个空导入来启用。

```js
import "./my_module";
```

---

**_[MATE]_** - **本节的资源**

- [“Modules: Status Update”](https://github.com/rwaldron/tc39-notes/blob/master/es6/2013-09/modules.pdf), slides by David Herman. ({{ 404 }})
- [“Modules vs Scripts”](https://mail.mozilla.org/pipermail/es-discuss/2013-November/034869.html), an email by David Herman.

---

## 16.7 细节：导入作为导出的视图

---

**_[GIT]_** - 本节的代码可以[在 GitHub 上获取](https://github.com/rauschma/imports-are-views-demo)。

---

在 CommonJS 和 ES6 中，导入的工作方式不同：

- 在 CommonJS 中，导入是导出值的副本。
- 在 ES6 中，导入是导出值的“活”的只读视图。

以下小节将对此进行解释。

### 16.7.1 在 CommonJS 中，导入是导出值的副本

CommonJS（Nodejs）模块以我们相对熟悉的方式工作。

如果你导入一个值到一个变量中，这个值将被拷贝两次：一次是它被导出时（行 A），一次是它被导入时（行 B）。

```js
//------ lib.js ------
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter, // (A)
  incCounter: incCounter
};

//------ main1.js ------
var counter = require("./lib").counter; // (B)
var incCounter = require("./lib").incCounter;

// 导入的值是副本的（断开连接的）副本
console.log(counter); // => 3
incCounter();
console.log(counter); // => 3

// 导入的值是可以改变的
counter++;
console.log(counter); // => 4
```

如果你通过导出对象来访问值，它仍然在导出时经过了一次拷贝：

```js
//------ main2.js ------
var lib = require("./lib");

// 导入值是一个（断开连接的）副本
console.log(lib.counter); // => 3
lib.incCounter();
console.log(lib.counter); // => 3

// 导入的值是可以改变的
lib.counter++;
console.log(lib.counter); // => 4
```

### 16.7.2 在 ES6 中，导入是导出值的“活”的只读视图

与 CommonJS 相比，在 ES6 中，导入是导出值的视图。换句话说，每个导入是导出数据的实时连接(live connection)。导入是只读的：

- 非限定导入(unqualified imports)（import x from "foo"）类似于 _const_ 定义的常量。
- 模块对象 foo （import \* as foo from "foo"）的属性类似于[被冻结对象](http://speakingjs.com/es5/ch17.html#freezing_objects)的属性。

以下代码展示了导入如何像视图一样工作：

```js
//------ lib.js ------
export let counter = 3;
export function incCounter() {
  counter++;
}

//------ main1.js ------
import { counter, incCounter } from "./lib";

// 导入的counter值是实时的
console.log(counter); // => 3
incCounter();
console.log(counter); // => 4

// 导入值不能被修改
counter++; // TypeError
```

如果你通过星号（\*）来导入模块，你将得到同样的结果：

```js
//------ main2.js ------
import * as lib from "./lib";

// 导入的counter值是实时的
console.log(lib.counter); // => 3
lib.incCounter();
console.log(lib.counter); // => 4

// 导入的值无能被修改
lib.counter++; // TypeError
```

注意，虽然你不能修改导入值，但是你可以修改它们引用的对象。例如：

```js
//------ lib.js ------
export let obj = {};

//------ main.js ------
import { obj } from "./lib";

obj.prop = 123; // OK
obj = {}; // TypeError
```

#### 16.7.2.1 为什么需要一种新的导入方案？

为什么要引入这样一种相对复杂且偏离既定做法的导入机制呢？

- 循环依赖：主要优点是即使对于非限定导入，它也支持循环依赖。
- 限定和非限定导出的工作方式相同。在 CommonJS 中，它们是不同的：限定导出可直接访问模块的导出对象的属性，而非限定导入是它的一个副本。
- 你可以将代码拆分到多个模块中，它仍然可以继续工作（只要你不尝试变更导入的值）。
- 另一方面，模块折叠(module folding)，将多个模块组合成单个模块也变得更加简单。

根据我的经验，ES6 导入只要工作就行，你很少需要考虑底层发生了什么。

### 16.7.3 实现视图

作为导出的视图，导入在底层是如何工作的呢？导出是通过数据结构 _导出条目(export entry)_ 来管理的。所有的导出条目（除了再导出的那些）具有以下两个名称：

- 本地名称(local name)：导出内容存储在模块内部的名称。
- 导出名称(export name)：导入模块需要用来访问导出内容的名称。

在你导入一个实体之后，该实体往往通过一个指针来访问，该指针具有两个组件：模块(module)和本地名称(local name)。换句话说，该指针引用模块内的一个 _绑定(binding)_（变量的储存空间）。

让我们查看一下不同类型导出中的导出名称和本地名称。下表（[改编自 ES6 规范](http://www.ecma-international.org/ecma-262/6.0/#table-42)）给出了一个概览，后续小节有更多细节。

| Statement                      | Local name    | Export name |
| ------------------------------ | ------------- | ----------- |
| export {v}                     | "v"           | "v"         |
| export {v as x}                | "v"           | "x"         |
| export const v = 123;          | "v"           | "v"         |
| export function f() {}         | "f"           | "f"         |
| export default function f() {} | "f"           | "default"   |
| export default function () {}  | "\*default\*" | "default"   |
| export default 123             | "\*default\*" | "default"   |

#### 16.7.3.1 导出子句

```js
function foo() {}
export { foo };
```

- 本地名称: foo
- 导出名称: foo

```js
function foo() {}
export { foo as bar };
```

- 本地名称: foo
- 导出名称: bar

#### 16.7.3.2 内联导出(inline exports)

下面是一个内联导出：

```js
export function foo() {}
```

它与以下代码等价：

```js
function foo() {}
export { foo };
```

因此，它的名称如下：

- 本地名称: foo
- 导出名称: foo

#### 16.7.3.3 默认导出

这里有两种默认导出：

- 可提升的声明(hoistable declarations)（函数声明，生成器函数声明）和类声明的默认导出类似于普通的内联导出，因为创建并标记了命名的本地实体。
- 所有的其他默认导出都是关于导出表达式的结果。

##### 16.7.3.3.1 默认导出表达式

以下代码默认导出表达式 123 的结果：

```js
export default 123;
```

它等价于：

```js
const *default* = 123; // 不是合法的JS代码
export { *default* as default };
```

如果你默认导出一个表达式，你会得到：

- 本地名称: \*default\*
- 导出名称: default

这里选定了本地名称，以便它不会与任何其他本地名称冲突。

注意默认导出仍然会创建一个绑定。但是，由于\*default\*并非合法的标识符，你无法从模块内访问该绑定。

##### 16.7.3.3.2 默认导出可提升声明和类声明

以下代码默认导出一个函数声明：

```js
export default function foo() {}
```

它等价于：

```js
function foo() {}
export { foo as default };
```

其名称是：

- 本地名称: foo
- 导出名称: default

这说明你可以通过在模块内为 foo 赋一个不同的值，来改变默认导出的值。

（仅仅）对于默认导出，你可以省略函数声明的名称：

```js
export default function() {}
```

它等价于：

```js
function *default*() {} // 不是合法JS代码
export { *default* as default };
```

其名称是：

- 本地名称: \*default\*
- 导出名称: default

默认导出生成器函数声明和类声明的工作方式类似于默认导出函数声明。

### 16.7.4 在规范中作为视图来导入

本节提供了 ES6 语言规范的相关链接。

管理导入：

- [CreateImportBinding()](http://www.ecma-international.org/ecma-262/6.0/#sec-createimportbinding) 创建导入的本地绑定。
- [GetBindingValue()](http://www.ecma-international.org/ecma-262/6.0/#sec-module-environment-records-getbindingvalue-n-s) 用来访问它们。
- [ModuleDeclarationInstantiation()](http://www.ecma-international.org/ecma-262/6.0/#sec-moduledeclarationinstantiation) 设置模块的环境（对比：[FunctionDeclarationInstantiation()](http://www.ecma-international.org/ecma-262/6.0/#sec-functiondeclarationinstantiation), [BlockDeclarationInstantiation()](http://www.ecma-international.org/ecma-262/6.0/#sec-blockdeclarationinstantiation)）。

通过各种类型的导出创建的导出名称和本地名称展示在《[Source Text Module Records](http://www.ecma-international.org/ecma-262/6.0/#sec-source-text-module-records)》节的 [table 42](http://www.ecma-international.org/ecma-262/6.0/#table-42) 中。《[Static Semantics: ExportEntries](http://www.ecma-international.org/ecma-262/6.0/#sec-exports-static-semantics-exportentries)》还有更多细节。你可以看到导出条目会被静态设置（在对模块求值前），对导出语句求值在《[Runtime Semantics: Evaluation](http://www.ecma-international.org/ecma-262/6.0/#sec-exports-runtime-semantics-evaluation)》中描述。

## 16.8 ES6 模块的设计目标

如果你想要理解 ES6 模块，有助于理解哪些目标影响了他们的设计。主要是：

- 偏爱默认导出
- 静态模块结构
- 同时支持同步和异步加载
- 支持模块间的循环依赖

以下小节将解释这些目标。

### 16.8.1 偏爱默认导出

模块语法表明默认导出“是”模块看起来有点奇怪，但是如果你考虑到一个主要设计目标是让默认导出尽可能方便，那么这是有意义的。引用 [David Herman](http://esdiscuss.org/topic/moduleimport#content-0) ：

> ES6 偏爱单个/默认导出样式，并给出了最甜蜜的语法来导入默认值。导入命名导出可以（甚至应该）更加简洁些。

### 16.8.2 静态模块结构

当前 JavaScript 模块格式具有动态结构：导入和导出的内容可以在运行时修改。ES6 引入它自己的模块格式的一个原因是启用静态结构，这有几个好处。但在深入这些之前，让我们先看下静态结构意味着什么。

它意味着你可以在编译时（静态）确定导入和导出 —— 你只需要查看源代码，无须执行它。ES6 以语法形式强制这一点：你只能在顶层导入和导出（不能嵌入到条件语句中）。并且导入和导出语句没有动态部分（不允许变量等）。

以下两个 CommonJS 模块的例子不具有静态结构。在第一个例子中，你必须运行代码来找出它导入了什么：

```js
var my_lib;
if (Math.random()) {
  my_lib = require("foo");
} else {
  my_lib = require("bar");
}
```

在第二个例子中，你必须运行代码来找出它导出了什么：

```js
if (Math.random()) {
  exports.baz = ...
}
```

ES6 模块灵活性稍差，并强制你保持静态。因此，你可以得到一些好处，下面将对此进行介绍。

#### 16.8.2.1 优点：打包时消除死代码

在前端开发中，模块通常按照如下方式处理：

- 开发阶段，存在很多（通常很小）的模块。
- 部署阶段，将这些模块打包(bundle)成一些相对较大的文件。

打包的原因是：

1. 加载全部模块只需获取更少的文件。
1. 压缩打包后的文件比压缩分开的文件稍微高效一些。
1. 打包阶段，可以移除无用的导出，可能会节省大量的空间。

原因#1 对 HTTP/1 来说很重要，其中请求一个文件的花费相对较高。这点将随 HTTP/2 而改变，这也是为什么这个原因无关紧要的原因。

原因#3 仍然值得注意。它只能在具有静态结构的模块格式中实现。

#### 16.8.2.2 优点：简洁打包, 没有自定义的打包格式

模块打包器 [Rollup](https://github.com/rollup/rollup) 证明了 ES6 模块可以高效组合，因为它们都适合单个作用域（在重命名变量以消除名称冲突之后）。由于以下两个 ES6 模块的特性，这是有可能的：

- 它们的静态结构意味着打包格式无须考虑条件化加载模块（常用的实现技术是将模块代码放到函数中）。
- 导入作为导出的只读视图意味着你不必拷贝导出，可以直接引用它们。

举个例子，考虑以下两个 ES6 模块：

```js
// lib.js
export function foo() {}
export function bar() {}

// main.js
import { foo } from "./lib.js";
console.log(foo);
```

Rollup 能够将这两个 ES6 模块绑定到以下单个 ES6 模块中（请注意已消除的无用导出 bar）：

```js
function foo() {}
console.log(foo());
```

Rollup 方案的另一个好处是打包没有自定义的格式，它只是一个 ES6 模块。

#### 16.8.2.3 优点：更快查找导入

在 CommonJS 中，如果你请求(require)一个库，将返回一个对象：

```js
var lib = require("lib");
lib.someFunc(); // 查找属性
```

因此，通过 lib.someFunc 访问命名导出意味着你必须做属性查找，而这比较慢，因为它是动态的。

与之相比，如果你导入一个 ES6 的库，你可以静态知道它的内容，并能对访问进行优化：

```js
import * as lib from "lib";
lib.someFunc(); // 静态解决
```

#### 16.8.2.4 优点：变量检查

在静态模块结构中，你通常可以静态知道在模块的任意地方哪些变量可用：

- 全局变量：唯一的全局变量来自语言本身。其他一切都来自模块（包括标准库和浏览器的功能）。也就是说，你可以静态地知道所有全局变量。
- 模块导入：你也可以静态地知道这些。
- 模块局部变量：可以通过静态检查模块来确定。

这有助于检查给定标识符是否拼写正确。这种检查是检查器（如 JSLint 和 JSHint）的流行特征。在 ES6 中，其中大部分可以由 JS 引擎执行。

另外，任何命名导入的访问（如 lib.foo）也可以进行静态检查。

#### 16.8.2.5 优点：为宏(macros)做好准备

宏仍在 JavaScript 未来的路线图(roadmap)中。如果一个 JavaScript 引擎支持宏，你可以通过库添加新的语法。[Sweet.js](http://sweetjs.org/)是一个实验性的 JS 宏系统。以下是一个来自 Sweet.js 站点的例子：类的宏。

```js
// 定义宏
macro class {
  rule {
    $className {
      constructor $cparams $cbody
      $($mname $mparams $mbody) ...
    }
  } => {
    function $className $cparams $cbody
    $($className.prototype.$mname
      = function $mname $mparams $mbody; ) ...
  }
}

// 使用宏
class Person {
  constructor(name) {
    this.name = name;
  }
  say(msg) {
    console.log(this.name + " says: " + msg);
  }
}
var bob = new Person("Bob");
bob.say("Macros are sweet!");
```

对于宏来说，JS 引擎在编译之前要执行一个预处理步骤：如果解析器生成的 token 流中的 tokens 序列与宏的模式部分匹配，它将被通过宏的主体部分生成的 tokens 替换。预处理步骤只在你能够静态找到宏定义的情况下工作。因此，如果你想通过模块导入宏，它们就必须具有静态结构。

#### 16.8.2.6 优点：为类型(types)做好准备

静态类型检查强加类似于宏的约束：只有在静态找到类型定义时，它才能执行。同样，只有具有静态结构的类型，才能从模块中导入。

类型很有吸引力，因为它们支持静态类型的 JS 快速方言(dialects)，其中可以编写性能关键的代码。一种这样的方言是低级 JavaScript([Low-Level JavaScript](http://lljs.org/), LLJS)。

#### 16.8.2.7 优点：支持其他语言

如果你想支持使用宏和静态类型的编译语言到 JavaScript 中，那么 JS 模块应该具有静态结构，原因在前两节中已提到。

#### 16.8.2.7 本节的资源

- “[Static module resolution](http://calculist.org/blog/2012/06/29/static-module-resolution/)” by David Herman

### 16.8.3 同时支持同步和异步加载

ES6 模块必须独立于引擎同步（如服务器）或异步（如浏览器）加载模块。它的语法很适合同步加载，它的静态结构支持异步加载：因为你可以静态确定所有导入，你可以在评估(evaluate)模块体前加载它们（让人想起 AMD 模块的方式）。

### 16.8.4 支持模块间的循环依赖

支持循环依赖是 ES6 模块的关键目标。原因如下：

循环依赖本身并不邪恶。尤其对于对象来说，你有时甚至想要这种依赖关系。例如，在一些树形结构（如 DOM 文档）中，父节点引用子节点，而子节点又引用回父节点。在库中，你通常能够通过小心设计避免循环引用。但是，在大型系统中，它们可能会发生，尤其在重构期间。那么，如果模块系统支持它们将会非常有用，因为当你重构时，系统不会中断。

[Nodejs 文档确认了循环依赖的重要性](http://nodejs.org/api/modules.html#modules_cycles)，且 [Rob Sayre 提供了更多的证据](https://mail.mozilla.org/pipermail/es-discuss/2014-July/038250.html)。

> 数据点：我有次在 FireFox 中实现一个类似【ES6 模块】的系统。发货后第三周我被要求支持循环依赖。
>
> 由 Alex Fritze 发明和我工作的那个系统并不完美，语法也不是很漂亮。但是它七年后仍在使用，所以它必定得到了正确的结果。

## 16.9 FAQ：模块

### 16.9.1 我能否使用一个变量来指定我想从哪个模块导入？

import 语句是完全静态的：它的模块指定符通常是固定的。如果你想动态确定加载哪个模块，你需要使用[编程方式的加载器 API](http://exploringjs.com/es6/ch_modules.html#sec_module-loader-api)：

```js
const moduleSpecifier = "module_" + Math.random();
System.import(moduleSpecifier).then(the_module => {
  // 使用the_module
});
```

### 16.9.2 我可以按条件或按需导入一个模块么？

导入语句必须始终位于模块的顶层。那意味着你不能将它们嵌入到 if 语句，函数等内部。因此，如果你想按条件或按需加载模块，你必须使用编程方式的加载器 API：

```js
if (Math.random()) {
  System.import("some_module").then(some_module => {
    // 使用some_module
  });
}
```

### 16.9.3 我可以在导入语句中使用变量吗？

不能。请记住 - 导入内容必须**不得**依赖在运行时计算的任何内容。因此：

```js
// 非法语法
import foo from "some_module" + SUFFIX;
```

### 16.9.4 我可以在导入语句中使用解构(destructuring)吗？

不能。导入语句只是看起来像解构，但它们完全不同（静态的，导入是视图等）。

因此，你不能在 ES6 中这样做：

```js
// 非法语法：
import { foo: { bar } } from "some_module";
```

### 16.9.5 命名导出是必要的吗？为什么不默认导出对象呢？

你可能想知道 —— 如果我们可以简单地默认导出对象（像 CommonJS 那样），为什么还需要命名导出？答案是你无法通过对象来强制执行静态结构，并将失去所有的[相关优点](http://exploringjs.com/es6/ch_modules.html#static-module-structure)。

### 16.9.6 我能够 eval()模块的代码么？

不能。模块对于构建 eval()来说太高级了。模块加载器 API 提供了从字符串创建模块的方法。

语法上看，eval()接受脚本（它不允许 import 和 export），并非模块。

## 16.10 ES6 模块的优势

乍一看，将模块内置到 ES6 中可能是一个无聊的特性 —— 毕竟，我们已经拥有了几个很好的模块系统。但是，ES6 模块有几个新特性：

- 更简洁的语法
- 静态模块结构（有助于死代码检测，优化，静态检查等）
- 自动支持循环依赖

ES6 也 —— 有望 —— 终结当前主流标准 CommonJS 和 AMD 之间的分歧。拥有单一且原生的模块标准意味着：

- 不再有 UMD（[Universal Module Definition](https://github.com/umdjs/umd)）：UMD 是一个模式的名称，它使同一个文件可以用于多个模块系统（如，CommonJS 和 AMD）。一旦 ES6 成为唯一的模块标准，UMD 就变得过时了。
- 新的浏览器 APIs 变成模块，而不是全局变量或 navigator 的属性。
- 不再使用对象作为名称空间(objects-as-namespace)：像 Math 和 JSON 之类的对象在 ES5 中充当函数的名称空间。将来，这种功能可以通过模块来提供。

## 16.11 更多阅读

- **CommonJS versus ES6**: “[JavaScript Modules](http://jsmodules.io/)” (by [Yehuda Katz](https://github.com/wycats/jsmodules)) is a quick intro to ECMAScript 6 modules. Especially interesting is a [second page](http://jsmodules.io/cjs.html) where CommonJS modules are shown side by side with their ECMAScript 6 versions.
