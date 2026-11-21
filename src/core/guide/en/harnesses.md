# Harnesses (MCP)
> Connect your harness (Claude Code, Codex, Cursor, OpenCode) to Tucano over MCP: from there it understands the team, talks to the agents and sets Tucano up.

Tucano is an MCP server as well. Connected to it, the harness you already use every day sees the team, sends messages to the agents and waits for the answer, and creates or changes agents, channels, routines, skills, connectors and memories, as you would on the screens. A common first use: "create in Tucano the equivalent of the agents and skills you have".

## Connecting
In **Settings › Harnesses**:
- On the desktop app, **Connect in one click** writes the address and a new key into Claude Code's, Codex's, Cursor's or OpenCode's own configuration. If a `tucano` entry is already there, it asks before replacing it. With the harness open, restart its session.
- Anywhere, **Make a key** gives the key (shown once) and what to paste into each harness: the Claude Code command, the Codex `config.toml` snippet, the Cursor and OpenCode JSON, or the address and header for another one.

The address follows where Tucano runs:
- **On the desktop:** `http://127.0.0.1:47817/mcp` (another workspace has another port). Only programs on the same computer reach it, and only with Tucano open. claude.ai and ChatGPT don't.
- **On a server or Tucano Pro:** the server's address with `/mcp` at the end (`https://<name>.pro.tucano.sh/mcp`).

## What each key may do
Every key belongs to a person and acts as them: it sees what they see and changes what they may change in the app, checked on every call. When making one, pick how far it goes:
- **Read:** understands Tucano and sees the team, the conversations and what ran.
- **Talk:** also sends messages to the agents and waits for the answer.
- **Configure** (the default): also creates and changes agents, channels, routines, skills, connectors and memories.

No key deletes anything, decides an approval, touches people, invites, logins or secrets, or loosens a tool's approval: that stays in the app.

## What you see of what it did
- The message a harness sends shows in the conversation as yours. The agent knows it came from the harness and that the answer is read there.
- What it creates or changes shows in **Approvals** ("Claude Code created 2 agents and 1 routine") and, with a team, in **Activity**.
- A memory a harness sends waits on the agent's **Memory** tab until you accept it.
- Creating something with a name that already exists returns what exists, changing nothing.

## Taking the access away
In **Settings › Harnesses › Your keys**, **Remove** cuts the harness off at once. Removing a person from Tucano takes all of their keys.
