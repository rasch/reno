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
  To skip the template altogether, set `template` to `null`.

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

### postArray

```javascript
import { postArray } from "@rasch/reno"

postArray("blog")
.then(posts => { /* do something with posts */ })
.catch(e => console.error(e))
```

### writePage

```javascript
import { writePage } from "@rasch/reno"

writePage({ path: "about", content: "<h1>I'm Pogey</h1>" })
.catch(e => console.error(e))
```

### writePosts

```javascript
import { writePosts, postArray } from "@rasch/reno"

postArray("blog")
.then(posts => writePosts(posts))
.catch(e => console.error(e))
```

### stringify

### json

### write
