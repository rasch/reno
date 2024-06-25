import { marked } from "marked"
import { gfmHeadingId } from "marked-gfm-heading-id"

import { md5, sha256, sha512 } from "./hash.js"
import { json, stringify } from "./json.js"

import { cwd } from "node:process"
import { join } from "node:path"
import { lstat, mkdir, readdir, writeFile } from "node:fs/promises"

marked.use(gfmHeadingId())

marked.use({
  renderer: {
    listitem({ text, task, checked }) {
      return task
        ? `<li class="task-list-item${checked ? ' checked' : ''}">${text}</li>\n`
        : false
    }
  }
})

/**
 * @typedef {Object<string, any>} Post
 * @property {string} _md5
 * @property {string} _sha256
 * @property {string} _sha512
 * @property {string} _id
 * @property {string} _file
 * @property {string} _path
 * @property {StatsFs} _stat
 * @property {string} content
 */

/**
 * identity :: ([String], ...String) -> String
 * @param {TemplateStringsArray} strings
 * @param {string[]} values
 */
const identity = (strings, ...values) =>
  String.raw({ raw: strings }, ...values)

/**
 * markdown :: ([String], ...String) -> String
 * @param {TemplateStringsArray} strings
 * @param {string[]} values
 */
const markdown = (strings, ...values) =>
  marked.parse(identity(strings, ...values))

/**
 * flip :: (a -> b -> c) -> b -> a -> c
 * @param {(x: any) => (y: any) => any} f
 * @returns {(x: any) => (y: any) => any}
 */
const flip = f => x => y => f(y)(x)

/**
 * curry2 :: ((a, b) -> c) -> a -> b -> c
 * @param {(x: any, y: any) => any} f
 * @returns {(x: any) => (y: any) => any}
 */
const curry2 = f => x => y => f(x, y)

/**
 * write :: String -> String -> Promise(IO, Error)
 * @param {string} path
 * @returns {(data: string) => Promise<void>}
 */
const write = curry2(writeFile)

/**
 * mkdirp :: String -> Promise(IO, Error)
 * @param {string} path
 * @returns {Promise<void>}
 */
const mkdirp = flip(curry2(mkdir))({ recursive: true })

/**
 * fileArray :: String -> Promise([String], Error)
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
const fileArray = dir =>
  readdir(dir, { withFileTypes: true })
  .then(files => Promise.all(files.map(file =>
    file.isDirectory() ? fileArray(join(dir, file.name)) : join(dir, file.name)
  )))
  .then(tree => tree.flat())

/**
 * postArray :: String -> Promise([Post], Error)
 * @param {string} dir
 * @returns {Promise<Post[]>}
 */
const postArray = dir =>
  fileArray(join("src", dir))
  .then(files => Promise.all(files.map(file =>
    import(join(cwd(), file)).then(async module => ({
      ...module.post,
      ...(module.post?.content && {
        _md5: md5(module.post.content),
        _sha256: sha256(module.post.content),
        _sha512: sha512(module.post.content),
        _id: sha256(file + module.post.content),
      }),
      _file: file,
      _path: file.replace(/^(?:src[/\\])?(.*)\.js$/, "$1"),
      _stat: await lstat(file),
    }))
  )))

/**
 * writePage :: Post -> Promise(IO, Error)
 * @param {Post} post
 * @returns {Promise<void>}
 */
const writePage = async post => {
  if (!post.content) return

  const templateFile = post.template || "post-template.js"
  const templatePath = join(cwd(), "src", "components", templateFile)
  const { template } = await import(templatePath)

  const dist = join("dist", post._path.replace(/[/\\]index$/, ""))
  const postContent = post.template === null ? post.content : template(post)

  await mkdirp(dist)
  await write(join(dist, "index.html"))(postContent)
}

/**
 * writePosts :: [Post] -> Promise([Post], Error)
 * @param {Post[]} posts
 * @returns {Promise<void[]>}
 */
const writePosts = posts => Promise.all(posts.map(writePage))

export {
  identity as css,
  identity as html,
  markdown as md,
  markdown,
  postArray,
  writePage,
  writePosts,
  stringify,
  json,
  write,
}
