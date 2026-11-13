# English copy for integrated feature settings

This supplements the upstream-main proposal for controls supplied by open feature PRs. Each set is proposed on its existing feature branch and integrated into TucanoNext after validation. Portuguese, setting keys, defaults, and behavior remain unchanged.

## PR #268

| Current | Proposed |
| --- | --- |
| The resolver | Resolver |
| Settle what the review can only point at | Resolve review findings |
| A bot inside the app, with no conversation: on a finding's Resolve button, it reads the whole pages with the sources they came from and proposes the change — or asks the one question only you can answer. Nothing changes without you. | Review full pages and sources to suggest a fix or ask you a question. Changes require your approval. |
| Its model | Resolver model |
| Empty: the memory model, and then Haiku. | Default: memory model, then Haiku. |
| Use the memory's | Use memory model |
## PR #322

| Current | Proposed |
| --- | --- |
| The conversation | Conversation |
| What the model is thinking | Show reasoning |
| While an agent replies, its reasoning shows in small, dim text under the steps, and it stays there once the reply ends. Off, you see only the steps and the answer. For now only agents running on Pi send their reasoning. | Show reasoning below the steps, including after completion. Available for Pi agents only. |
| How much of the reasoning shows | Reasoning panel height |
| How much reasoning shows | Reasoning panel height |
| How much of the reasoning shows before it starts scrolling: a couple of lines when it is only a hint, or most of the window when the reasoning is what you are reading. | Visible reasoning before the panel scrolls. |
| 6 lines, the rest scrolling. | 6 lines before scrolling. |
| 12 lines, the rest scrolling. | 12 lines before scrolling. |
| 18 lines, the rest scrolling. | 18 lines before scrolling. |
| A reply’s steps | Reply steps |
| How a reply shows its steps | Step display |
| How many steps to show | Visible steps |
| How many steps the window shows | Number of visible steps |
| Every step, the way it always was. | Show every step. |
| A reply shows only the newest, in a window that scrolls itself; the oldest fade out at the top. | Show recent steps in an auto-scrolling panel. Older steps fade out. |
| One line with the current step and its target. Click to open the details. Good for a busy channel with several agents at once. | Show the current step and target on one line. Click to expand. |
| How this agent’s replies show their steps: all of them, only the latest few, or one line with the current activity. The default is the app’s setting. | Show all steps, recent steps, or a single activity line. Default follows app settings. |
## PR #395

| Current | Proposed |
| --- | --- |
| Clock | Time format |
| 15:05, the way it always was. | 24-hour time, e.g. 15:05. |
| 3:05 PM, with am and pm. | 12-hour time, e.g. 3:05 PM. |
| How times read: 15:05 on a 24-hour clock, or 3:05 PM on a 12-hour one. It covers the conversation, the routines, and what agents read. | Use 24-hour (15:05) or 12-hour (3:05 PM) time in chats, routines, and agent context. |
## PR #247

| Current | Proposed |
| --- | --- |
| Hide Asks when there are none | Hide empty Asks |
| Hide Approvals when there are none | Hide empty Approvals |
| The Asks entry leaves the sidebar while no agent is asking you anything, and comes back with the first question. Off, it is always there. | Show Asks only when an agent has a question for you. |
| The For you entry leaves the sidebar while nothing waits on you, and comes back with the first approval or question. Off, it is always there. | Show For you only when a question or approval needs you. |
| The Approvals entry leaves the sidebar while nothing waits on you, and comes back with the first approval. Off, it is always there. | Show Approvals only when an action needs your approval. |
## PR #391

| Current | Proposed |
| --- | --- |
| Continue work that was running when Tucano quit or crashed. Replies you stopped stay stopped. If agents are paused, work waits until you resume them. | Resume work after a quit or crash, unless you stopped it. Paused agents wait until resumed. |
## PR #383

| Current | Proposed |
| --- | --- |
| Models that answer closed questions — one option out of several, a yes/no, a score — in under a second and with each answer’s probability. TypeSafe’s Jev was the first; OpenAI’s Luna and Google’s Decision 1 do the same job, and Jev is also sold through OpenRouter. Each one serves a job: who replies in a channel, which listener joins, the option suggested on a question, which next steps are worth doing, which model answers, what an agent clicks in a page. | Fast models for routing, suggestions, and browser controls. Assign a provider to each task below. |
| No classifier yet. Add one and choose, below, what it answers: who speaks in a channel, which listener joins, the suggested option, the next steps, which model answers, what an agent clicks. | Add a classifier, then assign it to tasks below. |
| How it reads in the choices below. | Display name in task assignments. |
| The model pair that answers. Pinning a version keeps the probabilities you already tuned. | Model pair used for decisions. Pin a version to preserve your calibration. |
| Where each one is used | Task assignments |
| With no classifier on “Who replies in a channel”, this small model reads each message and decides who replies. Go for a fast one: it runs before every reply in a channel. | Choose a fast fallback model for channel replies when no classifier is assigned. |
| Finds the element in under 1 second, even without text when the classifier reads the screenshot. Every click text can’t resolve sends the page’s element list, and sometimes its screenshot, to the chosen provider, including signed-in areas. | When text matching fails, the provider receives page elements and may receive screenshots, including signed-in content. |
| Free, and it handles most cases: the agent uses the text and, when it can’t find it, the element’s number. | Match page text for free; use element numbers when no match is found. |
| Who finds the click is chosen in Classifiers, under “What an agent clicks in a page”. | Choose a provider in Classifiers › Browser controls. |
| The agents’ questions | Agent suggestions |
| A classifier reads an agent’s closed question — which option to pick, which step to do now — and answers in under a second with each option’s probability. Which one serves each of the two jobs is chosen in Classifiers. | Suggest answers and next steps using the providers assigned in Classifiers. |
| Mark the recommended option | Suggest answers |
| Tick only the next steps worth doing | Suggest next steps |
| With no key on the classifier, the two switches above do nothing: the question shows no pill and every step starts ticked. | A classifier key is required. Without it, answers are not suggested and all next steps stay checked. |
| Who answers is chosen in Classifiers: “The option suggested on a question” and “Which next steps are worth doing”. | Assign providers in Classifiers › Suggested answers and Suggested next steps. |
| Who replies in a channel | Channel replies |
| Which listener joins | Listening agents |
| The option suggested on a question | Suggested answers |
| Which next steps start ticked | Suggested next steps |
| Which model answers | Model routing |
| What an agent clicks in a page | Browser controls |
| Reads the conversation and picks who replies, in place of the router’s small model. Every message without an @mention goes to the chosen provider. | Choose channel responders. Messages without @mentions go to the selected provider. |
| An agent in listen mode stays out of the conversation until this question says the message needs what only it does. | Invite listening agents when a message needs their expertise. |
| Marks the best option on an agent’s question card. “None” is a real answer: the person’s taste is not a model’s call. | Suggest an answer on question cards. May select none when the choice is personal. |
| A reply’s next steps open with every box clear; this question decides which of them come ticked. | Choose which suggested next steps start checked. |
| Reads the request and picks the smart routing chain: the role, how hard the work is, and the capability it deserves. | Choose a model chain based on role, task complexity, and required capability. |
| Finds the element the agent asked for (“the Search button”). The screenshot, which handles the cases without text, only TypeSafe reads. | Find page controls for agents. Only TypeSafe supports screenshot matching. |
| No classifier reads the prompts: pick one in Classifiers, under “Which model answers”, or routing picks no model at all. | Assign a classifier in Classifiers › Model routing to enable routing. |
| A classifier reads each prompt and picks the model from your pools, for every agent that hasn’t set its own switch to On or Off. An agent set to Off on its page uses its own model. Who reads is the classifier set on “Which model answers”, above. | Route prompts through model pools by default. Per-agent On/Off overrides this setting; choose the classifier under Model routing. |
| Off: every agent uses its own model, except the ones set to On on their own page. | Off: agents use their own models unless routing is enabled on their page. |
| Who reads the requests | Routing classifier |
| Smart routing is one closed question per reply, and the classifier chosen in Classifiers, under “Which model answers”, is what answers it. | Classify each reply using the provider assigned in Classifiers › Model routing. |
| Tried before the pool’s, when the prompt lands on a tier at or above the role’s floor. | Try these before pool models at or above the role’s minimum tier. |
| In order. The first that exists and is signed in answers. | Try in order; use the first available, signed-in model. |
| What this pool is for, in your words. It’s for you: Jev’s tier is what decides. | A note for you. The classifier’s tier determines routing. |
| Free sits outside the tiers: the tier Jev asked for stays on the record even when a free model answers. | Free models have a separate pool. The requested tier remains recorded. |
| Let Jev reach tier 4 on its own | Allow automatic tier 4 |
| Let Jev reach tier 5 on its own | Allow automatic tier 5 |
| On, a prompt Jev judges expensive enough may run here without asking, and it is what lets the reading reach tier 5 at all. Off, the reading stops at tier 3; a role’s floor can still bring the reply here. | Allow automatic tier 4 and unlock tier 5. When off, classification caps at tier 3; role minimums can still select tier 4. |
| Off, tier 5 is only ever your own pick. On, a prompt Jev judges maximal, and is sure about, may run here without asking. It needs tier 4 switched on. | Allow tier 5 for high-confidence, maximum-demand requests. Requires tier 4. When off, select tier 5 manually. |
| Free sits outside the tiers: its own pool, with a chain of its own. | Free models use a separate pool and model chain. |
| When nothing here can run, the reply walks down to the tier below. It never walks up. | If no model is available, try a lower tier. Never move to a higher tier. |
| What this role is | Role criteria |
| This is the criterion Jev reads to pick the role. It changes how it classifies; not the price. | The classifier uses this description to select a role. It does not set the price. |
| Never below | Minimum tier |
| A floor for this role’s tier: review and planning don’t drop to a weak model. | Prevent this role from using a lower-tier model. |
| Empty. Add the first model below. | No models yet. Add one below. |
| Already in the chain: change the model or the thinking. | Already in this chain. Choose another model or reasoning level. |
| Judgment | Classification |
| Demand in force | Effective demand |
| Tier in force | Effective tier |
| Where the model came from | Model source |
| Came from the role’s own chain | Selected from the role’s model chain |
| `Off by default. On, every agent question with two or more options goes to ${recommendClassifier ? recommendClassifier.name : 'this job’s classifier'} with its text and options, and comes back with a suggestion. It is only a suggestion: you still choose, and "Something else" is never suggested.` | `Off by default. Send questions and options to ${recommendClassifier ? recommendClassifier.name : 'the classifier'} for suggestions. You choose; “Something else” is never suggested.` |
| `Off by default. On, every step of a next-steps card goes to ${stepsClassifier ? stepsClassifier.name : 'this job’s classifier'} with what the agent said before it, and only the ones it would do now start ticked; the rest waits in the card, one click away. It never empties the list: if none is picked, all of them stay ticked.` | `Send steps and reply context to ${stepsClassifier ? stepsClassifier.name : 'the classifier'} to check suggested tasks. Others stay available; if none is chosen, all stay checked. Off by default.` |
