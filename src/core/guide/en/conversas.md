# Conversations, channels and threads
> Channels, direct messages, threads, mentions, who answers, work that runs to the end, an agent joining in, stopping and trying again, images and dictation.

## Channels and DMs
- **Channel**: the **+** beside **Channels**, ⌘N (Ctrl+N), or **New channel** in ⌘K. A lowercase name with hyphens ("Squad Payments" becomes squad-payments).
- **DM**: the conversation with one agent alone, which always answers there. In its menu, **Send a message**.
- In the channel's menu (right-click it): **Add or remove agents…**, **Channel settings…**, **Mark as read**, move and group, **Delete channel…**.

## Who answers in a channel
- With @handle, whoever was called answers. With no mention, the **Router** reads the conversation and picks who answers.
- **Mention mode**: in **Agents in #channel**, the agent reads everything and answers only when called with @; with everyone like that, the message goes unanswered, and the app says so.
- **Listen mode**: in the same place, the **Jev** says whether the message asks for what only that agent does, and only then does it join.
- Several answer one after another, each doing its part on top of the one before.
- An agent that mentions another: only whoever has something to do is called; a "thank you" wakes nobody.

## Until it's done
Every message becomes work that runs until it's finished, without you pushing it. It stops only when it stops moving, with the note **I stopped this work** and **Continue** (see **limits**).

## An agent that joins in
When an agent finishes without passing the turn, another may join to do something of its area (review, test, publish): "**Rev** joined" and why, one at a time, never to comment. Turn it off on the agent's page (**Join in when something is its area**) or in the channel's menu (**Agents join on their own**).

## Threads
In **Channel settings…** (or the conversation's, in a DM), **Where the agents answer**: in the conversation, like a chat, or in threads, one per message. **Reply in thread** opens one; an agent in a thread reads only that.

## During the reply
- The steps appear while it works. **Stop** interrupts; **Retry** redoes one that failed.
- It reached the ceiling: it pauses and, if it was getting somewhere, goes on by itself (up to 10 times); after that, **Continue** picks up where it stopped.
- A question from the agent: your next message there is the answer. **See receipt**: tokens, cache, time and the API equivalent.

## Summary
The **Summary** at the top shows what the conversation covered: the last 30 messages in whole; past 50, what leaves becomes a summary, and you can **Summarize now**.

## Attachments and dictation
- Up to 10 images and 5 files per message (clip, drag or paste). From a PDF, Word, spreadsheet and text the agent reads the text; later it re-reads it with ler_anexo.
- Dictation: the microphone in the field, ⌥ Space on the Mac and Ctrl+Space elsewhere. The audio becomes text on the computer itself. Turn it on in **Settings › General › Dictation**.

## When it goes wrong
- No internet, a busy service or the plan's window: the reply waits and tries again by itself (**Waiting to try again**, with the time).
- "Interrupted: the app closed in the middle of the reply": when it opens again the reply goes on by itself, however old it is (with **Go on by itself** on); otherwise, **Retry**.
- Nobody answers and the paused note shows: the agents are paused (the button at the top of the sidebar).
