import path from "path"
import fsExtraType from "fs-extra"

export type ReplacementOutputType = {
  search: string | RegExp
  replace:
    | string
    | ((substring: string, ...args: any[]) => string)
  condition?: (body: string) => boolean
}[]

export async function fileReplacer({
  fsExtra,
  src,
  dest,
  replacements,
  createOnly,
}: {
  fsExtra: typeof fsExtraType
  src: string
  dest: string
  replacements?: ReplacementOutputType
  createOnly?: boolean
}): Promise<void> {
  let data = (await fsExtra.readFile(src)).toString()

  if (replacements) {
    for (const {
      search,
      replace,
      condition,
    } of replacements) {
      if (!condition || condition(data)) {
        data = data.replace(search, replace as string)
      }
    }
  }

  await fsExtra.ensureDir(path.dirname(dest))

  if (!createOnly || !(await fsExtra.pathExists(dest))) {
    await fsExtra.writeFile(dest, data)
  }
}

export default fileReplacer
