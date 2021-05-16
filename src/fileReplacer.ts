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
  data,
  src,
  dest,
  replacements,
  createOnly,
  skipUnchanged,
}: {
  fsExtra: typeof fsExtraType
  dest: string
  src?: string
  data?: string
  replacements?: ReplacementOutputType
  createOnly?: boolean
  skipUnchanged?: boolean
}): Promise<void> {
  data = data ?? (await fsExtra.readFile(src)).toString()

  const ogData = data

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
    if (!skipUnchanged || ogData !== data) {
      await fsExtra.writeFile(dest, data)
    }
  }
}

export default fileReplacer
