import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import type { HttpServerRequest } from "effect/http/HttpServerRequest"
import type { IncomingMessage } from "node:http"
import { describe, expect, it } from "tstyche"

declare const request: HttpServerRequest

void NodeHttpServer

describe("NodeHttpServer", () => {
  it("augments HttpServerRequest.source with IncomingMessage", () => {
    expect(request.source).type.toBeAssignableTo<IncomingMessage>()
    expect<IncomingMessage>().type.toBeAssignableTo<typeof request.source>()
    expect(request.source.httpVersion).type.toBe<string>()
  })
})
