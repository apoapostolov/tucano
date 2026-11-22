# Move interface translations into versioned locale catalogs

Now that #410 has landed, could we give translations a maintained home outside component and core source files? Copy improvements currently require editing application code, and adding a third language would require changing the two-argument `L()` API throughout the app.

At main `98554fdd`, `src/shared/lang.ts` supports only `pt` and `en`, selects between `L(pt, en)`, and maps those choices to `pt-BR` and `en-US`. A syntax-tree inventory found 6,071 literal/template English occurrences in `L()` calls across 158 source files. This counts occurrences, including prompts and repeated text, rather than unique interface messages; it is not a count of untranslated strings.

- [Current language helper](https://github.com/eduwxyz/tucano/blob/98554fdd007637409696f98e061973b5ca9338c6/src/shared/lang.ts#L1-L16)
- [Interpolation and grammar inside component code](https://github.com/eduwxyz/tucano/blob/98554fdd007637409696f98e061973b5ca9338c6/src/renderer/src/components/Pages.tsx#L884-L888)

The current approach keeps both languages beside the code, but it also makes translators edit TS/TSX, ties wording changes to implementation diffs, and leaves plural grammar embedded in expressions. A catalog would let translation and copy review happen without editing component behavior.

## Proposed scope

- Use stable message IDs, grouped by feature, with separate versioned locale catalogs. IDs should describe the purpose, such as `settings.updates.unavailable`, rather than contain the current wording. Editing a sentence should not rename its ID.
- Keep Portuguese and English working throughout migration. Choose and document the source locale, fallback locale and review responsibility; adding a language should not require changing every call site or a binary language selector.
- Use complete messages with named, checked placeholders and locale-aware plural rules. Avoid sentence fragments joined in code. Keep translator context for ambiguous labels, dynamic values, privacy warnings and destructive actions.
- Share the catalog contract across the renderer, Electron main process, server and notifications. Keep interface language and model-facing prompt policy explicit: translating a label must not change RPC keys, routes, tool names, stored values or a person's content.
- Keep the person's explicit language choice. Preserve current behavior during migration and define what happens for an unsupported locale or a missing translation. CI should catch missing source messages and placeholder mismatches; development should make missing translations visible. Production should use a documented fallback rather than show an empty label or an internal ID.
- Provide an extraction/validation command and a short contributor guide. A translator should be able to update a catalog and preview it without editing TS/TSX. A hosted translation service can be added later; it need not be a prerequisite.
- Check rendered text, not character counts alone. Use pseudolocalization and narrow-layout screenshots for buttons, hints, dialogs and warnings. Preserve complete warnings and accessible names; do not clip text or shrink type to make a translation fit.

## Suggested first increment

Start with one Settings section, including its labels, hints, errors and disabled states. Demonstrate extraction, catalog validation, switching between Portuguese and English, plural/interpolation checks and a rendered layout test. Then migrate other surfaces in small PRs using the same API and tooling. Retire inline `L(pt, en)` calls as their surfaces move, rather than maintaining two permanent translation systems.

The maintainer can choose the library and catalog format after that small trial. The acceptance criterion is a translation-only change that touches a catalog, passes automated validation and appears correctly in the built app without changing component source.

Related: #242 covers documentation and model-facing language; #602 addresses Portuguese text shown in an English interface. This issue is the application-wide catalog and contribution workflow, rather than another wording patch or a request to add a particular language immediately.
