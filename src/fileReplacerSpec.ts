import expect from "expect"
import fsExtra from "fs-extra"
import fileReplacer from "./fileReplacer"

describe("fileReplacer", () => {
  it("works", async () => {
    const tmpPath = "/tmp/fileReplacerSpec.txt"

    await fsExtra.writeFile(
      tmpPath,
      "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.\n"
    )

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
})
