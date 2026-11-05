import type { HttpServerRequest, HttpServerRequestSource } from "effect/http/HttpServerRequest"
import { describe, expect, it } from "tstyche"

declare const request: HttpServerRequest

describe("HttpServerRequest", () => {
  it("keeps source open until a platform module augments it", () => {
    expect(request.source).type.toBe<HttpServerRequestSource>()
  })

  it("hides platform request members on the unaugmented source", () => {
    // @ts-expect-error Property 'httpVersion' does not exist on type 'HttpServerRequestSource'
    void request.source.httpVersion

    // @ts-expect-error Property 'text' does not exist on type 'HttpServerRequestSource'
    void request.source.text
  })
})
