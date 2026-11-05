import * as BunHttpServer from "@effect/platform-bun/BunHttpServer"
import type { BunRequest } from "bun"
import type { HttpServerRequest } from "effect/http/HttpServerRequest"
import { describe, expect, it } from "tstyche"

declare const request: HttpServerRequest

void BunHttpServer

describe("BunHttpServer", () => {
  it("augments HttpServerRequest.source with BunRequest", () => {
    expect(request.source).type.toBeAssignableTo<BunRequest>()
    expect<BunRequest>().type.toBeAssignableTo<typeof request.source>()
    expect(request.source.params).type.toBe<Record<string, string>>()
  })
})
