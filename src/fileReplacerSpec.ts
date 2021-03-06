import { ESLint } from "eslint"
import expect from "expect"
import path from "path"
import fsExtra from "fs-extra"
import fileReplacer from "./fileReplacer"

export const lorem =
  "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.\n"

describe("fileReplacer", () => {
  it("replaces tmp file", async () => {
    const tmpPath = "/tmp/fileReplacerSpec.txt"

    await fsExtra.writeFile(tmpPath, lorem)

    await fileReplacer({
      fsExtra,
      src: tmpPath,
      dest: tmpPath,
      replacements: [
        { search: "Lorem", replace: "LOREM" },
        { search: /ip/g, replace: "op" },
        { search: "op", replace: (m) => m.toUpperCase() },
        {
          search: /(e)([lt])/g,
          replace: (m, p1, p2) => p1.toUpperCase() + p2,
        },
        {
          search: /l/i,
          replace: "B",
          condition: (body) => body.startsWith("LOREM"),
        },
        {
          search: /r/i,
          replace: "N",
          condition: (body) => !body.startsWith("BOREM"),
        },
      ],
    })

    expect(
      (await fsExtra.readFile(tmpPath)).toString()
    ).toEqual(
      "BOREM OPsum dolor sit amEt,\nconsectEtur adopiscing Elit.\n"
    )
  })

  it("skips unchanged", async () => {
    const tmpPath = "/tmp/fileReplacerUnchangedSpec.txt"

    await fsExtra.remove(tmpPath)

    await fileReplacer({
      fsExtra,
      data: lorem,
      src: tmpPath,
      dest: tmpPath,
      skipUnchanged: true,
    })

    expect(await fsExtra.pathExists(tmpPath)).toBe(false)

    await fileReplacer({
      fsExtra,
      data: lorem,
      src: tmpPath,
      dest: tmpPath,
      skipUnchanged: true,
      replacements: [{ search: "Lorem", replace: "LOREM" }],
    })

    expect(await fsExtra.pathExists(tmpPath)).toBe(true)
  })

  it("lints source code", async () => {
    const tmpPath = "/tmp/fileReplacerEslintSpec.ts"

    await fsExtra.remove(tmpPath)

    await fileReplacer({
      data: "for(const x of [1,2]){console.log(x)}",
      dest: tmpPath,
      eslint: new ESLint({
        fix: true,
        overrideConfigFile: path.join(
          __dirname,
          "../../.eslintrc.json"
        ),
      }),
      fsExtra,
    })

    const out = `
for (const x of [1, 2]) {
  console.log(x);
}
`

    expect(
      (await fsExtra.readFile(tmpPath)).toString()
    ).toBe(out.trimStart())
  }).timeout(10000)
})
