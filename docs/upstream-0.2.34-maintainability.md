# 0.2.34 maintainability measurement

Fixed baseline: `d1722576`. Final application source: `8962b690`. Same root, CLI, metrics and
discovery scope throughout. Raw JSON is preserved under `C:/tmp/tucano-0234-baseline.json` and
`C:/tmp/tucano-0234-final-metrics.json`. The initial comparator failed Windows text decoding;
rerunning Python with `-X utf8` reads the reports correctly.

Repository red files: **145 → 150**. NLOC: **137,657 → 140,636**.
The growth implements incoming endpoint, Web, Hermes and website functionality and regression
coverage. The MI gate is **blocked**, not passed. This includes newly incoming red modules,
not only unchanged legacy debt. No full maintainability/production-readiness claim is made.
Broad upstream module refactoring is deferred to a scoped audit; installation does not close it.

The Entanglement skill requires: “every added or modified supported task file must have
unrounded file MI >=10”. Its exact source is
`C:/Users/theap/.agents/skills/entanglement/SKILL.md`. The scores below retain unrounded values.
Structural diagnostics are advisory; runtime/build/behavior checks remain separate evidence.

| Changed supported file | Baseline MI | Final MI |
| --- | ---: | ---: |
| `scripts/lib/upgrade-034-check.mjs` | new | 22.122033015662847 |
| `scripts/qa-background.mjs` | 19.577999458653178 | 19.253383182646377 |
| `site/assets/compare.css` | 29.768654983110533 | 25.744438413971793 |
| `site/build.mjs` | 19.16901373668288 | 0.0 |
| `site/guia.html` | new | 31.544504290074258 |
| `site/guides.mjs` | new | 8.017738919862811 |
| `site/guides.test.mjs` | new | 18.947749626292172 |
| `site/privacidade.html` | 18.364573891692316 | 18.364573891692316 |
| `src/core/agent-import.ts` | 0.0 | 0.0 |
| `src/core/db.ts` | 0.0 | 0.0 |
| `src/core/delegations.ts` | 0.0 | 0.0 |
| `src/core/engine-check.ts` | 20.459408749665446 | 20.114193973257937 |
| `src/core/engines/detect.ts` | 0.0 | 0.0 |
| `src/core/engines/endpoint.ts` | new | 7.508684960190852 |
| `src/core/engines/fake.ts` | 0.0 | 0.0 |
| `src/core/guide-i18n.ts` | 32.09896256654026 | 32.09896256654026 |
| `src/core/harness.ts` | 39.782536336558245 | 35.116560398123106 |
| `src/core/hermes-import.ts` | new | 0.0 |
| `src/core/index.ts` | 0.0 | 0.0 |
| `src/core/login-terminal.ts` | 20.526910751650373 | 20.171689700243455 |
| `src/core/policy-people.ts` | 8.865890639856786 | 8.698475037845267 |
| `src/core/runs.ts` | 0.0 | 0.0 |
| `src/core/tuca.ts` | 1.0033452861460685 | 0.9989274683279589 |
| `src/core/web-tools.ts` | new | 21.275544000308702 |
| `src/main/index.ts` | 0.0 | 0.0 |
| `src/preload/index.ts` | 18.128410213505816 | 18.089873622950197 |
| `src/renderer/src/components/Conversation.tsx` | 0.0 | 0.0 |
| `src/renderer/src/components/Harness.tsx` | 0.0 | 0.0 |
| `src/renderer/src/components/HermesImport.tsx` | new | 16.174528158093562 |
| `src/renderer/src/components/Intro.tsx` | 0.0 | 0.0 |
| `src/renderer/src/components/Pages.tsx` | 0.0 | 0.0 |
| `src/renderer/src/components/Usage.tsx` | 0.0 | 0.0 |
| `src/renderer/src/rpc.ts` | 24.45516914178479 | 24.415956352121444 |
| `src/renderer/src/settings-structure.ts` | 26.986331135450275 | 26.978409811437604 |
| `src/renderer/src/store.ts` | 0.0 | 0.0 |
| `src/renderer/src/styles.css` | 0.0 | 0.0 |
| `src/server/index.ts` | 0.0 | 0.0 |
| `src/shared/actions.ts` | 0.0 | 0.0 |
| `src/shared/errors.ts` | 0.0 | 0.0 |
| `src/shared/hermes-import.ts` | new | 55.26431226279415 |
| `src/shared/rpc-shapes.ts` | 11.055752059283854 | 10.843768344817763 |
| `src/shared/rpc.ts` | 14.806625147868578 | 14.556397396575342 |
| `src/shared/types.ts` | 0.0 | 0.0 |
| `test/accounts-ui.test.tsx` | 24.632318151829274 | 24.530594654567494 |
| `test/accounts.test.ts` | 21.95641668266473 | 21.93501887165806 |
| `test/action-rules.test.ts` | 1.5445086034109925 | 1.5347171313930603 |
| `test/actions.test.ts` | 17.12731648874723 | 15.87255469174316 |
| `test/autonomy-clicks.test.ts` | 15.745942914797013 | 15.728011520242438 |
| `test/browser.test.ts` | 0.0 | 0.0 |
| `test/composio-calls.test.ts` | 0.0 | 0.0 |
| `test/computer-down.test.ts` | 24.772673013597696 | 24.724804299603594 |
| `test/computer.test.ts` | 11.585333445443702 | 11.573614606103098 |
| `test/connector-errors.test.ts` | 13.93412191130942 | 13.915550781177375 |
| `test/continue-killed.test.ts` | 18.1915508263768 | 18.17120052150507 |
| `test/core-startup.test.ts` | 29.21629857554475 | 29.20057603501094 |
| `test/delegations.test.ts` | 0.0 | 0.0 |
| `test/delete-session-at-work.test.ts` | 32.7582596658477 | 32.70872204204268 |
| `test/endpoint-default-web.test.ts` | new | 30.750958076769603 |
| `test/endpoint-engine.test.ts` | new | 12.895912108581467 |
| `test/endpoint-key-scope.test.ts` | new | 31.037368030688825 |
| `test/endpoint-model-cache.test.tsx` | new | 39.77202740472811 |
| `test/github-publish.test.ts` | 17.970312297961737 | 17.963268651468535 |
| `test/governance.test.ts` | 0.0 | 0.0 |
| `test/harness.test.ts` | 35.36521240124249 | 35.31334778447058 |
| `test/hermes-approval.test.ts` | 26.544799057914624 | 26.513446874132423 |
| `test/hermes-concurrent.test.ts` | 22.99070681999286 | 22.965819564869953 |
| `test/hermes-import.test.ts` | new | 9.733005244364147 |
| `test/hermes-one-at-a-time.test.ts` | 27.685074958585634 | 27.648455552485743 |
| `test/initiative-heartbeat.test.ts` | 4.776174541766719 | 4.766061808522873 |
| `test/initiative-recovery.test.ts` | 11.194320805135984 | 11.175446416853978 |
| `test/jev-listen.test.ts` | 14.029509388482431 | 14.012767754065223 |
| `test/jev-recommend.test.ts` | 15.214985124780208 | 15.195333337649137 |
| `test/jev.test.ts` | 23.5746049902293 | 23.552433200293102 |
| `test/kept-session.test.ts` | 0.0 | 0.0 |
| `test/limits.test.ts` | 4.839289018444861 | 4.819121052912529 |
| `test/live-steps.test.ts` | 23.591933460540265 | 23.58213822695098 |
| `test/memory-search.test.ts` | 24.95236998923327 | 24.92449614495428 |
| `test/memory.test.ts` | 7.7426441681309575 | 7.731558625173575 |
| `test/model-routing-run.test.ts` | 12.351149275257765 | 12.345424911459558 |
| `test/next-steps.test.ts` | 9.901165623698237 | 9.886824304019498 |
| `test/onboarding-ui.test.tsx` | 0.0 | 0.0 |
| `test/people-prefs.test.ts` | 20.50344856003591 | 20.495787110607164 |
| `test/people-roles.test.ts` | 0.0 | 0.0 |
| `test/people.test.ts` | 2.6716408875646738 | 2.663605204464224 |
| `test/queue-priority.test.ts` | 32.6885849760438 | 32.64547047854792 |
| `test/reply-order.test.ts` | 17.14590368849041 | 17.12835167973472 |
| `test/reserve-account.test.ts` | 20.278455410913583 | 20.25583435122962 |
| `test/reserve.test.ts` | 21.7110296404737 | 21.683632139624738 |
| `test/routine-silent.test.ts` | 18.301871420333995 | 18.29352337512509 |
| `test/routines-dates.test.ts` | 12.980060755614279 | 12.975415187552008 |
| `test/routines.test.ts` | 0.0 | 0.0 |
| `test/runner.test.ts` | 0.0 | 0.0 |
| `test/skills.test.ts` | 21.157874038796304 | 21.137389302397295 |
| `test/slow-triage.test.ts` | 1.417757775586973 | 1.4082909877302041 |
| `test/team-fixes.test.ts` | 14.038295345093484 | 14.017641529605674 |
| `test/team-round2.test.ts` | 0.0 | 0.0 |
| `test/team-stress.test.ts` | 0.0 | 0.0 |
| `test/threads.test.ts` | 0.0 | 0.0 |
| `test/triggers.test.ts` | 14.774857089185707 | 14.748380049000055 |
| `test/tuca-group-ui.test.tsx` | 13.338995956118113 | 13.331466690021207 |
| `test/tuca-help.test.ts` | 2.4154945888701556 | 2.40785938528073 |
| `test/tuca.test.ts` | 21.678141673140395 | 21.63986155469601 |
| `test/turn-files.test.ts` | 18.21440987211517 | 18.19425467639685 |
| `test/turn-images.test.ts` | 14.637921370638386 | 14.6196589942301 |
| `test/waiting-mark.test.ts` | 28.941469229220402 | 28.902520235895462 |
| `test/warm-start.test.ts` | 20.635924522805453 | 20.611594087297238 |
| `test/wiki-curator.test.ts` | 0.0 | 0.0 |
| `test/workspace-data.test.ts` | 11.088728359733713 | 11.081925252600975 |

Summed function CC: 44,877 → 46,058 (+1,181). CogC: 29,277 → 30,255 (+978).
Comparator exit 1 confirms the blocked MI gate. Structural additions need a scoped architectural
review; this report does not certify their safety from a lower average or a successful parse.
