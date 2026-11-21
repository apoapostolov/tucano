# Vault
> Keeping API keys, tokens and site logins for the agents to use without ever seeing the value: who may use one, approval per use, the request in the chat, the log and .env import.

The Vault sits at the foot of the sidebar, under **Connectors**. Each key has an environment variable's name (`STRIPE_KEY`) and a value, encrypted in the system keychain, that never shows again: the screen keeps only its end (`••••a1b2`). A 1Password reference works instead of a value (`op://Vault/Item/field`), read on every use.

## How an agent uses one
An agent with a computer uses a key by asking for it by name in a command: Tucano checks it was given to that agent, puts the value in that command's environment only, and turns it into `[cofre:STRIPE_KEY]` in whatever the command prints, before the agent reads it. The steps show which key the command used. A service (`start_service`) may carry keys too: they stay in its environment while it runs.

An agent with no computer uses keys through connectors only.

## Site logins
In the **Logins** tab: site, username and password (or `op://`). Given to an agent with a browser, the app types it in on that site's exact address, and the agent never sees the password. One login per site for each agent; it can also be saved on the agent's page, under its browser.

## When a key is missing
The agent asks in the chat: a card shows the key's name (or the site) and why. Anyone in the conversation pastes it there, straight into the Vault, and the agent carries on by itself. Pasted, it stays among yours (only an admin ticks **Keep it for the team**). When the key is already in the Vault, the card offers **Give it to …** instead: the team's, an admin's to give.

## Who may use one
A new key is given to no agent. On the key itself (Edit) or on the agent's page (**Tools › Vault keys**), pick the agents that may use it. An agent using a key that isn't its own doesn't run the command, and hears which ones it has.

## Asking for approval on every use
Turned on for a key, every command that uses it waits for someone to approve it, with the whole command in sight. Good for keys that touch money or production; such a key never goes into a service.

## The team's and mine
In a Tucano with people, the Vault has two drawers:
- **The team's:** only an admin makes, changes and gives them out. Agents use them on any work.
- **Mine:** anyone makes their own. No one else sees they exist, and an agent uses one only in work that person asked for. A key of yours with a team key's name counts in its place, in your requests.

## Importing a .env
**Import .env** shows each line before saving it: new, already there (the value changes only if you tick it), or not going in. No imported key is given to any agent.

## In connectors
A connector's variable may point at a team key: `cofre:STRIPE_KEY`. Change it in the Vault and the connector picks it up next time.

## The log
The **Log** tab lists every use: which key or login, which agent, whose work it was for, and a link to the conversation. Never the value. An admin sees the team's; each person, their own.

## Names it can't have
The terminal's own names (`PATH`, `HOME`, `LD_…`, `TUCANO_…` and the like) can't be keys.
