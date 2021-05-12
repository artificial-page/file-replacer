import { readFile, writeFile } from "fs"

export type ReplacementOutputType = {
  search: string | RegExp
  replace:
    | string
    | ((substring: string, ...args: any[]) => string)
  condition?: (body: string) => boolean
}[]

export async function fileReplacer({
  src,
  dest,
  replacements,
}: {
  src: string
  dest: string
  replacements?: ReplacementOutputType
}): Promise<void> {
  let data = await readFileAsync({ src })

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

  await writeFileAsync({ dest, data })
}

export async function readFileAsync({
  src,
}: {
  src: string
}): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    readFile(src, "utf8", async (err, data) =>
      err ? reject(err) : resolve(data)
    )
  })
}

export async function writeFileAsync({
  dest,
  data,
}: {
  dest: string
  data: string
}): Promise<void> {
  return await new Promise<void>((resolve, reject) => {
    writeFile(dest, data, "utf8", (err) =>
      err ? reject(err) : resolve()
    )
  })
}

export default fileReplacer
