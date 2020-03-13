## Introduction

### What is Ave?
Ave is a programming language tailored to boost your productivity as a developer by simplifying the syntax, getting rid of all the unnecessary hassle. Ave compiles to Javascript, preserving the useful bits and adding some new features.

### Why use Ave?
So you can write code that's clean and readable, and write it fast. 

### Playground
Curious to see what's new about Ave? Take a look at the [Ave cheatsheet](<tba>) and try them in the [online playground](<tba>) 


## Variables
Declaring variables in Ave are very similar to how you do them in Javascript. However, there are no semi-colons after each statement or expression, they are treated as invalid characters.

The keywords `let`, `var` and `const` carry their respective meanings from Javascript.

```js
let name = 'Bob' 
var son = 'Jelo'
const PI = 3.1416
```
## Control flow
Unlike the C tradition of using `{` and `}` for separating blocks, Ave uses indentation.  Ave supports the widely used control flow structures , `while`, `do-while`, and `if`/`else`. 
For checking multiple conditions, use `elif` 

#### If-else statements

``` py
if food == 'Cake'
	eat(food)
	friends.share(food)
	console.log('Yum!')
elif food == 'Juice'
	drink(food)
	console.log('slurp slurp')
else 
	console.log('Unknown Food Item.')
	
```
You may optionally add colons before blocks to make them more readable.

```py
if Math.random() > 0.1:
	console.log('lucky!')s
else:
	console.log('so-so..')
```


#### Loops
For loops in Ave always make use of `in`  expressions much like Python and Coffeescript. In the code snippet below, `[1...100]` specifies the range you want to loop within, including the exclusive of 100.
```py
for i in [1...100]:
	if i % 2 == 0 
		console.log('even')
	else 
		console.log('odd')
```

You can also iterate over arrays the same way

```py
let array = [1,2,3,4,'five']
for member in array
	console.log(member)
```

You can also use Ave's range syntax to loop over a specific range with predefined step.
`<start, end, step>` is equivalent to `i = start; i < end; i = i + step`.

```py
for i in {0,100,10}
	console.log(i) #0 10 20 30...
```

## Comparisons

### Operators
The operators used for comparisons are `and` and  `or` . You may also use `&&` or `||` if that's what you prefer.
```py
if animal == 'dog' or animal == 'cat'
	run()
elif animal == 'bird'
	fly()
```
You can check if a value exists within an array or a range using
the `in` operator.
```py
let eatables = ['bun', 'cake', 'bread', 'muffin']
console.log('cake' in eatables) #true
```
Instead of the strict equality operator `===` , you can use the keyword `is` for the same purpose.

```py
console.log('2' is 2) #false
console.log('2' == 2) #true
```

### Conditionals

The syntax for conditional statements is `valueWhenTrue` if `condition` else `valueWhenFalse`. You may omit the `else` part  and the value defaults to null when the condition is false.

```py
const weekends = ['Friday', 'Saturday', 'Sunday']
let day = 'Monday'
let mood = 'happy' if day in weekends else 'sad' #sad

# sleep if weekend, otherwise do nothing
sleep() if day in weekends 
```

## Enums
Enumerators are used to maintain a list of possible values. Enums are useful for when your variable can take one possible values out of a given set.

```c
enum Color
	RED, BLUE, GREEN,
	YELLOW, ORANGE, BLACK,
	WHITE
console.log(Color.BLACK)
```