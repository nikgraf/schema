import * as D from "@effect/data/Debug"
import * as RA from "@effect/data/ReadonlyArray"
import type { ParseOptions } from "@effect/schema/AST"
import * as S from "@effect/schema/Schema"
import * as Benchmark from "benchmark"
import { z } from "zod"

D.runtimeDebug.tracingEnabled = true

/*
n = 100
validateEither (good) x 1,777,205 ops/sec ±0.49% (89 runs sampled)
zod (good) x 797,123 ops/sec ±7.51% (80 runs sampled)
validateEither (bad) x 1,103,955 ops/sec ±5.06% (80 runs sampled)
zod (bad) x 929,104 ops/sec ±2.03% (88 runs sampled)
*/

const suite = new Benchmark.Suite()

const n = 100
const members = RA.makeBy(n, (i) =>
  S.struct({
    kind: S.literal(i),
    a: S.string,
    b: S.number,
    c: S.boolean
  }))
const schema = S.union(...members)

const x = RA.makeBy(n, (i) =>
  z.object({
    kind: z.literal(i),
    a: z.string(),
    b: z.number(),
    c: z.boolean()
  }))

const schemaZod = z.discriminatedUnion("kind", x)

const validateEither = S.validateEither(schema)
const options: ParseOptions = { errors: "all" }

const good = {
  kind: n - 1,
  a: "a",
  b: 1,
  c: true
}

const bad = {
  kind: n - 1,
  a: "a",
  b: 1,
  c: "c"
}

// console.log(validateEither(good))
// console.log(validateEither(bad))

suite
  .add("validateEither (good)", function() {
    validateEither(good, options)
  })
  .add("zod (good)", function() {
    schemaZod.safeParse(good)
  })
  .add("validateEither (bad)", function() {
    validateEither(bad, options)
  })
  .add("zod (bad)", function() {
    schemaZod.safeParse(good)
  })
  .on("cycle", function(event: any) {
    console.log(String(event.target))
  })
  .on("complete", function(this: any) {
    console.log("Fastest is " + this.filter("fastest").map("name"))
  })
  .run({ async: true })
