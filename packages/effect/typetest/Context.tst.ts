import { Context, Effect, Option, Scope } from "effect"
import { expect, it } from "tstyche"

it("does not type a service removed with addOrOmit as present", () => {
  const Service = Context.Service<{ readonly value: number }>("TestService")
  const context = Context.make(Service, { value: 1 }).pipe(Context.addOrOmit(Service, Option.none()))
  const dataFirst = Context.addOrOmit(Context.make(Service, { value: 1 }), Service, Option.none())

  expect(Context.get).type.not.toBeCallableWith(context, Service)
  expect(Context.get).type.not.toBeCallableWith(dataFirst, Service)
})

it("infers services for a saved curried getter", () => {
  const Service = Context.Service<{ readonly value: number }>("TestService")
  const getService = Context.get(Service)

  expect(getService(Context.make(Service, { value: 1 }))).type.toBe<{ readonly value: number }>()
})

it("tracks named variants of the same service as separate requirements", () => {
  const Database = Context.Service<{ readonly url: string }>("TestDatabase")
  const Primary = Context.Named(Database, "Primary")
  const Replica = Context.Named(Database, "Replica")

  expect(Primary).type.toBe<
    Context.Service<Context.Named<{ readonly url: string }, "Primary">, { readonly url: string }>
  >()
  expect(Primary).type.toBeAssignableTo<
    Context.NamedKey<{ readonly url: string }, "Primary", { readonly url: string }>
  >()

  const program = Effect.gen(function*() {
    const primary = yield* Primary
    const replica = yield* Replica
    return [primary, replica] as const
  })

  expect(program).type.toBe<
    Effect.Effect<
      readonly [{ readonly url: string }, { readonly url: string }],
      never,
      Context.Named<{ readonly url: string }, "Primary"> | Context.Named<{ readonly url: string }, "Replica">
    >
  >()

  expect<Context.Named<{ readonly url: string }, "Primary">>().type.not.toBeAssignableTo<
    Context.Named<{ readonly url: string }, "Replica">
  >()
  expect<Context.Named<{ readonly url: string }, "Primary">>().type.not.toBeAssignableTo<{ readonly url: string }>()

  const context = Context.make(Primary, { url: "primary" })
  expect(Context.get).type.not.toBeCallableWith(context, Replica)
  expect(Context.get).type.not.toBeCallableWith(context, Database)
})

it("uses the class type as an opaque identifier for class-style named keys", () => {
  class Database extends Context.Service<Database, { readonly url: string }>()("TestDatabase") {}
  class Primary extends Context.Named<Primary>()(Database, "Primary") {}
  class Replica extends Context.Named<Replica>()(Database, "Replica") {}

  expect(Primary.key).type.toBe<"TestDatabase#Primary">()
  expect(Primary).type.toBeAssignableTo<Context.NamedKey<Database, "Primary", { readonly url: string }, Primary>>()
  expect<Primary>().type.toBeAssignableTo<Context.Named<Database, "Primary">>()
  expect<Primary>().type.not.toBeAssignableTo<Context.Named<Database, "Replica">>()
  expect<Context.Named<Database, "Primary">>().type.not.toBeAssignableTo<Primary>()

  class Other extends Context.Service<Other, { readonly url: string }>()("TestOther") {}
  class OtherPrimary extends Context.Named<OtherPrimary>()(Other, "Primary") {}
  expect<OtherPrimary>().type.not.toBeAssignableTo<Context.Named<Database, "Primary">>()

  class ScopeA extends Context.Named<ScopeA>()(Scope.Scope, "ScopeA") {}
  const ScopeB = Context.Named(Scope.Scope, "ScopeB")

  const program = Effect.gen(function*() {
    const scope = yield* Effect.scope
    const scopeA = yield* Effect.scope.pipe(Effect.provideNamed(Scope.Scope, ScopeA))
    const scopeB = yield* Effect.scope.pipe(Effect.provideNamed(Scope.Scope, ScopeB))
  })

  const qwe = program.pipe(
    Effect.provideService(Scope.Scope, Scope.makeUnsafe()),
    Effect.provideService(ScopeA, Scope.makeUnsafe()),
    Effect.provideService(ScopeB, Scope.makeUnsafe())
  )

  expect(program).type.toBe<
    Effect.Effect<readonly [{ readonly url: string }, { readonly url: string }], never, Primary | Replica>
  >()

  expect<Primary>().type.not.toBeAssignableTo<Replica>()
  expect<Primary>().type.not.toBeAssignableTo<Database>()

  const context = Context.make(Primary, { url: "primary" })
  expect(Context.get(context, Primary)).type.toBe<{ readonly url: string }>()
  expect(Context.get).type.not.toBeCallableWith(context, Replica)
  expect(Context.get).type.not.toBeCallableWith(context, Database)
})
