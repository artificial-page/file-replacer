import expect from "expect"
import fileReplacer, {
  readFileAsync,
  writeFileAsync,
} from "./fileReplacer"

describe("fileReplacer", () => {
  it("works", async () => {
    const tmpPath = "/tmp/fileReplacerSpec.txt"

    await writeFileAsync({
      dest: tmpPath,
      data: "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.\n",
    })

    await fileReplacer({
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
          search: "L",
          replace: "B",
          condition: (body) => body.startsWith("LOREM"),
        },
        {
          search: "R",
          replace: "N",
          condition: (body) => !body.startsWith("BOREM"),
        },
      ],
    })

    expect(await readFileAsync({ src: tmpPath })).toEqual(
      "BOREM OPsum dolor sit amEt,\nconsectEtur adopiscing Elit.\n"
    )
  })
})
