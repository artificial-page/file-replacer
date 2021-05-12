import { readFile, writeFile } from "fs"

export type ReplacementConditionType = (
  body: string
) => boolean

export type ReplacementOutputElementType = [
  string | RegExp,
  string | ((substring: string, ...args: any[]) => string),
  ReplacementConditionType?
]

export type ReplacementOutputType =
  ReplacementOutputElementType[]

export async function fileReplacer({
  src,
  dest,
  replacements,
}: {
  src: string
  dest: string
  replacements?: ReplacementOutputType
  createOnly?: boolean
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    readFile(src, "utf8", async (err, data) => {
      if (err) {
        return reject(err)
      }

      if (replacements) {
        for (const [
          search,
          replace,
          condition,
        ] of replacements) {
          if (!condition || condition(data)) {
            if (typeof replace === "string") {
              data = data.replace(search, replace)
            } else {
              data = data.replace(search, replace)
            }
          }
        }
      }

      writeFile(dest, data, "utf8", (err) => {
        if (err) {
          reject(err)
        }

        resolve()
      })
    })
  })
}

export default fileReplacer
