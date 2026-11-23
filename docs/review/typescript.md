# TypeScript (TS)

**Review kinds:** pr, repo
**Applies when:** any `.ts` or `.tsx` file, `tsconfig.json`, or a typed config file is in scope.
**Policy:** `CONTEXT.md` (Type safety & quality), `AGENTS.md` (TypeScript).
**References:** typescript-eslint `strict-type-checked` rule set (not enabled here, so its rules are checked by hand).

## How to review

`tsc` passing proves less than it seems here: `tsconfig.json` only includes `src/**`, `noUncheckedIndexedAccess` is off, and no type-aware lint rules run. For every value whose type comes from outside the program (JSON, env, `response.json()`, URL parameters, browser APIs), check whether the code validates it or just asserts it. For every promise, check that something awaits it or handles its rejection.

## Criteria

- **TS-01** (MUST) No new `any`, explicit or implicit (untyped JSON, `catch (e)` used as typed, untyped third-party returns); `unknown` plus narrowing is used at boundaries. Verify: search `any` and read each external-data entry point.
- **TS-02** (MUST) No type assertions on untrusted data (`as PorchClip[]` on `response.json()` is the known case); network, env, and URL data are validated with type guards or a schema before use. Verify: search `as` in scope and classify each assertion.
- **TS-03** (MUST) No floating promises: every promise is awaited, returned, or explicitly `void`ed with its rejection handled. Verify: read every call to an `async` function or promise-returning API in scope.
- **TS-04** (SHOULD) No promise-returning function is passed where a void callback is expected (event handlers, effects, `setInterval`) without handling its rejection. Verify: read each such callback.
- **TS-05** (SHOULD) Unions and fixed sets are handled exhaustively (`never` check or explicit default). Verify: read each `switch` and union branch in scope.
- **TS-06** (SHOULD) Non-null assertions and index lookups are justified; `Record<string, T>` and array index reads handle `undefined`. Verify: search `!.`, `!)`, and `[` lookups in scope.
- **TS-07** (SHOULD) Exported functions and components have explicit types; types shared across modules live in `src/types`. Verify: read exports in scope.
- **TS-08** (MUST) No `@ts-ignore`; `@ts-expect-error` only with a reason; compiler options are not weakened. Verify: search the diff and `tsconfig.json`.
- **TS-09** (SHOULD) Fixed identifiers (route IDs, hero IDs, environment names) use literal types or `as const` so a typo fails to compile. Verify: read the constants and their key types.
- **TS-10** (SHOULD) Typed files outside the `tsconfig.json` include list (`next.config.ts`, `jest.setup.ts`, `cypress/**`) are reviewed as if untyped. Verify: list them in the evidence.
- **TS-11** (NICE) Types are readable: no needless generics, clear names. Verify: read type declarations in scope.

## Automatic-fail signals

- `as SomeType` on data from the network, env, or URL with no validation.
- An unhandled promise in an effect, handler, or script entry point.
