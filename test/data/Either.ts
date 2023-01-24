import * as E from "@fp-ts/data/Either"
import { pipe } from "@fp-ts/data/Function"
import * as _ from "@fp-ts/schema/data/Either"
import { parseNumber } from "@fp-ts/schema/data/parser"
import * as P from "@fp-ts/schema/Parser"
import * as Pretty from "@fp-ts/schema/Pretty"
import * as S from "@fp-ts/schema/Schema"
import * as Util from "@fp-ts/schema/test/util"

const NumberFromString = pipe(S.string, parseNumber)

describe.concurrent("Either", () => {
  it("either. property tests", () => {
    Util.property(_.either(S.string, S.number))
  })

  it("option. Guard", () => {
    const schema = _.either(S.string, S.number)
    const is = P.is(schema)
    expect(is(E.left("a"))).toEqual(true)
    expect(is(E.right(1))).toEqual(true)
    expect(is(E.right("a"))).toEqual(false)
  })

  it("either. Decoder", () => {
    const schema = _.either(S.string, NumberFromString)
    Util.expectDecodingSuccess(schema, E.left("a"), E.left("a"))
    Util.expectDecodingSuccess(schema, E.right("1"), E.right(1))
  })

  it("either. Pretty", () => {
    const schema = _.either(S.string, S.number)
    const pretty = Pretty.pretty(schema)
    expect(pretty(E.left("a"))).toEqual("left(\"a\")")
    expect(pretty(E.right(1))).toEqual("right(1)")
  })
})
