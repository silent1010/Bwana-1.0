# Contributing to BWANA

## Engineering Principles
1. **Zero-Pill Typography:** Use unboxed typographic separators (`·`) and strict font weights rather than cluttering with colored pills.
2. **Domain-Driven Modular Code:** Keep business rules and domain entities cleanly separated from presentation views.
3. **No Fake Stubs:** Never create mock stubs or non-functional click targets; every interactive element must write to the real-time database or explicitly trigger genuine workflows.
4. **Strict TypeScript:** No `any` types. Ensure all models match the domain definitions in `src/types/index.ts`.
5. **Quality Gate:** Every pull request must pass `npm run lint` and `npm run build` without warnings or compilation errors.
