---
"effect": minor
---

Add `Context.named` for deriving separate service keys for named variants of the same service, with a class-style form `Context.named<Self>()(service, name)` for opaque identifiers, and `Effect.provideNamed(service, namedKey)` for satisfying an existing service requirement, such as `Scope`, from a named key.
