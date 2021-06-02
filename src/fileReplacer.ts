import path from "path"
import { ESLint } from "eslint"
import fsExtraType from "fs-extra"

export type ReplacementOutputType = {
  search: string | RegExp
  replace:
    | string
    | ((substring: string, ...args: any[]) => string)
  condition?: (body: string) => boolean
}[]

export async function fileReplacer({
  data,
  dest,
  eslint,
  fsExtra,
  src,
  replacements,
  createOnly,
  skipUnchanged,
}: {
  dest: string
  eslint?: ESLint
  fsExtra: typeof fsExtraType
  src?: string
  data?: string
  replacements?: ReplacementOutputType
  createOnly?: boolean
  skipUnchanged?: boolean
}): Promise<string> {
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

  if (!createOnly || !(await fsExtra.pathExists(dest))) {
    await fsExtra.ensureDir(path.dirname(dest))

    if (eslint) {
      const lint = await eslint.lintText(data, {
        filePath: dest,
      })
      data = lint[0]?.output || data
    }

    if (!skipUnchanged || ogData !== data) {
      await fsExtra.writeFile(dest, data)
    }
  }

  return data
}

export default fileReplacer
