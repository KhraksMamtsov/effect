---
"effect": minor
"@effect/platform-node": minor
"@effect/platform-bun": minor
---

`HttpServerRequest.source` is now the open `HttpServerRequestSource` interface instead of `object`. Importing `NodeHttpServer` augments it with Node's `http.IncomingMessage`, and importing `BunHttpServer` augments it with `Bun.BunRequest`. Where code required `source` to be `object`, widen that value or read the platform request type after importing the server module.
