# signup-bot
Signup bot is used to manage our clan's raid lists and is currently under very preliminary development. 

Currently the only command that can be issued with this bot is:
```
+raid $Title | $Date | $Description (| $Class)
```
What this means is:
1) Type +raid
2) Type your raid's title. Usually this will be something like "Leviathan" or "Lev>EoW>SOS" or... something descriptive. Now type the | character. It's above the enter key.
3) Type your raid's time. This can be formatted however you want, we're just storing this for display purposes. Now type | again.
4) Type your raid's description. Maybe you want this to be a @SpacePup raid, or maybe you want it to be super sweaty. Your call. Type it here.
5) If you want to specify your class, type a | and then the class name. If you don't do this step, the system will put you in as a fill.

So for example, you would type:
```
+raid Leviathan|6/29 5PM PST|Let's set up a sherpa run, join in @SpacePup!
```
or
```
+raid Leviathan|6/30 5PM PST|I need a clear for my Titan|Titan
```

The bot takes care of the rest (formatting, etc.). This is not ready for release yet, as we are still working on developing functionality to join, etc. Wanted to get deployed into git quickly.