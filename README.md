```
  8 888888888o.   8 8888888888   b.             8     ,o888888o.
  8 8888    `88.  8 8888         888o.          8  . 8888     `88.
  8 8888     `88  8 8888         Y88888o.       8 ,8 8888       `8b
  8 8888     ,88  8 8888         .`Y888888o.    8 88 8888        `8b
  8 8888.   ,88'  8 888888888888 8o. `Y888888o. 8 88 8888         88
  8 888888888P'   8 8888         8`Y8o. `Y88888o8 88 8888         88
  8 8888`8b       8 8888         8   `Y8o. `Y8888 88 8888        ,8P
  8 8888 `8b.     8 8888         8      `Y8o. `Y8 `8 8888       ,8P
  8 8888   `8b.   8 8888         8         `Y8o.`  ` 8888     ,88'
  8 8888     `88. 8 888888888888 8            `Yo     `8888888P'

=======================================================================
        The Biggest Little Static Site Generator in the World!
=======================================================================
```

Ever wanted to write blog posts in JavaScript? Probably not. *Buuuuuuuut*...
if you said "**YES**", then welcome to Reno!

Reno is a tiny library (~10 functions) for generating static websites. It's a
little difficult to explain the API without an example first.

```javascript
// src/index.js
import { html, writePage } from "@rasch/reno"

import { data } from "./components/data.js"
import { head } from "./components/head.js"
import { body } from "./components/body.js"

const site = html`<!doctype html>
<html>
  ${head(data)}
  ${body(data)}
</html>
`

writePage({ path: "/", content: site, template: null })
.catch(e => console.error(e))
```

Then generate the HTML with `node`.

```sh
node src/index.js
```

In this case the build would fail because we haven't built the `data`, `head`
and `body` components. Imagine they do exist though. The file would be written
to `dist/index.html`. Reno only reads from a couple of paths in the `src`
directory and writes the output to `dist`. All pages and posts are written to
an `index.html` file in their path directory (which is based on the src file
path or the `path` property if given) for clean URLs.

## API

### Tagged Template Fns

There are four functions for writing template fragments or even complete blog
posts, `html`, `css`, `md` and `markdown`.

The `css` and `html` functions are just identity functions that don't actually
modify the input. They are used primarily for syntax highlighting in text
editors where supported.

```javascript
import { html, css } from "@rasch/reno"

const img = (src, alt) => html`<img src="${src}" alt="${alt}" />`
const imgCSS = () => css`img { display: block; max-width: 100%; }`
```

The `md` and `markdown` functions parse markdown and return an HTML string.
[Marked](https://marked.js.org/) is used by Reno to parse the markdown. The
output HTML includes id tags on the headings. Task list items are also
supported by adding classes to list items, `tast-list-item` and `checked`.

```javascript
import { md } from "@rasch/reno"

const post = md`
# Hello world

Some **markdown**!

- [x] write docs
- [x] publish on npm
- [ ] create blog example
`
```

### The "Post" Object

To get started with a blog, create a directory containing posts in the `src`
directory. It should be named using the desired URL fragment of the blog's home
page. For example, `src/blog` for the blog to live at
`https://example.com/blog/`. The posts are written in JavaScript and should
export an object named `post` containing a `content` key. If a post is
saved to a file at the path `src/blog/my-awesome-post.js`, the output HTML
would be written to `dist/blog/my-awesome-post/index.html` An array of Post
objects is created by Reno when using the `postArray` function.

```txt
{
  _md5: string | undefined,
  _sha256: string | undefined,
  _sha512: string | undefined,
  _id: string | undefined,
  _file: string,
  _path: string,
  _stat: {
    size: number,
    atimeMs: number,
    mtimeMs: number,
    ctimeMs: number,
    birthtimeMs: number,
  }
}
```

All of the keys that begin with an underscore are generated based on the content
and file path.

- **_md5**: a string containing the MD5 hash sum of the post `content`. This
  property is not defined if `content` is `undefined`.
- **_sha256**: same as `_md5` except it uses the SHA-256 hash sum.
- **_sha512**: same as `_md5` except it uses the SHA-512 hash sum.
- **_id**: a string containing the SHA-256 hash sum of the concatenation of the
  posts file path plus the posts `content`. This is useful for building RSS
  feeds or similar things that require unique identifiers.
- **_file**: a string containing the original full path to the source post.
- **_path**: a string containing the path that the post's `index.html` will be
  written. `path` can be used on the post object to override this value.
- **_stat**: contains file statistics in the form of a [Node.js <fs.Stats>
  object](https://nodejs.org/api/fs.html#class-fsstats).

There are a few user supplied keys that Reno can use internally.

```txt
{
  content: string | undefined,
  path: string | undefined,
  template: string | null | undefined,
}
```

- **content**: this key is required for any posts that should be output into the
  `dist` directory. If this key is `undefined`, the file will still be listed in
  the `postArray` but not written to the `dist` directory by `writePosts`.
- **path**: if this path is defined it overrides the `_path` key. Useful for
  non-post pages created with `writePage`.
- **template**: if `undefined`, `src/components/post-template.js` is used as the
  default template. To use a different template for a post, set this to a string
  containing just the name of the template from the `src/components` directory.
  To skip the template altogether, set `template` to `null`. Templates are just
  JavaScript modules that export a `template` function. The `template` function
  should accept a single argument, a post object.

Here are some post keys that could be useful for building a blog site. Though
none of these are used by Reno, they are useful for filtering out draft posts,
sorting posts by date, and other bloggy things.

```txt
{
  title: string | undefined,
  date: Date | undefined,
  tags: string[] | undefined,
  draft: boolean | undefined,
}
```

### postArray(dir)

`postArray` accepts a string containing the path to the post directory within
the `src` directory. For example, `postArray("posts")` would return a Promise
with an array of post objects based on the content in `src/posts`.

```javascript
import { postArray } from "@rasch/reno"

postArray("blog")
.then(posts => { /* do something with posts */ })
.catch(e => console.error(e))
```

### writePage(post)

`writePage` accepts a post object and returns a `Promise<void>`. The only post
keys that are used here are `path` (required), `content` (required), `template`
(optional), and any additional keys that are required by the `template`. If the
page `content` is a complete HTML page rather than a fragment, the `template`
key should be set to `null` to skip the default `template`.

```javascript
import { writePage } from "@rasch/reno"

writePage({ path: "about", content: "<h1>I'm Pogey</h1>" })
.catch(e => console.error(e))
```

In the example above, the `content` would be interpolated by the default
`template` file at `src/components/post-template.js` and written to
`dist/about/index.html`.

### writePosts(posts)

`writePosts` accepts an array of post objects and writes the HTML output to the
`dist` directory.

```javascript
import { writePosts, postArray } from "@rasch/reno"

postArray("blog")
.then(posts => writePosts(posts.filter(p => !p.draft)))
.catch(e => console.error(e))
```

In the example above, the posts are filtered to exclude drafts, assuming the
drafts all have a `draft: true` property on their post object.

### write

`write` is a utility function used for writing non-HTML files such as CSS. It
accepts a string argument containing the path to write to. This function can
write to any path so, unlike the functions above, `dist` must be included the
path. It returns a function that accepts a string to write to the file,
returning a `Promise<void>`.

```javascript
import { write, css } from "@rasch/reno"

const style = css`
img {
  display: block;
  max-width: 100%;
}
`

write("dist/style.css")(style)
.catch(e => console.error(e))
```

### stringify

`stringify` just wraps `JSON.stringify` in a Promise to simplify error handling
(since the other Reno functions also return Promises). It is useful for
generating static JSON APIs.

```javascript
import { stringify } from "@rasch/reno"

stringify({hello: "world"})
.then(str => { /* do something with JSON string */ })
.catch(e => console.error(e))
```

### json

`json` just wraps `JSON.parse` in a Promise to simplify error handling.

```javascript
import { json } from "@rasch/reno"

json('{"hello": "world"}')
.then(json => { /* do something with object */ })
.catch(e => console.error(e))
```

## Examples

Well, if all of that was a bit confusing, then maybe a couple of examples will
clear things up.

An example post `src/posts/my-awesome-post.js`.

```javascript
import { md } from "@rasch/reno"

export const post = {
  title: "My Awesome Post",
  description: "A post about something awesome"
  tags: ["awesome", "animation"],
  date: new Date("2024-04-20T04:20:00"),
}

post.content = md`
The first paragraph.

## Section Two

A section two paragraph.
`
```

An example template file `src/components/post-template.js`.

```javascript
import { html } from "@rasch/reno"

export const template = post => html`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${post.title || post._path}</title>
  <meta name="description" content="${post.description}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<article class="content">
  <h1>${post.title || post._path}</h1>
  <p class="post-date">
    <time datetime="${post.date?.toISOString() || post._stat.mtimeMs.toISOString()}">
      ${post.date?.toDateString() || post._stat.mtimeMs.toDateString()}
    </time>
  </p>
  ${post.content}
</article>
</body>
</html>
`
```

An example blog post index file `src/posts/index.js`. Note that in this example
a template file at `src/components/page-template.js` would need to be created as
well.

```javascript
import { html, postArray, writePage, writePosts } from "@rasch/reno"

const page = {
  title: "My Recent Posts",
  template: "page-template.js",
  date: new Date(),
  path: "posts",
}

const postCard = post => html`
<li>
  <a href="/${post._path}">
    [${new Date(post.date || post._stat.mtimeMs).toLocaleDateString()}]
    ${post.title || post._path}
  </a>
</li>`.trim()

postArray(page.path)
.then(posts => {
  posts.sort((a, b) =>
    new Date(b.date || b._stat.mtimeMs) - new Date(a.date || a._stat.mtimeMs))

  page.content = html`
  <ul>
  ${posts
    .filter(p => !p.draft && p.content)
    .map(postCard)
    .join("")
    .trim()}
  </ul>`

  writePage(page)
  writePosts(posts.filter(p => !p.draft))
})
.catch(e => console.error(e))
```

To build the blog site, run:

```sh
node src/posts/index.js
```
