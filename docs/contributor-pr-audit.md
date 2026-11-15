# Other contributor PR audit queue

Inventory captured 2026-11-15T21:44:50.358Z. Full exact-head audits: **0/244** (OPEN, MERGED, CLOSED).

This is an intake/approval queue. Independent reviews or changes require explicit user approval recorded in docs/audit-approvals.md.

Check a box only after the complete feature audit in docs/audit-plan.md passes. Targeted repairs,
integration and green CI alone do not qualify. Refreshing this file preserves checked boxes only
at the same head and base; either revision reopens the review. Keep findings and evidence in the private
reviews.json record, keyed to the exact head/base. A stale targeted review remains useful history.

Groups are initial title-based triage, not an assessed severity. Within a group, lower PR numbers
come first as an approximation of submission order. Age is time since PR creation, including time after closure; the update date includes discussion activity
and does not establish the age of the source commit. Reprioritize concrete defects in the main plan.

Do not routinely update these public branches to current main. Audit their existing code and its
integrated behavior; make focused repairs when evidence warrants them.

## Privacy, permissions and data integrity

- [ ] #10 [Let the number fields be cleared and typed over](https://github.com/eduwxyz/tucano/pull/10) <!-- head:3171932568b94b1f64fd82f27a251a629b2aca78 base:bc08fd4e6faa6e00dabe31cf1c2183b124758073 -->
  Head `3171932568b9`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T18:45:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #63 [Workspaces: separate agents, connectors and memory per context](https://github.com/eduwxyz/tucano/pull/63) <!-- head:388da6673aead081c0160fa213c37cfe913bd95d base:3e71b64d0d416ad4c8f214af3300dc13c2b0f03e -->
  Head `388da6673aea`; MERGED; author b7s; age 13 days; updated 2026-11-05T23:26:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #80 [Set a connector's token without removing it](https://github.com/eduwxyz/tucano/pull/80) <!-- head:b56a700ad7005502e32862159b8b187637649450 base:5107a636965d4163bc7eac0b6468953f0f57a375 -->
  Head `b56a700ad700`; MERGED; author rayanneblima; age 12 days; updated 2026-11-03T23:57:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #94 [Add a wiki: linked pages the agents read and a curator keeps](https://github.com/eduwxyz/tucano/pull/94) <!-- head:0bf5c16be5f796edd6bd29d0cd586a3791c11315 base:8b7c069ab8e6d5c45cf1a3d19a2a3e5885a7b88b -->
  Head `0bf5c16be5f7`; MERGED; author eduwxyz; age 11 days; updated 2026-11-04T09:27:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #95 [Wiki keeps knowledge, not records of the task](https://github.com/eduwxyz/tucano/pull/95) <!-- head:6c1de6f33037693e1f9975f7e87ca790933c0f91 base:3556ad01f7d6c958f4fa7e02a38e16ddacb43233 -->
  Head `6c1de6f33037`; CLOSED; author eduwxyz; age 11 days; updated 2026-11-04T10:25:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #99 [Show the token-rejected message when a connector answers 401](https://github.com/eduwxyz/tucano/pull/99) <!-- head:a26243ff91cdd8a2861ede054b7f1394e6c4a313 base:def2458775855a7429b222cf5feae8d1f7d46b44 -->
  Head `a26243ff91cd`; MERGED; author eduwxyz; age 11 days; updated 2026-11-04T12:45:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #100 [Keep the connector's OAuth registration across launches, so signing in sticks](https://github.com/eduwxyz/tucano/pull/100) <!-- head:ea30c7e8d3bf11c98785edab32fdd1089301ae2e base:5a81c4e770d62624e70aa091dcc47a9675ac16a1 -->
  Head `ea30c7e8d3bf`; MERGED; author GianCdM; age 11 days; updated 2026-11-05T23:54:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #110 [Approvals by rule: agents ask before what matters](https://github.com/eduwxyz/tucano/pull/110) <!-- head:91badba983eba58a232d007758957ef18e5d56c4 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `91badba983eb`; CLOSED; author rjgdias; age 11 days; updated 2026-11-07T22:37:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #114 [Reconnect connectors on their own when the connection drops](https://github.com/eduwxyz/tucano/pull/114) <!-- head:65198e275de3d339ad891ad751eda0764d6bca8b base:9a4951ec1e4291a8bf3c2abd6bc74765b2602521 -->
  Head `65198e275de3`; MERGED; author rjgdias; age 11 days; updated 2026-11-05T01:38:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #122 [Fix approval decided mid-run being overwritten by the run's last save](https://github.com/eduwxyz/tucano/pull/122) <!-- head:81a190caa19655c11b8b5491e272c8c0a2a2f6c2 base:f3ceb5ba170987f61eeea9a4537c631a3b9c4a59 -->
  Head `81a190caa196`; MERGED; author eialanjones; age 10 days; updated 2026-11-05T01:13:04Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #128 [Add a store of connectors that sign in with one click](https://github.com/eduwxyz/tucano/pull/128) <!-- head:5d23d4e0f9724bdaf072c411c8e4ee35a2b36b80 base:9282fb70b1911c47e4456e7c65315800664a9d19 -->
  Head `5d23d4e0f972`; MERGED; author eduwxyz; age 10 days; updated 2026-11-05T10:07:52Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #133 [Show why a connector tool failed, in the step and to the agent](https://github.com/eduwxyz/tucano/pull/133) <!-- head:963c25c5ff54c5a997114986ac1c6d7813188e0d base:33977af77051bf106342f8b856f1b139df9841ce -->
  Head `963c25c5ff54`; MERGED; author rjgdias; age 10 days; updated 2026-11-05T20:44:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #152 [Fix missed routines firing before connectors are ready](https://github.com/eduwxyz/tucano/pull/152) <!-- head:a0d398aba4e36ae5487f4efd6c108b92affcdbef base:2f3c0c53af7f4939ddae79bdb7b97182068e7264 -->
  Head `a0d398aba4e3`; MERGED; author jvitorcarvalho; age 9 days; updated 2026-11-05T23:46:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #153 [Let a new workspace bring the wiki, the same one](https://github.com/eduwxyz/tucano/pull/153) <!-- head:dfa79fbe08e82f583260c0a9315c9263f1370ac8 base:a549562bd9c9ac8d10da5119b537d53013359a8e -->
  Head `dfa79fbe08e8`; MERGED; author eduwxyz; age 9 days; updated 2026-11-05T23:31:00Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #161 [Google Drive backup for the database (issue #81)](https://github.com/eduwxyz/tucano/pull/161) <!-- head:f00af8d7e0ec3bd56e723f599f6fe857ba25cbb5 base:45671add82010828ba5bfac89838e9baf59cfc98 -->
  Head `f00af8d7e0ec`; CLOSED; author jvitorcarvalho; age 9 days; updated 2026-11-08T00:05:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #164 [Add Gmail, Google Calendar, Drive, Docs and Sheets to the connector store](https://github.com/eduwxyz/tucano/pull/164) <!-- head:576cea484f70d4d9a9123a1a8808c33739899b81 base:c3f8febcc1016754362a210731795c07c8ab9d03 -->
  Head `576cea484f70`; CLOSED; author eduwxyz; age 9 days; updated 2026-11-06T09:35:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #167 [Remove push and PR from the agent's computer; GitHub goes through its connector](https://github.com/eduwxyz/tucano/pull/167) <!-- head:4b8516269ac6d7a99307847251708df095bdfe77 base:91061b0d06649fa2f0f14c5d91c7ad9f35398dc1 -->
  Head `4b8516269ac6`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T11:13:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #170 [Let an agent be deleted for good](https://github.com/eduwxyz/tucano/pull/170) <!-- head:7e1b16276d76f1942ffda8f0d231c80176305bbc base:c8be362c3a777bf2ab409298f1b54d8950d93843 -->
  Head `7e1b16276d76`; OPEN; author rjgdias; age 9 days; updated 2026-11-07T17:42:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #178 [Let the wiki read a reply that started early and ended late](https://github.com/eduwxyz/tucano/pull/178) <!-- head:bdd2349bf6f99488cef7a5f7c00e8167f7b93ed6 base:69e6ecf9505f0b0fa2e7e2f16340bff5a9ba559e -->
  Head `bdd2349bf6f9`; MERGED; author rjgdias; age 8 days; updated 2026-11-07T15:05:00Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #180 [Backup no Google Drive via conector MCP existente](https://github.com/eduwxyz/tucano/pull/180) <!-- head:464cd8a174f98ec2610eeb274fc81291fde5007f base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `464cd8a174f9`; OPEN; author jvitorcarvalho; age 8 days; updated 2026-11-07T00:34:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #184 [Add Mofi to the connector store](https://github.com/eduwxyz/tucano/pull/184) <!-- head:ff1c277f51ced7c6e567b502a97f61f933406973 base:6cc7f0162fc1b2230bbd21287856efea6fa87051 -->
  Head `ff1c277f51ce`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T13:24:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #187 [Give the site a privacy policy and a support page](https://github.com/eduwxyz/tucano/pull/187) <!-- head:a5a34831ee39931cb8f9a63984ce21af75051b62 base:69e6ecf9505f0b0fa2e7e2f16340bff5a9ba559e -->
  Head `a5a34831ee39`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T15:02:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #188 [Add Composio as a connector, explain Google's Developer Preview, and ask before sends and posts](https://github.com/eduwxyz/tucano/pull/188) <!-- head:0fac8311ab34c28d49322e951bc0a5dfaae739d3 base:37733feacc885dfeadfbe8f007410a829b38b241 -->
  Head `0fac8311ab34`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T16:28:59Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #200 [The connector store for the iPhone app, served by the Tucano](https://github.com/eduwxyz/tucano/pull/200) <!-- head:053e793cda960fd0231b6eb3305dbf48d0eff1e2 base:227ec68347fe7655d05d8d7f2e20da3a1889d0a1 -->
  Head `053e793cda96`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T10:17:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #202 [Keep connectors signed in across restarts: refresh each token once, and never wipe a sign-in by mistake](https://github.com/eduwxyz/tucano/pull/202) <!-- head:d39c0d431e17bf74e54539c0f4007e26f61f63dd base:2ae22a02f4c214acaa08d7e9c1545c3a2581d731 -->
  Head `d39c0d431e17`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T10:25:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #206 [Privacy policy: the iPhone's notifications through tucano.sh](https://github.com/eduwxyz/tucano/pull/206) <!-- head:c310559f4b372783c8771ca724ddfe700cadbae2 base:a89cd8455cbe94bbb99fe7f413e1a84da8b676a5 -->
  Head `c310559f4b37`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T13:32:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #207 [Sync the wiki with a git repository, so a Tucano on a server can use an Obsidian vault](https://github.com/eduwxyz/tucano/pull/207) <!-- head:eb04aa6f83b986b127ba8ff7998c0218d50a96d4 base:46019e05d2a722c69569c3fc75af813d16903730 -->
  Head `eb04aa6f83b9`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T14:16:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #212 [Send an attached image only in its own turn, and ask to authorize a Google connector with no working sign-in](https://github.com/eduwxyz/tucano/pull/212) <!-- head:79cc6f5ef286fc4df49e5cd963aebfe8f8a70d41 base:a38b599a5cf9f3f75435c5fdc6c36e53ec572e95 -->
  Head `79cc6f5ef286`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T19:05:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #226 [Say why a connector can't connect on a company network; trust the system's certificates and proxy](https://github.com/eduwxyz/tucano/pull/226) <!-- head:eb4d9ba5535d26970a826eadd79c95e0e4553d25 base:c583e45787dc2166d0c17a65bbde0883c78541cb -->
  Head `eb4d9ba5535d`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T13:59:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #266 [Wiki: Approve all, and switching to Automatic puts in what was waiting](https://github.com/eduwxyz/tucano/pull/266) <!-- head:5db0d2d64691ac9d476c40cf4f67f6b9aa55e525 base:35db1c360e5178ee7daf6c8a635a79ae031fcf59 -->
  Head `5db0d2d64691`; MERGED; author eduwxyz; age 5 days; updated 2026-11-10T09:36:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #280 [Take a computer's Tucano to a server whole: Export everything and Restore a backup](https://github.com/eduwxyz/tucano/pull/280) <!-- head:85229b53588f662ee4149d2aee2091c991a953c5 base:3149d426e952e66ffd57c2d6cfb1cbed2be70ff7 -->
  Head `85229b53588f`; MERGED; author eduwxyz; age 5 days; updated 2026-11-10T13:05:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #291 [Add Keenable to the connector store](https://github.com/eduwxyz/tucano/pull/291) <!-- head:674694714132d89abfd19028f74d5c906b073e3f base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `674694714132`; CLOSED; author ilya-bogin-keenable; age 5 days; updated 2026-11-12T09:07:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #357 [Keep the wiki map from collapsing as the wiki grows](https://github.com/eduwxyz/tucano/pull/357) <!-- head:c72da93ddb5c2db2c1449ef735317a02e0cd0e11 base:a3443a121f0e5343c184350428bb626c1a7eece7 -->
  Head `c72da93ddb5c`; MERGED; author brunolellis; age 4 days; updated 2026-11-12T08:43:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #359 [feat(nav): add back/forward navigation history](https://github.com/eduwxyz/tucano/pull/359) <!-- head:c5d0e09333e29acc619ff23a4caadebe984b32da base:b436f4af311e31259e50fc466c4289e32fb51b3e -->
  Head `c5d0e09333e2`; OPEN; author jonatas-caram-ifood; age 4 days; updated 2026-11-11T13:00:31Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #439 [Add Supabase to the connector store](https://github.com/eduwxyz/tucano/pull/439) <!-- head:efb1daeacd2245c0bce475dcb1175846f2c0dd6b base:9ff13bfada84b1881d62d3f3db2c162e2ad62085 -->
  Head `efb1daeacd22`; MERGED; author eduwxyz; age 1 days; updated 2026-11-13T23:05:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #440 [Stop a connector like Vercel's asking to authorize again every day](https://github.com/eduwxyz/tucano/pull/440) <!-- head:e1849ecfbdc7bb60ef35581bda4f337210d4452c base:9ff13bfada84b1881d62d3f3db2c162e2ad62085 -->
  Head `e1849ecfbdc7`; MERGED; author eduwxyz; age 1 days; updated 2026-11-13T23:15:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #474 [ElevenLabs in the connector store, signing in on a server by client metadata document](https://github.com/eduwxyz/tucano/pull/474) <!-- head:08a9c45d61fc47dbcf9132bdae2cc4013628899c base:6a7153994b7b98488402df206e5a8f4fdc4da853 -->
  Head `08a9c45d61fc`; OPEN; author eialanjones; age 0 days; updated 2026-11-15T14:53:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #476 [WhatsApp for agents: numbers with per-conversation access, approvals and send limits](https://github.com/eduwxyz/tucano/pull/476) <!-- head:e376ed1e9201f7b20f1a8a8d4eda28efe07cf215 base:6a7153994b7b98488402df206e5a8f4fdc4da853 -->
  Head `e376ed1e9201`; OPEN; author eialanjones; age 0 days; updated 2026-11-15T20:21:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #478 [Keep a restricted member's wiki to what they see](https://github.com/eduwxyz/tucano/pull/478) <!-- head:7ba7ea517350413e48e6ccf5450382d384e5c2ed base:6a7153994b7b98488402df206e5a8f4fdc4da853 -->
  Head `7ba7ea517350`; MERGED; author eduwxyz; age 0 days; updated 2026-11-15T15:26:07Z; integration ancestry: inspect equivalence; review: not reviewed.

## Execution, cancellation and reliability

- [ ] #2 [Add OpenCode V2 as a second engine option alongside V1](https://github.com/eduwxyz/tucano/pull/2) <!-- head:30aeeceafcc060f51aa778b725cc5675a1e0b88a base:2c18036d80663d0eeccad7cbb63aa4b8d9413eb0 -->
  Head `30aeeceafcc0`; MERGED; author paulo-oliveira-ifood; age 18 days; updated 2026-10-29T01:13:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #4 [Run typecheck, tests and the build on macOS and Linux in CI](https://github.com/eduwxyz/tucano/pull/4) <!-- head:ab6dbfb5edb54ed6ebc16e548c46fdb0528c5b68 base:b9547c8166de67adca1e613c1e65dbd63b944a0f -->
  Head `ab6dbfb5edb5`; MERGED; author eduwxyz; age 17 days; updated 2026-10-29T10:04:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #5 [Run the app on Linux](https://github.com/eduwxyz/tucano/pull/5) <!-- head:63fc2a06696368a6891ec8607dfb5bd08cf1772e base:b9e3e095909e493ab7ca8017fba569ba6005e651 -->
  Head `63fc2a066963`; MERGED; author eduwxyz; age 17 days; updated 2026-10-29T10:14:18Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #7 [Run on Windows](https://github.com/eduwxyz/tucano/pull/7) <!-- head:93b50fc01ac7f4c3106791c3cbca75e8a9668cb3 base:e1cda2c6600948e37bb1ac9e8a886659f44572a1 -->
  Head `93b50fc01ac7`; MERGED; author edusouza; age 17 days; updated 2026-10-31T01:52:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #8 [Add hermes as a harness](https://github.com/eduwxyz/tucano/pull/8) <!-- head:f5d0292057c4572145bcf67a9d4b7690b050f14c base:670c3eea3fa236d740ebf1807e442a5f94b3fdbe -->
  Head `f5d0292057c4`; MERGED; author bbarin; age 17 days; updated 2026-11-14T11:43:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #12 [Keep the harness select when a single harness is in use](https://github.com/eduwxyz/tucano/pull/12) <!-- head:1a323cdaf8b8b5dd8833148b9617005918f8b214 base:d684bee21539138b384ed032166e61e6f313711b -->
  Head `1a323cdaf8b8`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T18:24:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #20 [Run lanes per conversation with the wait made visible; one browser tab per thread](https://github.com/eduwxyz/tucano/pull/20) <!-- head:97d570345c4c9d3dac30e0de3a8f2a22dee70aa0 base:d14af097c345c16b3f9f173f18a124d7c19076b7 -->
  Head `97d570345c4c`; CLOSED; author GianCdM; age 16 days; updated 2026-11-15T09:21:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #21 [Working pulse on channels; a reply that lands while you're away marks unread](https://github.com/eduwxyz/tucano/pull/21) <!-- head:b7f01fbd9fc1e4672569d9fdb534fc12d43a4daa base:d14af097c345c16b3f9f173f18a124d7c19076b7 -->
  Head `b7f01fbd9fc1`; MERGED; author GianCdM; age 16 days; updated 2026-10-31T13:15:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #25 [Let agents run on Gemini CLI](https://github.com/eduwxyz/tucano/pull/25) <!-- head:2102718f1429d142cf88efd19f4abd4a40bc9a64 base:0e48d2aa1aa1f26a621fd73dc9488165b85f642b -->
  Head `2102718f1429`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T02:16:40Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #26 [Install a harness from the app](https://github.com/eduwxyz/tucano/pull/26) <!-- head:a4075ce50c2ae68cbbd450a449020cd83aec6215 base:0e48d2aa1aa1f26a621fd73dc9488165b85f642b -->
  Head `a4075ce50c2a`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T02:16:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #27 [Run Tucano on a server, used from a browser](https://github.com/eduwxyz/tucano/pull/27) <!-- head:4166cbc8a9d97da6039f147c296331d55847b161 base:c8b2bc47b9ae65fcbb7f5edac4f594415ae40800 -->
  Head `4166cbc8a9d9`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T04:47:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #29 [Truncate long agent roles in sidebar](https://github.com/eduwxyz/tucano/pull/29) <!-- head:3199d3f1cdebb566816de95f68aa46030fa294f3 base:b4a889fa95178f0b64bbb0a21acd700a561527d8 -->
  Head `3199d3f1cdeb`; MERGED; author marcelogrcia; age 15 days; updated 2026-11-01T00:14:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #32 [Add contextual replies to messages and excerpts](https://github.com/eduwxyz/tucano/pull/32) <!-- head:3d82cf8f72d6534c7dedb29b582e2e0af3231bae base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `3d82cf8f72d6`; OPEN; author marcelogrcia; age 14 days; updated 2026-11-13T20:54:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #35 [OpenCode: preserve plugins from user config to support plugin-provided models](https://github.com/eduwxyz/tucano/pull/35) <!-- head:a4b8cb50126cf4ea4c8713cf3f94e5e8736baa20 base:7c5ea6e5127bf4f8167ca8ca0a342b6ce3a6de3c -->
  Head `a4b8cb50126c`; CLOSED; author calintro; age 14 days; updated 2026-11-05T12:37:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #47 [Run agents on Gemini: a custom model id with that prefix fell back to Claude](https://github.com/eduwxyz/tucano/pull/47) <!-- head:60caaf37fd7f09eff0d39e3e0721c12757a0c257 base:7c5ea6e5127bf4f8167ca8ca0a342b6ce3a6de3c -->
  Head `60caaf37fd7f`; MERGED; author rayanneblima; age 14 days; updated 2026-11-01T22:53:13Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #54 [Keep what a reply was asked when trying it again by hand](https://github.com/eduwxyz/tucano/pull/54) <!-- head:0bc30b8dfc1d1b3224cc1209d5600e01593cb498 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `0bc30b8dfc1d`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T01:42:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #71 [Let agents run on more than one Claude Code or Codex account](https://github.com/eduwxyz/tucano/pull/71) <!-- head:33a85ab57658c156c7a193d1c581adc978f73fce base:6c391cb9785604414c476c23485ac2c0cbc06600 -->
  Head `33a85ab57658`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T17:57:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #72 [Let the reserve model run on another account of the same harness](https://github.com/eduwxyz/tucano/pull/72) <!-- head:56379e2af6a03209e73b9f8f6918f699d4bb26bd base:ff200e9865d666a10c1535f06bb97420b1e151d1 -->
  Head `56379e2af6a0`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T18:14:18Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #79 [Add Cursor CLI as a harness](https://github.com/eduwxyz/tucano/pull/79) <!-- head:09d3a73c1255c34dbae34dca118265cabc0300a0 base:5107a636965d4163bc7eac0b6468953f0f57a375 -->
  Head `09d3a73c1255`; MERGED; author eduwxyz; age 12 days; updated 2026-11-03T02:07:07Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #84 [Send a routine's whole reply to Telegram instead of cutting it at 140 characters](https://github.com/eduwxyz/tucano/pull/84) <!-- head:03cd4043ee575167419aee701ab3685c7ccdccff base:cdc70feb56f4ac29c74a9de46dff2d6b514ff61d -->
  Head `03cd4043ee57`; MERGED; author cleitoncsalvagni; age 12 days; updated 2026-11-05T14:35:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #85 [Add Telegram task triage and opt-in finished replies](https://github.com/eduwxyz/tucano/pull/85) <!-- head:00a9ddb5a56a81a9f68fa91357cc9a24f6a8f066 base:cdc70feb56f4ac29c74a9de46dff2d6b514ff61d -->
  Head `00a9ddb5a56a`; OPEN; author b7s; age 12 days; updated 2026-11-03T20:24:31Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #87 [Add Grok CLI as a harness](https://github.com/eduwxyz/tucano/pull/87) <!-- head:4164877497f07a443850c6aec09644fee03da3cc base:1f86d8df4608b42e9d4d1d59548fc3285fcc909b -->
  Head `4164877497f0`; MERGED; author matheus-apolonio; age 12 days; updated 2026-11-05T19:56:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #104 [Make the limit on chained agent replies a setting](https://github.com/eduwxyz/tucano/pull/104) <!-- head:d4b90d74b92a2b6a4de853bf51e3e371cb417639 base:3e71b64d0d416ad4c8f214af3300dc13c2b0f03e -->
  Head `d4b90d74b92a`; CLOSED; author eialanjones; age 11 days; updated 2026-11-06T08:58:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #107 [[UI/UX] Keep the thread panel inside its bounds and open it at the latest reply](https://github.com/eduwxyz/tucano/pull/107) <!-- head:0e7b1174d2978349037ed4ffeaaaefa33b4f1087 base:b7bdd4f0326cd5d7d0b7e7c7ebb8acba012078b8 -->
  Head `0e7b1174d297`; MERGED; author cleitoncsalvagni; age 11 days; updated 2026-11-05T14:35:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #108 [End a Claude reply as soon as its text ends](https://github.com/eduwxyz/tucano/pull/108) <!-- head:49553746d2770e3c83df94356cc53ba33c9d2d17 base:f5b409712309b2bd3cce3e884de122f370e876db -->
  Head `49553746d277`; MERGED; author rjgdias; age 11 days; updated 2026-11-05T01:26:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #111 [Messages sent while an agent answers wait and go together, with "Orientar agora"](https://github.com/eduwxyz/tucano/pull/111) <!-- head:1130786b925a396e9172221f82264052c505fb2f base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `1130786b925a`; OPEN; author rjgdias; age 11 days; updated 2026-11-07T00:26:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #115 [Let long Claude replies past the 32k output token cap](https://github.com/eduwxyz/tucano/pull/115) <!-- head:1ebb3f06e2d113783b051bff731849fc25b3c67e base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `1ebb3f06e2d1`; CLOSED; author rjgdias; age 11 days; updated 2026-11-04T21:16:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #124 [fix: dictation settings spacing, color standardization and advanced collapse](https://github.com/eduwxyz/tucano/pull/124) <!-- head:a5f547c6c6f667c6daee21a7384d3c0f83b9c41e base:f3ceb5ba170987f61eeea9a4537c631a3b9c4a59 -->
  Head `a5f547c6c6f6`; MERGED; author b7s; age 10 days; updated 2026-11-05T01:13:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #135 [Show what each tool call, skill and command did, as it runs](https://github.com/eduwxyz/tucano/pull/135) <!-- head:42c75b4a0c35432c15530adc77d0e8e7efefc2b0 base:950e3e049c1316ea62c9a2c5b9fc3640d77f390e -->
  Head `42c75b4a0c35`; MERGED; author rjgdias; age 10 days; updated 2026-11-05T20:50:31Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #137 [Make an alarm triage take minutes, not 35: wait on pending results, read only the window](https://github.com/eduwxyz/tucano/pull/137) <!-- head:eca097ef9b101ed2f2ffa75d01113aeefbabb720 base:33f83b96a335c75798d6334793132c6155ee6b3d -->
  Head `eca097ef9b10`; MERGED; author rjgdias; age 10 days; updated 2026-11-06T00:04:12Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #139 [Let the router decide whether a mentioned agent needs to answer another agent](https://github.com/eduwxyz/tucano/pull/139) <!-- head:1213d9082f1cbb6eb4c4403cc425885edab170e1 base:3127e7dc2a4fd3a78f640967777e6f8ae125bf5f -->
  Head `1213d9082f1c`; MERGED; author eialanjones; age 10 days; updated 2026-11-05T18:21:47Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #143 [Open the agents' Chrome on a Linux server without waiting for the keyring](https://github.com/eduwxyz/tucano/pull/143) <!-- head:338f756903862dedd692fea682a4dfa6b3e075f9 base:4e998f1e8d43e1c28b0744f63afd70464700428e -->
  Head `338f75690386`; MERGED; author daniellcar; age 10 days; updated 2026-11-05T16:19:10Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #145 [[Enhancement] Answer an agent's decisions one at a time, with options to pick](https://github.com/eduwxyz/tucano/pull/145) <!-- head:76c206f4c5734e050130e19930c4c7c9c91f875c base:c8be362c3a777bf2ab409298f1b54d8950d93843 -->
  Head `76c206f4c573`; MERGED; author cleitoncsalvagni; age 10 days; updated 2026-11-07T18:47:02Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #147 [Keep a Claude Code session per agent and conversation, with its process open between replies](https://github.com/eduwxyz/tucano/pull/147) <!-- head:55e691b22676ca61c74e8f2cd6f41c8932df9000 base:9ebafe68fdd4f9cba9cf9cde950b70920c5f37ad -->
  Head `55e691b22676`; MERGED; author rjgdias; age 10 days; updated 2026-11-05T20:58:10Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #149 [Add GitHub Copilot CLI as a harness](https://github.com/eduwxyz/tucano/pull/149) <!-- head:5fc40ca70945b9fdbbf652547f1dadd1506b54c0 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `5fc40ca70945`; OPEN; author LittleGuava; age 9 days; updated 2026-11-13T14:14:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #151 [Reply once at a time per agent and thread, folding hand-offs into one follow-up](https://github.com/eduwxyz/tucano/pull/151) <!-- head:eb4597b15d93f245ee144182436dca6edd05693b base:bbd041267761b56f8987fc3a111de174a87456a7 -->
  Head `eb4597b15d93`; MERGED; author eialanjones; age 9 days; updated 2026-11-05T23:41:01Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #158 [Substituir harness Gemini CLI pelo Antigravity CLI](https://github.com/eduwxyz/tucano/pull/158) <!-- head:a2c51f48124bb44c6e643b8db551d95fcfd20a75 base:58afa9756e92af93ede2850be66fccc8f7a314e5 -->
  Head `a2c51f48124b`; MERGED; author Vialc; age 9 days; updated 2026-11-08T21:43:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #162 [Make the limit on chained agent replies a setting](https://github.com/eduwxyz/tucano/pull/162) <!-- head:e6b5321442a53d1fd721701b432a654f63c84aa2 base:ff8323a0746779b391ece5a7bc9abcc854203e31 -->
  Head `e6b5321442a5`; MERGED; author eialanjones; age 9 days; updated 2026-11-07T15:12:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #171 [Let the hand-off screen see mentions at the end of a long reply](https://github.com/eduwxyz/tucano/pull/171) <!-- head:474785f0d87a6ce98a4a1dd14fb61dfd7182f7b9 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `474785f0d87a`; MERGED; author eialanjones; age 9 days; updated 2026-11-06T23:26:59Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #173 [Show replies in the order they ended](https://github.com/eduwxyz/tucano/pull/173) <!-- head:d07493b855041cd8ec4fedf47d137bf668bd819a base:e21e204e7f92a3172ccca0520db112f92bf4fa67 -->
  Head `d07493b85504`; MERGED; author rjgdias; age 9 days; updated 2026-11-06T23:32:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #174 [Warn without blocking long skill recipes](https://github.com/eduwxyz/tucano/pull/174) <!-- head:2e0f6e84df495c9c53f8d02cc2aa2f5df00ac1b2 base:03577a3eb880a14ee18ba7e313085eff958bc026 -->
  Head `2e0f6e84df49`; MERGED; author GianCdM; age 9 days; updated 2026-11-07T14:56:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #179 [Faster replies and a lighter window](https://github.com/eduwxyz/tucano/pull/179) <!-- head:89eec7e7cecc2943126281bb9e7ca0041ad860ad base:219a539c0bcfee27eced830e463ea1b18ee49903 -->
  Head `89eec7e7cecc`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T12:55:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #186 [Follow a Databricks run from a live card, and show a query's rows as a table](https://github.com/eduwxyz/tucano/pull/186) <!-- head:831f1d9f03f4b2378246b7c36b32a5ebedd32843 base:35db1c360e5178ee7daf6c8a635a79ae031fcf59 -->
  Head `831f1d9f03f4`; OPEN; author rjgdias; age 8 days; updated 2026-11-09T19:30:01Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #195 [Tucano Pro on the site: early-access waitlist, plans and prices](https://github.com/eduwxyz/tucano/pull/195) <!-- head:e8e0b629f96ca1705526e161d11c4a928726ceb8 base:51b823b34d6345205c343919d7b2c397e0142169 -->
  Head `e8e0b629f96c`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T02:06:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #198 [Sign a harness in on a server from the browser or the phone](https://github.com/eduwxyz/tucano/pull/198) <!-- head:69f1a4f1ba059c5b092e7ceb85dcbdaf0cef2d6e base:7e85fca2a22175843a86a53dc2aadd228cfba739 -->
  Head `69f1a4f1ba05`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T10:04:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #201 [Split Windows tests across four runners and skip CI for site and docs changes](https://github.com/eduwxyz/tucano/pull/201) <!-- head:a2a691e4c70cbbb598ba3e9f8dda809eaea9f4ff base:55bf5c98c4e3c211609d2b1f714c1554a75b8290 -->
  Head `a2a691e4c70c`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T09:30:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #224 [Add Cline CLI as a harness](https://github.com/eduwxyz/tucano/pull/224) <!-- head:525104f8a16cd06847a187afb1983aebe41bec29 base:19b01c5856f981ff3a76858a32ae35f2a1e503e9 -->
  Head `525104f8a16c`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T11:42:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #257 [Make OpenCode's free models work, and stop a reply when its model call fails](https://github.com/eduwxyz/tucano/pull/257) <!-- head:96362e15a4c97764812c7d290d3988000efbdc49 base:61a1f9ebc9f6bf2da54642605d8c79ba030fda95 -->
  Head `96362e15a4c9`; MERGED; author eduwxyz; age 5 days; updated 2026-11-10T11:58:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #358 [Keep one reply at a time per agent and thread on every path, not only routed and handed-off ones](https://github.com/eduwxyz/tucano/pull/358) <!-- head:97954b633f50decc7d51e57e79cf6146be13023a base:b30b3f309a12931acdf681385240a972b6bd0c3a -->
  Head `97954b633f50`; MERGED; author eialanjones; age 4 days; updated 2026-11-12T08:43:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #394 [Show what a reply changed in the code, as a diff opened file by file](https://github.com/eduwxyz/tucano/pull/394) <!-- head:9941c6770974a74f193bfe560b9e8633153c923e base:04539404e545323124e5dd4737098892cd746226 -->
  Head `9941c6770974`; OPEN; author b7s; age 3 days; updated 2026-11-14T20:44:08Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #404 [Let each person keep a reply's steps closed while the agent works](https://github.com/eduwxyz/tucano/pull/404) <!-- head:9f714755b70ce48874570d44eacd165e314b9cd8 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `9f714755b70c`; MERGED; author eialanjones; age 2 days; updated 2026-11-14T00:16:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #438 [Stop a Codex agent failing every other reply with "Codex no longer has this conversation"](https://github.com/eduwxyz/tucano/pull/438) <!-- head:9dd93f81b6b4fc8148168fcd9a896152d273eadb base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `9dd93f81b6b4`; MERGED; author eduwxyz; age 1 days; updated 2026-11-13T23:00:23Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #442 [Balance replies between the accounts of a harness, and show every account on Usage and limits](https://github.com/eduwxyz/tucano/pull/442) <!-- head:063931337586eec8823ed2609a6145d5393950a1 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `063931337586`; OPEN; author eialanjones; age 1 days; updated 2026-11-14T23:37:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #450 [Keep a monthly limit the database can read, and give "no limit" a real ceiling per reply](https://github.com/eduwxyz/tucano/pull/450) <!-- head:38ca99e406fd88ab141b6882d07e0c5f246ee757 base:2d1b797e46121ab885ec071320ab2f398b4e6845 -->
  Head `38ca99e406fd`; MERGED; author eduwxyz; age 1 days; updated 2026-11-14T10:35:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #479 [Run an answer back for whoever asked, within what they all see](https://github.com/eduwxyz/tucano/pull/479) <!-- head:846bae289a7dc57ce8e0f6cb2d7e3a6cd697e3c8 base:1a8b82073adf63a134f572feeb364ac6dd2e1269 -->
  Head `846bae289a7d`; MERGED; author eduwxyz; age 0 days; updated 2026-11-15T14:44:16Z; integration ancestry: inspect equivalence; review: not reviewed.

## Features, usability and accessibility

- [ ] #1 [Fix: discover plugin skills declared outside skills/ in the manifest](https://github.com/eduwxyz/tucano/pull/1) <!-- head:33c67227c76d1a2b3c8384b4194d45e414c38cea base:28a3c3b486b9c190682d1f26f93ccbb64c4d22e8 -->
  Head `33c67227c76d`; MERGED; author GianCdM; age 18 days; updated 2026-10-28T16:25:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #3 [Update the app by itself from GitHub releases](https://github.com/eduwxyz/tucano/pull/3) <!-- head:5ee9234436a78ce5f25953eee5db0dd0e1758b83 base:64a162e7ce8fbd36692fd42f6eaa4d4a4f4e117f -->
  Head `5ee9234436a7`; MERGED; author eduwxyz; age 17 days; updated 2026-10-29T01:49:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #6 [Linux installers, install.sh, docs and the site](https://github.com/eduwxyz/tucano/pull/6) <!-- head:bf588151d3708a75c56606f8470f013c98aa8298 base:f24e2ba3e56de5d285a978a2286489ade31fe43b -->
  Head `bf588151d370`; MERGED; author eduwxyz; age 17 days; updated 2026-10-29T10:14:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #9 [Install and update on Windows](https://github.com/eduwxyz/tucano/pull/9) <!-- head:63d40b87f9e1c3507b2378745a3e1b9df484ece8 base:f0924817370c0af76a9f4dfb23b29ac354ae1d32 -->
  Head `63d40b87f9e1`; MERGED; author eduwxyz; age 16 days; updated 2026-10-30T09:27:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #11 [Keep an unsent message when you leave the conversation](https://github.com/eduwxyz/tucano/pull/11) <!-- head:8ec4557ddb80c33babe8e88c1f3e932ff84b6d38 base:0c8da938668ac43a3bf2d1006b45bd166db27de8 -->
  Head `8ec4557ddb80`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T18:40:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #13 [Keep a channel's archived agents out of the room](https://github.com/eduwxyz/tucano/pull/13) <!-- head:1ab7509ee59e64533857c5fc5169950cf456fac1 base:bc08fd4e6faa6e00dabe31cf1c2183b124758073 -->
  Head `1ab7509ee59e`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T18:16:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #14 [Find skills whose folder is a symlink](https://github.com/eduwxyz/tucano/pull/14) <!-- head:d3f7c72b84f4c3ac76e082ce7c8054f79fb2853f base:bc08fd4e6faa6e00dabe31cf1c2183b124758073 -->
  Head `d3f7c72b84f4`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T18:09:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #15 [Copy button on message code blocks; don't bold mentions inside code](https://github.com/eduwxyz/tucano/pull/15) <!-- head:46d4cca2d9533e2ebc457de8364a441facd31b0d base:f48fb5c6877f7a557b11857572c9867c4aa2a09c -->
  Head `46d4cca2d953`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T17:39:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #16 [Don't trigger agents for handles quoted inside code](https://github.com/eduwxyz/tucano/pull/16) <!-- head:05d48ebda98d46d5ecaa71d79a8c05934925a32b base:bc08fd4e6faa6e00dabe31cf1c2183b124758073 -->
  Head `05d48ebda98d`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T16:52:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #17 [Amplia a cobertura de terminais Linux e documenta a validação no CachyOS/Niri](https://github.com/eduwxyz/tucano/pull/17) <!-- head:39c9778373a0f00c3ef200f53a279f0efa742f26 base:11e904f7b2b70aa5e3b9f10237956b836371f440 -->
  Head `39c9778373a0`; MERGED; author nandomoreirame; age 16 days; updated 2026-10-30T19:21:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #18 [Handing the browser back resumes a pending ask_user](https://github.com/eduwxyz/tucano/pull/18) <!-- head:5515fd93e55d0a431eea77af00bec45fe60b685f base:0ef815d91fe7ab143a4e1abcb601e619b826f034 -->
  Head `5515fd93e55d`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T20:59:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #19 [Open message links in the real browser](https://github.com/eduwxyz/tucano/pull/19) <!-- head:196d673894f4decd05c7d507f9191db8d327d775 base:0ef815d91fe7ab143a4e1abcb601e619b826f034 -->
  Head `196d673894f4`; MERGED; author GianCdM; age 16 days; updated 2026-10-30T21:15:07Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #22 [Add WSL 2 execution target on Windows](https://github.com/eduwxyz/tucano/pull/22) <!-- head:79b2edbb7a1ccc7cc001cf18e3944d775c85ff69 base:b4a889fa95178f0b64bbb0a21acd700a561527d8 -->
  Head `79b2edbb7a1c`; OPEN; author anota-ai-andrey; age 15 days; updated 2026-11-15T09:23:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #23 [Add a Tuca model picker](https://github.com/eduwxyz/tucano/pull/23) <!-- head:2784c9c53dfe99c41790f652ebd11624d94a98c2 base:0ecaee4e5336b88a66f3049213eb5b2ddbb4e73f -->
  Head `2784c9c53dfe`; MERGED; author anota-ai-andrey; age 15 days; updated 2026-10-31T13:19:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #24 [Find CLIs in their install folders even when PATH lacks them](https://github.com/eduwxyz/tucano/pull/24) <!-- head:27c460bd90990dd3346f9f9802e5705b01bcce06 base:739ff2530ed6f4f9e4664689b18269cfe5aad358 -->
  Head `27c460bd9099`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T01:54:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #28 [Make the app usable on a phone](https://github.com/eduwxyz/tucano/pull/28) <!-- head:c52aa9d7d541bb2bdf08f9159086766b87adc5a5 base:fb199d451b1f9965c9d065e43a0d7a3254e7ef68 -->
  Head `c52aa9d7d541`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T09:00:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #30 [Try a failed routine again, twice, before giving up](https://github.com/eduwxyz/tucano/pull/30) <!-- head:0fb61db0e1ebf63353343cf54e0328e4269a0ca4 base:b4a889fa95178f0b64bbb0a21acd700a561527d8 -->
  Head `0fb61db0e1eb`; MERGED; author eduwxyz; age 15 days; updated 2026-10-31T15:27:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #31 [Desktop apps: agents use the person's apps on macOS, Windows and Linux](https://github.com/eduwxyz/tucano/pull/31) <!-- head:ced6023b00e853928a4657e92af9baf12c9e06c5 base:d0aaeb7bdaee5fc41495fe1bbbcbfa10e9008e0c -->
  Head `ced6023b00e8`; MERGED; author eduwxyz; age 14 days; updated 2026-11-01T02:55:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #33 [List Codex's own models instead of a fixed three](https://github.com/eduwxyz/tucano/pull/33) <!-- head:793d54b0d9176e9caae88aa70ec6a20d57aa81d4 base:06fa035737d9d0801a8eba62fc8b22e5d7da494f -->
  Head `793d54b0d917`; MERGED; author eduwxyz; age 14 days; updated 2026-11-01T01:19:24Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #34 [Sign in on Windows from a user folder with accents; pick the sign-in up by itself](https://github.com/eduwxyz/tucano/pull/34) <!-- head:59751f7df18e3a2f90f6ee9ccec5c45df8a5fafc base:06fa035737d9d0801a8eba62fc8b22e5d7da494f -->
  Head `59751f7df18e`; MERGED; author eduwxyz; age 14 days; updated 2026-11-01T01:19:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #48 [Break long links and words in messages instead of pushing them out of the conversation](https://github.com/eduwxyz/tucano/pull/48) <!-- head:e585f6c0963a38d12df29b640535806a63e4675f base:7c5ea6e5127bf4f8167ca8ca0a342b6ce3a6de3c -->
  Head `e585f6c0963a`; MERGED; author rayanneblima; age 14 days; updated 2026-11-01T23:00:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #50 [Tuca proposes agents on Gemini models too](https://github.com/eduwxyz/tucano/pull/50) <!-- head:72898a9c498e4dbb0aeefadc073e6d597d8b4681 base:c7277f0955a73aa61e15a1141dbf933fc5436d32 -->
  Head `72898a9c498e`; MERGED; author eduwxyz; age 13 days; updated 2026-11-01T22:56:02Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #53 [Keep a recent login when an agent's Chrome closes or takes a window](https://github.com/eduwxyz/tucano/pull/53) <!-- head:e2e873180edb86b7b22caeef9acfdd3f2c8b3349 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `e2e873180edb`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T01:37:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #55 [Keep a Codex model with priority 0 at the top of the list](https://github.com/eduwxyz/tucano/pull/55) <!-- head:6ce080e0b6d03f99b55b5e883e40cb2e97bfa1f9 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `6ce080e0b6d0`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T01:56:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #56 [Make the labels of app actions follow the language chosen](https://github.com/eduwxyz/tucano/pull/56) <!-- head:53ec59bf2e7d447ea003bf054fc32e34fd4bbcbf base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `53ec59bf2e7d`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T01:58:16Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #57 [Say which characters can't be typed in an app, instead of dropping them](https://github.com/eduwxyz/tucano/pull/57) <!-- head:b86f3686b5bbec5ab9b29e994a5d0ca3ad048678 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `b86f3686b5bb`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T01:58:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #58 [Open chat images the size of the window, with zoom](https://github.com/eduwxyz/tucano/pull/58) <!-- head:7cf806d894236b65458e761659697b467d0385b5 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `7cf806d89423`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T23:11:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #59 [Let an agent have a color of its own or a picture](https://github.com/eduwxyz/tucano/pull/59) <!-- head:4e3a33c85c5965e67f00052d55f88c6b4cae7075 base:72fc9aa58eb9f0d38e068ef50c0ee13b87ffbe5f -->
  Head `4e3a33c85c59`; MERGED; author rayanneblima; age 13 days; updated 2026-11-02T23:28:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #60 [Dictate messages with a local whisper-cli](https://github.com/eduwxyz/tucano/pull/60) <!-- head:b40751fe470956922a65a5b8f37d2ec59a3abbc2 base:25e371428594b5cc434fd7812eb9416ecccc3af2 -->
  Head `b40751fe4709`; MERGED; author rayanneblima; age 13 days; updated 2026-11-04T09:24:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #61 [Make file paths in agents' messages clickable](https://github.com/eduwxyz/tucano/pull/61) <!-- head:c2fb113fc02b0c4c412f93a05b750034fa529659 base:cbe59f1a68603401c0463c833946b850cbe516ce -->
  Head `c2fb113fc02b`; MERGED; author rayanneblima; age 13 days; updated 2026-11-04T02:29:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #62 [Fold the sidebar's sections](https://github.com/eduwxyz/tucano/pull/62) <!-- head:efa4d34e8b350e2321b207ab05f0ee7d6da91111 base:abeb15039a17f69e87d8b0df90a1e30059a1f179 -->
  Head `efa4d34e8b35`; MERGED; author BrisaTielly; age 13 days; updated 2026-11-02T01:16:52Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #65 [Let an agent act on its own where you choose](https://github.com/eduwxyz/tucano/pull/65) <!-- head:c7f90cdcbd562e279f8c9babe3ee666c04f0c5aa base:0501956d127699300209902e889f3e69a0948766 -->
  Head `c7f90cdcbd56`; CLOSED; author marcossimo; age 13 days; updated 2026-11-06T13:54:12Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #66 [feat: per-agent max enabled routines limit](https://github.com/eduwxyz/tucano/pull/66) <!-- head:9ed43b23fa2b4b96bd8b2752a2240d58bcd50625 base:1001bc9755dd95618ac6c2bdf1a861dea48420cd -->
  Head `9ed43b23fa2b`; MERGED; author b7s; age 13 days; updated 2026-11-02T23:02:52Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #67 [Add a setting to turn the notification sounds off](https://github.com/eduwxyz/tucano/pull/67) <!-- head:5bac9297d4e04012b1e6143bf2ff16c1a8704eb8 base:0501956d127699300209902e889f3e69a0948766 -->
  Head `5bac9297d4e0`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T17:07:15Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #68 [Show a large image when tucano.sh is shared](https://github.com/eduwxyz/tucano/pull/68) <!-- head:1f743dc9ba95244e17372e0d5514da15efb04c2f base:0501956d127699300209902e889f3e69a0948766 -->
  Head `1f743dc9ba95`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T17:07:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #69 [Build and release Tucano for Intel Macs too](https://github.com/eduwxyz/tucano/pull/69) <!-- head:de5ca4503eb7c23096a0456b02ff7dda93470a8b base:0501956d127699300209902e889f3e69a0948766 -->
  Head `de5ca4503eb7`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T17:10:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #70 [Let an agent fall back to a reserve model when its subscription is out](https://github.com/eduwxyz/tucano/pull/70) <!-- head:cd38837565c434f0e2467a2c7e653ac37cab9c89 base:0501956d127699300209902e889f3e69a0948766 -->
  Head `cd38837565c4`; MERGED; author eduwxyz; age 13 days; updated 2026-11-02T17:36:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #75 [Harden the server against bad requests and token guessing](https://github.com/eduwxyz/tucano/pull/75) <!-- head:93703568df68b83a09bc9c2859ea5ad689fe4295 base:cdc70feb56f4ac29c74a9de46dff2d6b514ff61d -->
  Head `93703568df68`; CLOSED; author JulioAkaminee; age 12 days; updated 2026-11-15T02:58:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #76 [Let an agent take a drawn avatar (Open Bot Avatar)](https://github.com/eduwxyz/tucano/pull/76) <!-- head:d16a9c2b8b14109d0abae6ce11f5c383faa0cc34 base:81649a0f5a6987375f897bea5a37bd5b652d4aa3 -->
  Head `d16a9c2b8b14`; MERGED; author eduwxyz; age 12 days; updated 2026-11-03T00:02:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #77 [Reorder and group channels in the sidebar](https://github.com/eduwxyz/tucano/pull/77) <!-- head:4bb57c7ccfefd2d4ab659f0c92512efab7d162b5 base:2fda298aa941c4a3ec4ab7ae00cba54dd8de7198 -->
  Head `4bb57c7ccfef`; MERGED; author rayanneblima; age 12 days; updated 2026-11-04T02:40:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #88 [Fix the reserve model not taking over on Claude Code's 5-hour limit](https://github.com/eduwxyz/tucano/pull/88) <!-- head:949b7513ea1dd2da50bc222cdd98f52879022ead base:cdc70feb56f4ac29c74a9de46dff2d6b514ff61d -->
  Head `949b7513ea1d`; MERGED; author eialanjones; age 12 days; updated 2026-11-03T23:47:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #89 [Fix Gemini CLI MCP settings path and configuration format](https://github.com/eduwxyz/tucano/pull/89) <!-- head:b2310a7c79060e1c727b2bd493977fe308c5963e base:8b7c069ab8e6d5c45cf1a3d19a2a3e5885a7b88b -->
  Head `b2310a7c7906`; MERGED; author simionatoambrosio; age 12 days; updated 2026-11-04T02:08:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #90 [Detect Gemini CLI models dynamically from installed package](https://github.com/eduwxyz/tucano/pull/90) <!-- head:1d3fd399bf2c82ff5920e8bdebd4acfbafe2e2d7 base:8b7c069ab8e6d5c45cf1a3d19a2a3e5885a7b88b -->
  Head `1d3fd399bf2c`; MERGED; author simionatoambrosio; age 12 days; updated 2026-11-04T02:19:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #91 [Import agents from OpenBot and Grok Bot](https://github.com/eduwxyz/tucano/pull/91) <!-- head:fcbf7da899607506e31eef2435faa2161b3e3ef0 base:cdc70feb56f4ac29c74a9de46dff2d6b514ff61d -->
  Head `fcbf7da89960`; MERGED; author eduwxyz; age 12 days; updated 2026-11-03T18:28:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #93 [Let agents coordinate a team and talk to each other](https://github.com/eduwxyz/tucano/pull/93) <!-- head:d42a98b50026b78bcc71657640d3b8db006230f5 base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `d42a98b50026`; CLOSED; author rjgdias; age 11 days; updated 2026-11-10T17:13:24Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #96 [Errors in people's words, toasts, a real confirm dialog and motion polish](https://github.com/eduwxyz/tucano/pull/96) <!-- head:e9fc3b04bce5347d5ae80038566084bc942b9235 base:399dd0ee65fc8cd0e416c7a9c9ca8531d84d5fab -->
  Head `e9fc3b04bce5`; MERGED; author eduwxyz; age 11 days; updated 2026-11-04T10:22:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #98 [Don't leave other apps' app.asar open when listing apps](https://github.com/eduwxyz/tucano/pull/98) <!-- head:17600f7a30d65068fed5319f0850b35dcc642048 base:def2458775855a7429b222cf5feae8d1f7d46b44 -->
  Head `17600f7a30d6`; MERGED; author eduwxyz; age 11 days; updated 2026-11-04T12:43:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #101 [Answer every message in a thread, and let a greeting reach everyone](https://github.com/eduwxyz/tucano/pull/101) <!-- head:7b137a48d0d54161f2c8dda13d712886c5a220a1 base:c88879db236933c53f5825fdd5d2f4b62d82b98f -->
  Head `7b137a48d0d5`; MERGED; author eduwxyz; age 11 days; updated 2026-11-04T13:30:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #103 [[UI] Wrap an agent's role instead of letting it spill out of the card](https://github.com/eduwxyz/tucano/pull/103) <!-- head:d1356af6b462c9d6ec7e0cd54f0b65296c103fe3 base:c88879db236933c53f5825fdd5d2f4b62d82b98f -->
  Head `d1356af6b462`; MERGED; author cleitoncsalvagni; age 11 days; updated 2026-11-05T14:35:20Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #105 [Grow a crowded hour on the calendar instead of pushing routines into later hours](https://github.com/eduwxyz/tucano/pull/105) <!-- head:2ab4aca4660a3d8e771b314025bc6e673d9c307b base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `2ab4aca4660a`; MERGED; author eialanjones; age 11 days; updated 2026-11-04T22:28:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #109 [Show @mentions as chips with the agent's color and avatar](https://github.com/eduwxyz/tucano/pull/109) <!-- head:7a2c8d0be5bdc5fb4a69269f184fd5365c05bc8b base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `7a2c8d0be5bd`; MERGED; author rjgdias; age 11 days; updated 2026-11-05T01:13:03Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #112 [Stop at once when an agent's computer is down, instead of trying every tool](https://github.com/eduwxyz/tucano/pull/112) <!-- head:2918fa5a7e8d669b60997189b3847945e269aed8 base:3472c134e938a9f6c228c860356d21f094dcc8b1 -->
  Head `2918fa5a7e8d`; MERGED; author rjgdias; age 11 days; updated 2026-11-05T01:58:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #113 [Keep an agent to the thread it's answering, apart from other subjects](https://github.com/eduwxyz/tucano/pull/113) <!-- head:f36b2d00f959125b665bb1dc912704c7de894dd1 base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `f36b2d00f959`; CLOSED; author rjgdias; age 11 days; updated 2026-11-05T00:44:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #116 [Turn off slow thinking for gateway models (like DeepSeek) on Low and Medium effort](https://github.com/eduwxyz/tucano/pull/116) <!-- head:5dc59ec839c460fd3156ef00c8777d0f60aea0a7 base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `5dc59ec839c4`; OPEN; author rjgdias; age 11 days; updated 2026-11-07T00:29:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #117 [Start every agent computer with the tools you pick](https://github.com/eduwxyz/tucano/pull/117) <!-- head:57f001f465c439952359689448b7620a32776585 base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `57f001f465c4`; OPEN; author rjgdias; age 11 days; updated 2026-11-07T00:31:32Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #118 [Fix a black screen when the server is opened over plain http](https://github.com/eduwxyz/tucano/pull/118) <!-- head:30eeb8e94e6c89e1a9c7e79d160e623f4a980443 base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `30eeb8e94e6c`; CLOSED; author vitoramaral10; age 11 days; updated 2026-11-07T00:59:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #119 [Open a thread at its latest message](https://github.com/eduwxyz/tucano/pull/119) <!-- head:8333a9c731e84c7f85f6333f654c6cff589822ca base:5bb3de8f310fb5565bae27996448d09b960ddb23 -->
  Head `8333a9c731e8`; MERGED; author rjgdias; age 10 days; updated 2026-11-05T01:13:01Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #120 [Keep each thread to itself, and let agents look the others up](https://github.com/eduwxyz/tucano/pull/120) <!-- head:07c592542a79917dba63cfc1e1473d7f4ced5e99 base:dd23f83d4ef14e3230fc50803cc9971d2d292ee0 -->
  Head `07c592542a79`; MERGED; author eduwxyz; age 10 days; updated 2026-11-04T23:16:02Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #123 [fix: prevent startup crash on unpacked dev builds](https://github.com/eduwxyz/tucano/pull/123) <!-- head:04ac0126646b3afe21a7a43a377ac25a18631541 base:db70e573cebf284b463b425db6fc37196ea47d22 -->
  Head `04ac0126646b`; MERGED; author b7s; age 10 days; updated 2026-11-05T19:00:24Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #126 [Answer in the conversation again, and let each conversation choose threads](https://github.com/eduwxyz/tucano/pull/126) <!-- head:39442f7b5b101eb25ae78a221dc8722a9d71dbc4 base:a64a88e562496f76d160191af4bbf30c13bf422c -->
  Head `39442f7b5b10`; MERGED; author eduwxyz; age 10 days; updated 2026-11-05T09:27:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #127 [Show what's new once after an update, in the app's language](https://github.com/eduwxyz/tucano/pull/127) <!-- head:59fe8fdac251ec699a284ffc7e9ebea6e52efc2d base:1be8610c91d3961be20953d5ed529b737c6505f1 -->
  Head `59fe8fdac251`; MERGED; author eduwxyz; age 10 days; updated 2026-11-05T09:43:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #130 [Redraw only the message that changed while an agent streams](https://github.com/eduwxyz/tucano/pull/130) <!-- head:21f4055506e7aa64af819394ae49ffc619839bc4 base:2f0b96492a87999a02a1cf8a0ce271507993d6ed -->
  Head `21f4055506e7`; CLOSED; author SchonsWeb; age 10 days; updated 2026-11-05T11:28:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #131 [Redraw only the message that changed while an agent streams](https://github.com/eduwxyz/tucano/pull/131) <!-- head:21f4055506e7aa64af819394ae49ffc619839bc4 base:2f0b96492a87999a02a1cf8a0ce271507993d6ed -->
  Head `21f4055506e7`; CLOSED; author SchonsWeb; age 10 days; updated 2026-11-05T11:29:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #132 [Redesenha só a mensagem que mudou enquanto um agente responde](https://github.com/eduwxyz/tucano/pull/132) <!-- head:f10f0e5e0f40a6f91a403f6594a4df56ce6a0775 base:2f0b96492a87999a02a1cf8a0ce271507993d6ed -->
  Head `f10f0e5e0f40`; MERGED; author SchonsWeb; age 10 days; updated 2026-11-05T16:02:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #134 [Open an agent's profile card from its face or name](https://github.com/eduwxyz/tucano/pull/134) <!-- head:f45eec53267435b61e833c6a20a4a1e84d6d9b80 base:043acfb6f112d277f03f4ac03e585801bddfb2b5 -->
  Head `f45eec532674`; MERGED; author rjgdias; age 10 days; updated 2026-11-07T17:36:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #136 [Keep the team in one .md file, and import a newer one as changes to review](https://github.com/eduwxyz/tucano/pull/136) <!-- head:fd581c6b1f5af8fbc6724d83a805194c45cc3d33 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `fd581c6b1f5a`; OPEN; author rjgdias; age 10 days; updated 2026-11-06T12:27:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #140 [Show the toucan in the Linux dock and app menu](https://github.com/eduwxyz/tucano/pull/140) <!-- head:4d5823c40c4900b828fd4713ca253927668cd4e7 base:2f0b96492a87999a02a1cf8a0ce271507993d6ed -->
  Head `4d5823c40c49`; MERGED; author cleitoncsalvagni; age 10 days; updated 2026-11-05T17:58:15Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #142 [Make the server's page open over plain HTTP on a private address](https://github.com/eduwxyz/tucano/pull/142) <!-- head:9dceddcab69ab25c77c2258282ca028b7c4d024d base:08fde978a7b33831039c01d76bccf1e833620c2e -->
  Head `9dceddcab69a`; MERGED; author daniellcar; age 10 days; updated 2026-11-05T16:23:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #148 [Start Claude Code for whoever will answer while the person types](https://github.com/eduwxyz/tucano/pull/148) <!-- head:8654ef4997643eeb6f6fffb6571111a0f0ca230a base:ddf93549e4b71c1e2276e27e32712a83fa6ce38b -->
  Head `8654ef499764`; MERGED; author rjgdias; age 10 days; updated 2026-11-05T21:02:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #154 [Fix the stale selectors in screens.mjs](https://github.com/eduwxyz/tucano/pull/154) <!-- head:1334a2593d8fabf2cd36bd8757ea32005781cbc8 base:364f897e9051200201fc75b1a673365f56b2ab6c -->
  Head `1334a2593d8f`; MERGED; author jvitorcarvalho; age 9 days; updated 2026-11-06T23:26:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #155 [Show what's new after an update in pages](https://github.com/eduwxyz/tucano/pull/155) <!-- head:0f77887f7c2a448d757cb20abde1796d305f97c7 base:364f897e9051200201fc75b1a673365f56b2ab6c -->
  Head `0f77887f7c2a`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T00:25:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #156 [Let any agent make things as cards, and the Tuca help with Tucano](https://github.com/eduwxyz/tucano/pull/156) <!-- head:6d229c0ddc7bf457689425594de0ad1e22d39248 base:67582f3e14e46d8153b5eb19b4f14576a981e672 -->
  Head `6d229c0ddc7b`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T02:15:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #159 [Route channel messages through a sequential agent plan](https://github.com/eduwxyz/tucano/pull/159) <!-- head:de47c648115bde37227224183812c4169d77de8c base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `de47c648115b`; OPEN; author GianCdM; age 9 days; updated 2026-11-06T18:09:47Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #163 [Make Tucano as a server ready for other people to use](https://github.com/eduwxyz/tucano/pull/163) <!-- head:9a069b1e79cda7a700a30910503ce8e8b0e4fd9e base:c3f8febcc1016754362a210731795c07c8ab9d03 -->
  Head `9a069b1e79cd`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T09:30:08Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #165 [Connect the desktop app to Tucanos on servers](https://github.com/eduwxyz/tucano/pull/165) <!-- head:f05e9108640b6aa330e21d54d16a4cb17b0e51d2 base:66d102fa0c528e6339f837f0dfdc320a64fa0307 -->
  Head `f05e9108640b`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T09:53:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #166 [Connect more: Google, Slack, six services that ask first, and secrets from 1Password](https://github.com/eduwxyz/tucano/pull/166) <!-- head:307a4d1a3226bf966b4a2deddb127b9611845f92 base:66d102fa0c528e6339f837f0dfdc320a64fa0307 -->
  Head `307a4d1a3226`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T09:53:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #168 [Tell an agent on Codex that its read-only sandbox isn't its computer](https://github.com/eduwxyz/tucano/pull/168) <!-- head:a573c470738e195f91a212bef7ca8b923ffdc6f6 base:91061b0d06649fa2f0f14c5d91c7ad9f35398dc1 -->
  Head `a573c470738e`; MERGED; author eduwxyz; age 9 days; updated 2026-11-06T11:08:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #169 [[UI] Put the update note's button under its text instead of over it](https://github.com/eduwxyz/tucano/pull/169) <!-- head:84ced3d155f2d403c7810343a87765b3c835db72 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `84ced3d155f2`; MERGED; author cleitoncsalvagni; age 9 days; updated 2026-11-06T23:13:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #172 [Give Chrome 30 s to open, so a slow first start doesn't fail](https://github.com/eduwxyz/tucano/pull/172) <!-- head:b5ee3ff8bf25698fa8323ba09ae8fc6f6cd4551f base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `b5ee3ff8bf25`; MERGED; author rjgdias; age 9 days; updated 2026-11-06T23:11:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #175 [Reusable Select component (filtering, grouping, multi-select)](https://github.com/eduwxyz/tucano/pull/175) <!-- head:90b783eea620496b464b269bcdd9fec7d689b076 base:c3d0217c998278bb3d16a810e41da955e6d340da -->
  Head `90b783eea620`; MERGED; author b7s; age 9 days; updated 2026-11-07T15:22:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #176 [Say in the README that Tucano is a Grok Bot alternative](https://github.com/eduwxyz/tucano/pull/176) <!-- head:4301127d6a22791b2ebe1e1f45feb57761e84435 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `4301127d6a22`; MERGED; author eduwxyz; age 8 days; updated 2026-11-06T23:07:01Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #177 [Give the site an English page, comparisons with Grok Bot and OpenClaw, and one domain](https://github.com/eduwxyz/tucano/pull/177) <!-- head:baf7d25e5e99c996b19af12eda2ec61802e2b4c2 base:c321b30789bf0c399db9a7703f56c0fc8e3e336b -->
  Head `baf7d25e5e99`; MERGED; author eduwxyz; age 8 days; updated 2026-11-06T23:11:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #181 [Link the Discord community from the README, site and issue chooser](https://github.com/eduwxyz/tucano/pull/181) <!-- head:4c3f2a703738134542dae99d222dd69d4470a9ca base:ec8c2655d6cb3dc214e6dc1ae2e457e8e23f570b -->
  Head `4c3f2a703738`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T03:07:20Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #183 [Let several people share a Tucano on a server](https://github.com/eduwxyz/tucano/pull/183) <!-- head:d109bc0728b9c55c40d2461f0be5b52324ee29e7 base:afa66ad0635bef7a2c3484b5b1efbc02e52248cf -->
  Head `d109bc0728b9`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T12:04:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #185 [Let phones sign in to a Tucano on a server as their person, and let people leave](https://github.com/eduwxyz/tucano/pull/185) <!-- head:9f73db40051780230860858c56b3ae5917a445f9 base:c1d5dc657c59d5789aeff1b450998f63fc9412b1 -->
  Head `9f73db400517`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T14:08:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #189 [Guide new people from hello to a working agent, and connect the AI without a terminal](https://github.com/eduwxyz/tucano/pull/189) <!-- head:4b85a0a365868cb31103687e774425994e4c9618 base:eb19590098b7f7840c6832a875f948e8cf25e0d4 -->
  Head `4b85a0a36586`; MERGED; author eduwxyz; age 8 days; updated 2026-11-08T00:47:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #190 [Let each agent go as far on its own as I choose](https://github.com/eduwxyz/tucano/pull/190) <!-- head:9ee7effbf3bac807a10de82a0210cf867d963c05 base:deeeed66d5f1f76d772b4ab59d22055e09928a13 -->
  Head `9ee7effbf3ba`; MERGED; author eduwxyz; age 8 days; updated 2026-11-07T22:37:10Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #191 [Connect the iPhone app to the Tucano on your computer, over the home Wi-Fi](https://github.com/eduwxyz/tucano/pull/191) <!-- head:ba110ac0a6e71377fa67f51a8fbf455c7c571c81 base:2d790f14a9978c37fa02b1258b839c0c28d40b62 -->
  Head `ba110ac0a6e7`; MERGED; author eduwxyz; age 7 days; updated 2026-11-07T22:56:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #192 [Spend a pairing link only on a click, and let people disconnect their devices](https://github.com/eduwxyz/tucano/pull/192) <!-- head:f08a2e7dbde5080c7bd201b0682bd8de4c5931a3 base:9cc9e81fa08352b37552df7b74bc6e54ffff2e07 -->
  Head `f08a2e7dbde5`; MERGED; author eduwxyz; age 7 days; updated 2026-11-07T23:19:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #193 [Point the iPhone card at a server for use away from home](https://github.com/eduwxyz/tucano/pull/193) <!-- head:5109efb20ad53e9b33cf9072ee02ce2685a73b64 base:e06f2c0c44c3c7978d9425c72d571db597d7cd0e -->
  Head `5109efb20ad5`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T01:12:00Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #194 [Show Hermes skills in Tucano's skills list](https://github.com/eduwxyz/tucano/pull/194) <!-- head:3f03798eee879b17a29972aa82780144bba1aa93 base:b71464654925b035fd743fa8d2261e8db0620ac3 -->
  Head `3f03798eee87`; OPEN; author jvitorcarvalho; age 7 days; updated 2026-11-09T02:24:04Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #196 [Put the computer's network address in the iPhone QR code, not its .local name](https://github.com/eduwxyz/tucano/pull/196) <!-- head:c1f50a731b3db35fe511b712c2327204d1e20b2b base:5a021556d4cf7575c0d73da0819fbc8a71943377 -->
  Head `c1f50a731b3d`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T10:08:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #197 [Stop Codex agents calling the session read-only, tell agents how to publish to GitHub, and fix the computer card](https://github.com/eduwxyz/tucano/pull/197) <!-- head:0804fced848c14b9691bbc07ce22c07d5c25f5b8 base:bbb5a7d9f91878d8b0472e605e8e8b3cfb7d3a69 -->
  Head `0804fced848c`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T09:07:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #199 [Notifications on the iPhone with the app closed, through a push relay](https://github.com/eduwxyz/tucano/pull/199) <!-- head:b8e0c742e08eeaae2a26c231f39c9698d027073e base:39165e323b0916fc58da907b140c954323a4500b -->
  Head `b8e0c742e08e`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T10:12:23Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #204 [Sidebar order setting for DMs and Agents](https://github.com/eduwxyz/tucano/pull/204) <!-- head:c5fff6d55b802f1c07d92ac28ea27bf9eb70e81e base:a89cd8455cbe94bbb99fe7f413e1a84da8b676a5 -->
  Head `c5fff6d55b80`; CLOSED; author omnisci3nce; age 7 days; updated 2026-11-13T06:13:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #208 [Pro page: drop the early-access price lock](https://github.com/eduwxyz/tucano/pull/208) <!-- head:70d68100330063c6a11f070a62646db9313900f5 base:5a1c88aaafcb515484d13225196cae47b5c9bc76 -->
  Head `70d681003300`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T14:24:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #209 [Open a Tucano on a server in the desktop app with a one-time link](https://github.com/eduwxyz/tucano/pull/209) <!-- head:bd756846a4bfa015bde81aeba29a1c77f4fbcf0b base:1109e3c03d61c0baaeb076fa00b392b1011af6ff -->
  Head `bd756846a4bf`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T15:18:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #211 [Pro page: each plan is for one person](https://github.com/eduwxyz/tucano/pull/211) <!-- head:e135c0991aeaafcb3b97a18b90422d373060c871 base:b76ab4426e534a7aa81e8ee41cd688991614f685 -->
  Head `e135c0991aea`; MERGED; author eduwxyz; age 7 days; updated 2026-11-08T16:07:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #213 [Fix the site's double-bordered labels and content cut off on phones](https://github.com/eduwxyz/tucano/pull/213) <!-- head:4260626ed2abe0b4c4be3199ceea70e1282b6dba base:58afa9756e92af93ede2850be66fccc8f7a314e5 -->
  Head `4260626ed2ab`; MERGED; author pedrosatin; age 7 days; updated 2026-11-10T09:54:18Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #214 [Add individual and bulk agent model management](https://github.com/eduwxyz/tucano/pull/214) <!-- head:eb6e88df37ec22ae5121f0da97ec8358373e7150 base:9c2155ae9a7b7ad5397ba111213b1c2de5e1179b -->
  Head `eb6e88df37ec`; MERGED; author hendrixfreire; age 7 days; updated 2026-11-09T12:12:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #216 [Keep the Tuca's conversation when you leave and come back, and let proposals come several at a time](https://github.com/eduwxyz/tucano/pull/216) <!-- head:695e35722e9fe5040179895997215d4bae26f7f7 base:b71464654925b035fd743fa8d2261e8db0620ac3 -->
  Head `695e35722e9f`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T04:08:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #217 [Keep the AppImage when an update's download is gone](https://github.com/eduwxyz/tucano/pull/217) <!-- head:baf8051771ca73acd0c0494b18d6ef9b2b9b9960 base:d677628816fafb064e682ded4e0c28739e4962c8 -->
  Head `baf8051771ca`; MERGED; author SchonsWeb; age 6 days; updated 2026-11-09T11:55:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #218 [Use the Secret Service on Linux desktops Electron doesn't know](https://github.com/eduwxyz/tucano/pull/218) <!-- head:1311b46da9f9b1c10d90b2001fdb5504afff7787 base:0183f0c96b47014e187837cd086648550f1f402e -->
  Head `1311b46da9f9`; MERGED; author SchonsWeb; age 6 days; updated 2026-11-10T09:54:24Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #219 [Stop a login shell from holding up the whole app](https://github.com/eduwxyz/tucano/pull/219) <!-- head:df975e352e726705aaba74e5a1024e01541d0c80 base:e5c5a1e5147b4b96910707f2706c7806ab41c064 -->
  Head `df975e352e72`; MERGED; author SchonsWeb; age 6 days; updated 2026-11-09T11:49:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #220 [Show the curator's whole change on its card](https://github.com/eduwxyz/tucano/pull/220) <!-- head:9ef062fb6542786e1a6173b81ba60ff6c3d3af86 base:78804c6e44667dd1e4617464e4eadf9908637732 -->
  Head `9ef062fb6542`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T10:40:51Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #221 [Show a server's notifications in the desktop app, and say when a browser can't](https://github.com/eduwxyz/tucano/pull/221) <!-- head:8109a38b455e724bd3a24b56e60f34ffc8a0ed6a base:6b25bc0eb27ca4c7edf9cb2ae82b33321ff8e9af -->
  Head `8109a38b455e`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T10:55:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #222 [Show the agent's role on direct message rows in the sidebar](https://github.com/eduwxyz/tucano/pull/222) <!-- head:c497612e70108a9fcd80c32d82abe715c987a2f2 base:3ad4ab3d887ab75a380876408e3d7fd6a3264480 -->
  Head `c497612e7010`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T11:14:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #223 [Schedule routines on a date, and on a day of every month](https://github.com/eduwxyz/tucano/pull/223) <!-- head:b7c94ed3b25497486e1aa4a7ad50217022d89048 base:3ad4ab3d887ab75a380876408e3d7fd6a3264480 -->
  Head `b7c94ed3b254`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T11:17:23Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #225 [Reference local files dropped in chat](https://github.com/eduwxyz/tucano/pull/225) <!-- head:84d6ae6859194e2582b105377018262a4c9a9b93 base:c42d1f323a2927084d0cc06366160ea21aa0788b -->
  Head `84d6ae685919`; CLOSED; author GianCdM; age 6 days; updated 2026-11-09T22:07:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #231 [Let the router use another signed-in account when the usual login is out of quota](https://github.com/eduwxyz/tucano/pull/231) <!-- head:92fb1e2246f45b2c76d8a2633f3be4d6d2f59119 base:c42d1f323a2927084d0cc06366160ea21aa0788b -->
  Head `92fb1e2246f4`; OPEN; author eialanjones; age 6 days; updated 2026-11-09T16:13:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #233 [Add a favicon for browser use (web server mode)](https://github.com/eduwxyz/tucano/pull/233) <!-- head:17bcfab9ec00d95f2d250f04a88b1c24d781d05f base:c42d1f323a2927084d0cc06366160ea21aa0788b -->
  Head `17bcfab9ec00`; MERGED; author b7s; age 6 days; updated 2026-11-10T09:44:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #237 [Attach any file to a message in the app, and give its text to the agents](https://github.com/eduwxyz/tucano/pull/237) <!-- head:46d9998cd15d577011b7987158a347be37a226b0 base:c42d1f323a2927084d0cc06366160ea21aa0788b -->
  Head `46d9998cd15d`; MERGED; author eduwxyz; age 6 days; updated 2026-11-09T17:35:27Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #253 [Send an answer written in the channel to the agent that asked](https://github.com/eduwxyz/tucano/pull/253) <!-- head:1a235e745bfe901c4eb6f2b84703e2df8b3782dd base:0d97510359ea7e568eb034108d1053bbc8bf78cf -->
  Head `1a235e745bfe`; MERGED; author eduwxyz; age 5 days; updated 2026-11-10T11:57:32Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #254 [Clarify drag-and-drop overlay copy](https://github.com/eduwxyz/tucano/pull/254) <!-- head:2b717397b9f8a16f3672d75708977aeb0bd15c52 base:35db1c360e5178ee7daf6c8a635a79ae031fcf59 -->
  Head `2b717397b9f8`; MERGED; author GianCdM; age 5 days; updated 2026-11-10T09:44:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #265 [Preserve asdf home for isolated Codex CLI](https://github.com/eduwxyz/tucano/pull/265) <!-- head:591a089219a6dde0e0ac51c947cc612bc653d71e base:cd4bc4de1a5aaa0684a0f1769d0f1b52cc251443 -->
  Head `591a089219a6`; MERGED; author andrelramos; age 5 days; updated 2026-11-10T10:02:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #277 [Add per-agent tables: dados_tabelas, dados_consultar, dados_alterar](https://github.com/eduwxyz/tucano/pull/277) <!-- head:e174f6aec0ef7be4b2684c596070ebe313ba71b4 base:3149d426e952e66ffd57c2d6cfb1cbed2be70ff7 -->
  Head `e174f6aec0ef`; OPEN; author felipcsousa; age 5 days; updated 2026-11-10T12:44:13Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #317 [Make thread panel resizable](https://github.com/eduwxyz/tucano/pull/317) <!-- head:f575be86c0ae6b1e4ac6c556ac5b9b2351c5de50 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `f575be86c0ae`; CLOSED; author GianCdM; age 5 days; updated 2026-11-10T23:26:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #344 [Keep the screen in the address on the web, so a phone's reload opens where it was](https://github.com/eduwxyz/tucano/pull/344) <!-- head:88046f0d69855ff9911b4d93764096b307c346c2 base:58092166f9fd6df28904554edb85df1dbfb9960c -->
  Head `88046f0d6985`; MERGED; author b7s; age 4 days; updated 2026-11-12T08:43:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #345 [Keep the keyboard down when a conversation opens on a phone](https://github.com/eduwxyz/tucano/pull/345) <!-- head:e257cfe36b3d24674b8103ed041f382b568909a2 base:c98e6586ba837ea9589d4e15e91a6686f4b70abb -->
  Head `e257cfe36b3d`; MERGED; author b7s; age 4 days; updated 2026-11-12T08:43:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #347 [Open the thread of a message sent in a channel that answers in threads](https://github.com/eduwxyz/tucano/pull/347) <!-- head:8ecd9a5fd88fefd8500048b382ba5314b91919ff base:418a551eea0c6261cbc0bfd014a16c9bef29987c -->
  Head `8ecd9a5fd88f`; MERGED; author b7s; age 4 days; updated 2026-11-12T09:07:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #348 [feat: expand selectable ai-jail sandbox policy](https://github.com/eduwxyz/tucano/pull/348) <!-- head:3cb7a7435cfaa386f735874aecba48f69c300cfe base:0098f124d9796a7ee869939e8004def009255270 -->
  Head `3cb7a7435cfa`; OPEN; author andrelramos; age 4 days; updated 2026-11-11T04:10:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #349 [Drag the sidebar and the right-hand panel to the width you want](https://github.com/eduwxyz/tucano/pull/349) <!-- head:88941fe5370ff8cab0494ced422e542282086707 base:0098f124d9796a7ee869939e8004def009255270 -->
  Head `88941fe5370f`; MERGED; author eduwxyz; age 4 days; updated 2026-11-10T23:23:20Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #356 [Read attached images and scanned PDFs on this computer, with local image models](https://github.com/eduwxyz/tucano/pull/356) <!-- head:162a55fde25b679af85759024189511aa9a89879 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `162a55fde25b`; OPEN; author b7s; age 4 days; updated 2026-11-12T12:44:18Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #360 [Let an agent in a channel tell how one of its threads is going](https://github.com/eduwxyz/tucano/pull/360) <!-- head:f56e7747aef58ada858012675c608b4857f7871a base:b436f4af311e31259e50fc466c4289e32fb51b3e -->
  Head `f56e7747aef5`; OPEN; author rjgdias; age 4 days; updated 2026-11-11T13:08:08Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #362 [feat(routines): add Duplicate button to copy a scheduled routine](https://github.com/eduwxyz/tucano/pull/362) <!-- head:0e651475e72da7f4a5657bdc2d08fca4dca431e2 base:419dd1614de93b05aff4593ffc73855ad43340db -->
  Head `0e651475e72d`; MERGED; author jonatas-caram-ifood; age 4 days; updated 2026-11-12T09:07:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #363 [fix(apps): let agents read and use the person's Chrome on Linux](https://github.com/eduwxyz/tucano/pull/363) <!-- head:b6f5040fe488aa9e73d0c0178f35c32c2f3301dc base:b3c25759851abedef0b7094e3dbfee774af59a2b -->
  Head `b6f5040fe488`; MERGED; author vitoramaral10; age 4 days; updated 2026-11-12T08:43:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #364 [Preserve long agent instructions](https://github.com/eduwxyz/tucano/pull/364) <!-- head:712633c02e0e441666e59c11991a9daa1753d739 base:90a70a398b2ec76da5dd857ccd6a79cd19e4fdc3 -->
  Head `712633c02e0e`; MERGED; author GianCdM; age 4 days; updated 2026-11-12T08:43:51Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #369 [Let an agent that only reads through Composio link an account](https://github.com/eduwxyz/tucano/pull/369) <!-- head:20546b8f43383cd3040fb29f1cc469cdd40632a7 base:b436f4af311e31259e50fc466c4289e32fb51b3e -->
  Head `20546b8f4338`; MERGED; author eduwxyz; age 3 days; updated 2026-11-12T02:42:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #370 [Show the Codex subscription's limits on Usage and limits](https://github.com/eduwxyz/tucano/pull/370) <!-- head:6ab6eea03e7703712d71b27cee101d2f684b0dc0 base:b912d8b11abaa53db728accfbd57b30ca3a61ae3 -->
  Head `6ab6eea03e77`; MERGED; author eduwxyz; age 3 days; updated 2026-11-12T02:56:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #371 [An org chart: agents answer to other agents, hand them work and get the answer back](https://github.com/eduwxyz/tucano/pull/371) <!-- head:1b6568e5a0562cf6852ec16e736699ad6f4fcff4 base:e277c733bca120a82699cee9b0d9191325723d22 -->
  Head `1b6568e5a056`; MERGED; author eduwxyz; age 3 days; updated 2026-11-12T10:04:16Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #382 [Show the server's version in a browser's Settings](https://github.com/eduwxyz/tucano/pull/382) <!-- head:9080d35992bbd483adb9e9340d5d8730d1935658 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `9080d35992bb`; MERGED; author b7s; age 3 days; updated 2026-11-14T00:15:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #387 [Let an agent organize the team, and the Tuca propose the org chart](https://github.com/eduwxyz/tucano/pull/387) <!-- head:7f1ad024cc5ad9f13bff6cd8af5a7cbdd32c7328 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `7f1ad024cc5a`; OPEN; author rjgdias; age 3 days; updated 2026-11-12T14:13:21Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #388 [Let an artifact without a preview be shown in Finder](https://github.com/eduwxyz/tucano/pull/388) <!-- head:34e0eb2b99fdcb6f8572476ed422da341d43ab1f base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `34e0eb2b99fd`; MERGED; author stefanosandes; age 3 days; updated 2026-11-15T09:24:14Z; integration ancestry: present; review: not reviewed.
- [ ] #399 [Let each person choose how a routine's request shows: full, compact or hidden](https://github.com/eduwxyz/tucano/pull/399) <!-- head:7749995afabe0a66dcaa094c0606139d5cd86cc4 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `7749995afabe`; OPEN; author stefanosandes; age 3 days; updated 2026-11-12T18:39:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #400 [Keep the agent card open while the chat auto-scrolls](https://github.com/eduwxyz/tucano/pull/400) <!-- head:fab4085c5b6a642a8ef7d70023efa94263787106 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `fab4085c5b6a`; MERGED; author stefanosandes; age 3 days; updated 2026-11-15T09:27:25Z; integration ancestry: present; review: not reviewed.
- [ ] #406 [Attach images and files when asking from the Team page](https://github.com/eduwxyz/tucano/pull/406) <!-- head:0277e42c7dc851cf1a03c796061450467a03fdd3 base:c06ab5479abb28acb0d3868abea7b0ad30eaa938 -->
  Head `0277e42c7dc8`; OPEN; author eialanjones; age 2 days; updated 2026-11-15T00:20:04Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #414 [Team: sectors, where heads ask other heads](https://github.com/eduwxyz/tucano/pull/414) <!-- head:b16e8267d9db7e200a0b58c4c08f9fe0aa8f50a2 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `b16e8267d9db`; MERGED; author eialanjones; age 2 days; updated 2026-11-14T22:39:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #426 [Let a Composio item name its account, and allow it for good per account](https://github.com/eduwxyz/tucano/pull/426) <!-- head:fbb2d3ccb83ea26ca16d10b50b8705f12e6f65bb base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `fbb2d3ccb83e`; MERGED; author stefanosandes; age 2 days; updated 2026-11-14T10:32:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #429 [Line up system notices with the message column on wide windows](https://github.com/eduwxyz/tucano/pull/429) <!-- head:588cd0a5a2fc9a18dc73f1f5a025f739714a3b1a base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `588cd0a5a2fc`; MERGED; author stefanosandes; age 2 days; updated 2026-11-15T09:24:04Z; integration ancestry: present; review: not reviewed.
- [ ] #443 [Give the Team guide page its English heading](https://github.com/eduwxyz/tucano/pull/443) <!-- head:fb7b0f3118a969fa67b657277f048bbfd9ea0b81 base:1138b41df35fc6b55ea1bd293b3b274a8cc3218a -->
  Head `fb7b0f3118a9`; MERGED; author eduwxyz; age 1 days; updated 2026-11-14T00:25:42Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #444 [Say a new version is ready with a server on screen too](https://github.com/eduwxyz/tucano/pull/444) <!-- head:05103a20a057b4c415f15d37ded6cfecb46955ca base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `05103a20a057`; MERGED; author eduwxyz; age 1 days; updated 2026-11-14T10:29:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #461 [People: choose which sectors, agents and channels each member sees](https://github.com/eduwxyz/tucano/pull/461) <!-- head:6a1daa9f546270d87d24ad4183f29f84bfb1a410 base:32468eb78eaad169947147bfde8d3e0c1c82b5f3 -->
  Head `6a1daa9f5462`; MERGED; author eialanjones; age 1 days; updated 2026-11-15T14:28:07Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #462 [Let a line on Team be as long as it is drawn](https://github.com/eduwxyz/tucano/pull/462) <!-- head:043312fb23c9927e312d5a190ac30db4e173794a base:04539404e545323124e5dd4737098892cd746226 -->
  Head `043312fb23c9`; CLOSED; author eduwxyz; age 0 days; updated 2026-11-14T22:29:22Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #463 [Pass work straight to the sector's head, from any depth](https://github.com/eduwxyz/tucano/pull/463) <!-- head:a0bef07f6751ee7d16e8111a246ee9c525f05cd7 base:f47b56190d2b536759b8af08ce0bb4d9722571cc -->
  Head `a0bef07f6751`; MERGED; author eduwxyz; age 0 days; updated 2026-11-14T22:44:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #464 [Attach files from the browser, and keep sector zones apart on Team](https://github.com/eduwxyz/tucano/pull/464) <!-- head:746df4e7d56872bf4bf7d06535c4b7e48def5984 base:3b5576d95f5235ea3227b2eedcb1a69a0c1da5dc -->
  Head `746df4e7d568`; MERGED; author eduwxyz; age 0 days; updated 2026-11-14T23:32:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #465 [Let the person choose an entry point over the sectors](https://github.com/eduwxyz/tucano/pull/465) <!-- head:8e8e640c96197e01697bda9be3a40d388f123d6a base:5da3d7e10472208e72c67386395a27b0d7759a7d -->
  Head `8e8e640c9619`; MERGED; author eduwxyz; age 0 days; updated 2026-11-15T00:09:07Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #477 [Keep a dropdown's arrow off the right edge](https://github.com/eduwxyz/tucano/pull/477) <!-- head:6c10a7ded4784d88914248c53816ee1f0ac44d77 base:d88a53571cdec1ba8c75746260576460c15bd30b -->
  Head `6c10a7ded478`; OPEN; author eduwxyz; age 0 days; updated 2026-11-15T13:50:17Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #482 [Site: guides in Markdown (/guias, /docs), llms.txt, PostHog on every page](https://github.com/eduwxyz/tucano/pull/482) <!-- head:4cc59265f7a34e53a8c2fb82783ec81a3d8f6649 base:6a7153994b7b98488402df206e5a8f4fdc4da853 -->
  Head `4cc59265f7a3`; OPEN; author eduwxyz; age 0 days; updated 2026-11-15T15:32:07Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #484 [Calls on a WhatsApp number, answered by an agent with a voice service's voice](https://github.com/eduwxyz/tucano/pull/484) <!-- head:e162fd94faaaab9c1b2226e4b21386f807e72861 base:b76f9d8d28cecff8ca4a3319168ae7f00c1ab49f -->
  Head `e162fd94faaa`; OPEN; author eialanjones; age 0 days; updated 2026-11-15T20:00:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #485 [Add the QG engine (Quebra-Galho CLI)](https://github.com/eduwxyz/tucano/pull/485) <!-- head:6f777b62af227e1512ea6211238ebf2881ad623d base:54f92fe5e6e430830623745e26e5d6b989602496 -->
  Head `6f777b62af22`; OPEN; author hendrixfreire; age 0 days; updated 2026-11-15T18:18:48Z; integration ancestry: inspect equivalence; review: not reviewed.
