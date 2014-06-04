# Smack

Smack is a tiny (614 bytes minified) templating plugin for [jQuery](http://jquery.com) with a surprisingly powerful syntax inspired by Knockout. It achieves smallness mostly by deferring manipulation to jQuery so it's only small if you already have jQuery as a dependency of course.


## Documentation

Smack binds values from a context object to the template by looking for `data-bind` attributes on elements. It can bind to an attribute or to the text content of the element, attributes are created if not defined in the template.

The following demonstrates loading a template and applying data bindings. Note that `element` here is modified and data bindings are applied.

```html
<a data-bind="href: blogUrl">Home</a> 
<h1 data-bind="title"></h1>
<p>
  Published <abbr data-bind="friendlyDate,title:date"></abbr>
  <span data-bind="in {category}, "></span>
  <span data-bind="!'by <strong>{author}</strong>.'"></span>.
</p>
<ul>
  <li data-bind="#tags"><a data-bind=".,href:'?tag={.}'"></a></li>
</ul>
<p data-bind="?admin"><a href="#">Edit</a></p>
<div data-bind="!content"></div>
<h3 data-bind="'Comments ({comments.length})'"></h3>
<ul>
  <li data-bind="#comments">
    <strong data-bind="author"></strong>
    <p data-bind="text"></p>
    <p data-bind="?likes.length">Liked by <em data-bind="#likes,'{.} '"></em></p>
  </li>
</ul>
```

```javascript
// Load template
var template = $("#template").html();

// Parse template to jQuery object
var element = $(template)

// Apply data-bindings
element.smack(context);
```

The examples below use the following context

```javascript
{
  blogUrl: "http://www.example.com",
  author: {
    name: "Bob Bobson"
  },
  category: "Javascript"
  title: "Hello world", 
  date: "2014-01-01", 
  friendlyDate: "Yesterday",
  tags: ["tiny", "template", "jquery"], 
  content: "<p>This is a simple <strong>smack</strong> template.</p>",
  comments: [
    {author: "Bob", text: "Great stuff!", likes: ["Cecil","Mallory"]},
    {author: "Alice", text: "Indeed!"}
  ]
}
```

### Simple binding to element content

Simple binding replaces content of the template element by the specified value, the value is first HTML escaped to prevent javascript injection attacks.

```html
<h1 data-bind="title"></h1>
````
result:
```html
<h1>Hello world</h1>
```

Values can be specified at any depth by separating members with `.` (fullstops).

```html
<p data-bind="author.name"></p>
```
result:
```
<p>Bob Bobson</p>
```

Member specifications also support fallbacks with the `|` (bar) character.

```html
<p data-bind="author.nick|name"></p>
```
result:
```html
<p>Bob Bobson</p>
```

### Raw HTML binding to element content

To bind raw HTML to element content, simply append `!` to the context path specification as follows.

```html
<div data-bind="!content"></div>
````
result:
```html
<div><p>This is a simple <strong>smack</strong> template.</p></div>
```

### Binding to element attributes

When binding to attributes, specify the attribute name before the context path specification separating the two with a `:` (colon) character.

```html
<a data-bind="href: blogUrl">Home</a>
```
results:
```html
<a href="http://example.com">Home</a>
```

### Multiple bindings

Multiple bindings can be specifed for an element by separating then with `,` (comma).
```html
<p>Published <abbr data-bind="friendlyDate,title:date"></abbr></p>
```
results:
```html
<p>Published <abbr title="2014-01-01">Yesterday</abbr></p>
```

### String interpolation

Both escaped and unescaped binding to element content, and attribute binding supports string interpolation by including a `'` (apostrophe) quoted string and using `{path}` to insert values from context.

```html
<p>
  <span data-bind="!'in <em>{category}</em>, '"></span>
  <span data-bind="'by {author.name}.'"></span>.
</p>
```
results:
```html
<p>
  <span>in <em>javascript</em></span>
  <span>by Bob Bobson</span>.
</p>
```

### Conditionals

Elements can be excluded or inluded depending on the [truthyness](http://docs.nodejitsu.com/articles/javascript-conventions/what-are-truthy-and-falsy-values) of the value specified by a context specifier. Simply add a `?` before the path specification to test the truthyness of a value.

```html
<p><a data-bind="?admin" href="#">Edit</a></p>
```
yields the following when `admin` is truthy,
```html
<p><a href="#">Edit</a></p>
```
and the following when falsy.
```html
<p></p>
```

### Collection iteration

Anything that supports enumeration such as an Array or Object can be iterated over and bound to a sub-template.

```html
<ul>
  <li data-bind="#tags"><a data-bind=".,href:'?tag={.}'"></a></li>
</ul>
```
results:
```html
<ul>
  <li><a href="?tag=tiny'">tiny</a></li>
  <li><a href="?tag=template'">template</a></li>
  <li><a href="?tag=jquery'">jquery</a></li>
</ul>
```

Naturally iteration can be nested to an arbitrary depth.

```html
<ul>
  <li data-bind="#comments">
    <strong data-bind="author"></strong>
    <p data-bind="text"></p>
    <p data-bind="?likes.length">Liked by <em data-bind="#likes,'{.} '"></em></p>
  </li>
</ul>
```
results:
```html
<ul>
  <li>
    <strong>Bob</strong>
    <p>Great stuff!</p>
    <p>Liked by <em>Cecil </em><em>Mallory </em></p>
  </li>
  <li>
    <strong>Alice</strong>
    <p>Great indeed</p>
  </li>
</ul>
```
