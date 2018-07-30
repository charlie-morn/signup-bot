# signup-bot
Signup bot is used to manage our clan's raid lists and is currently under early development. 

Currently the commands that can be issued with this bot are:

In #signup-list

[`+raid Title | Date | Description (| Class)`](#raid) to create a raid. Optionally establish your class.  
[`+time Raid_id|Time`](#time) to change the time of a raid you've created.  
[`+message Raid_id|Message Text (can also be +message_all, +message_reserve or +message_main)`](#message) to message members of your raid  
[`+remind Raid_id(|Reminder Text)`](#message) same as message, but will default to a reminder of the time if you don't put a message in. 
[`+delete Raid_id(|Delete Text)`](#delete) allows you to delete a raid. If you specify a message, it will DM everyone signed up. 

In #signup-here

[`+join Raid_id(|Class|Reserve|User)`](#join) will join a raid.  
[`+drop Raid_id(|User)`](#drop) will drop yourself or a user you signed up from a raid.  
[`+class Raid_id(|Class|User)`](#class) will change your class for a raid.  
[`+promote Raid_id(|User)`](#promote) will promote your role in the raid from reserves to main roster if there's space available.

(If you can't find it, the | key is just above your Enter key on a standard keyboard.)

Arguments in parentheses are optional and do not need to be included. The arguments are ordered, however, so if you want to join your friend Dave to the main roster as a titan, you'd say something like `+raid 5|Titan||Dave`. If Dave wanted to fill any class needed you could say `+raid 5|||Dave`. Keep in mind the number will change, depending on which raid ID it is. I'm not a mind-reader.

More detailed documentation is available on the [github site for the bot](https://github.com/cliffhanger407/signup-bot).

If the bot is misbehaving, you can create an issue on the github. Want to contribute? Make a pull request!

# Details

All the examples below are going to assume you're trying to modify raid 6. Obviouisly, if the raid isn't raid 6, change the number to match.

## Things you can do in #signup-list
1. [Create Raids](#raid)
2. [Change the time of a raid](#time)  
3. [Message Members of the raid](#message)

### raid
Use the `+raid` command with the syntax:
```
+raid Title | Date | Description (| Class)
```
You must specify a title, date, and description. All of these are free text and are not error checked in any way. I'll give a detailed walkthrough of how to create a raid, but the others will be less in-depth. Your message will be deleted and replaced by a reformatted one made by signup-bot!

1) Type +raid
2) Type your raid's title. Usually this will be something like "Leviathan" or "Lev>EoW>SOS" or... something descriptive. Now type the | character. It's above the enter key.
3) Type your raid's time. This can be formatted however you want, we're just storing this for display purposes. Now type | again.
4) Type your raid's description. Maybe you want this to be a @SpacePup raid, or maybe you want it to be super sweaty. Your call. Type it here.
5) If you want to specify your class, type a | and then the class name. If you don't do this step, the system will put you in as a fill.

So for example, you would type:
```
+raid Leviathan|6/29 5PM PST|Let's set up a sherpa run, join in @spacepup!
```
and that would produce the below output:


**Leviathan**  
**Time:** 6/29 5PM PST  
**Posted by:** cliffhanger407  
Let's set up a sherpa run, join in @spacepup!

To join this raid, react with the class icon you'd like to use below. For fill, use :Fill~2:.If you're not sure you can make it, press 🔃 after joining to go on the tentative list (or promote yourself back when you're sure). To leave this raid, press 🚪.

```====ROSTER====
1. cliffhanger407 - Fill
2. OPEN 
3. OPEN 
4. OPEN 
5. OPEN 
6. OPEN 
====RESERVES==== 
1. OPEN 
2. OPEN 
```

or
```
+raid Leviathan|6/30 5PM PST|I need a clear for my Titan|Titan
```

would produce the output:


**Leviathan**  
**Time:** 6/30 5PM PST  
**Posted by:** cliffhanger407  
I need a clear for my Titan

To join this raid, react with the class icon you'd like to use below. For fill, use :Fill~2:.If you're not sure you can make it, press 🔃 after joining to go on the tentative list (or promote yourself back when you're sure). To leave this raid, press 🚪.

```
====ROSTER====
1. cliffhanger407 - Titan
2. OPEN 
3. OPEN 
4. OPEN 
5. OPEN 
6. OPEN 
====RESERVES==== 
1. OPEN 
2. OPEN 
```

The bot takes care of all the formatting and signups for you!

The list of activities that can be created are:
```
+raid : Raid - players : 6
+ep : Escalation Protocol - players : 9
+comp : PvP: Competitive Playlist - players : 4
+trials : PVP: Trials of the Nine - players : 4
+weekly : PvP: Weekly Playlist - players : 6
+quickplay : PvP: Quickplay - players : 6
+pve : 3 person PvE - players: 3
```

### time
Use the `+time` command with syntax:
```
+time Raid_id|Time(|AdditionalMessage)
```

You must specify a time (duh) that you want to update to. The time can be freeform, and is not errorchecked. Your message will be deleted and the raid will be edited by signup-bot.

For example, you can type: `+time 6|7/1 5PM PST|Sorry, I forgot I had something going on tonight.`
and the raid time will update to match. Additionally, a DM will be sent to everyone signed up for the raid. You can customize that message or leave the option blank. The message I just got from signup-bot says:
>### **signup-bot** - Today at 2:59 PM  
>cliffhanger407's raid Leviathan has moved from 6/30 5PM PST to 7/1 5PM PST. Sorry, I forgot I had something going on tonight.

### message
These commands are all very closely related and will all be documented here:
1. `message` or `message_all` - will message *everyone* on this raid, including reserves.
2. `message_main` - will message the main roster with a message you supply.
4. `message_reserve` - will message only those in the reserves.
3. `remind` - same as message_main, but has a clean default option for reminders, and will message only those in the main roster.

Use the `+message` commands with syntax:
```
+message Raid_id|Message
```

You need to specify a message with all message commands except `remind`. Your message will be sent to the appropriate group of people on your roster as a DM.
For example, `+message I'm sorry everyone, I have to cancel this raid tonight because my house is on fire.` will let everyone in your raid know of your plight.

Use the `+remind` command with syntax:
```
+remind Raid_id(|Message)
```

If you don't specify a message and issue `+remind 6`, a reminder with the raid time will be sent as below:
>This is a reminder that cliffhanger407's raid is starting at 6/30 5PM PST

If you choose to specify a message when using `+remind`, the above text will be completely replaced. So if you send `+remind 6|Get your asses into FT1`, then everyone will get a message saying:
>Get your asses into FT1

### delete
The delete command allows you to delete a raid either because it has completed or because you need to cancel it. Only the raid creator can delete a raid using this command. Otherwise a mod will have to clean up the raids.

Use the `+delete` command with syntax:
```
+delete Raid_id(|Message)
```

If you do not specify a message, nothing will be sent to your raiders. If you do, it will go to everyone, including the reserve list. For example:
`+delete 6` will silently delete raid 6. This is especially useful to keep the signup-list clean. However, if you want to cancel because you don't have enough people, use the command `+delete 6|I will post a list for tomorrow to see if we can get more people to sign up.`, and everyone will get that DM.


## Things you can do in #signup-here:
1. Join raids
2. Drop from a raid
3. Change your class for a raid you are in
4. Promote yourself to main roster for a raid you are in that has an open space

### join
Use the `+join` command with the syntax:
```
+join Raid_ID(|Class|Reserve|User)
```

As above. If all you want to do is join the raid as yourself, filling in as any class, you could type: `+join 6`, which would join you as a Fill into raid #6.  

Alternatively, if you need to do a run on your titan, you could type `+join 6|Titan` and it would join you as a titan. If you want to join the reserve list as a fill, you can type `+join 6||yes`. (Note, anything you put in the spot for reserve will make you reserve, even if you type 'no'). If your buddy is away from Discord but wants you to sign them up for the raid, you can type `+join 6|||signup-bot's buddy`, and that would put that person in as a fill. If you put data in between the other pipes, you could sign a friend up as a Warlock, reserve like this: `+join 6|Pocketsand|yes|signup-bot's buddy`.

If you try to sign-up for a raid that is already filled up, don't worry, I'll add you directly to the reserves. And, if someone `+drop`s, you'll get a DM letting you know that there's an open spot.

### drop
Use the `+drop` command with syntax:
```
+drop Raid_id(|User)
```
If you signed yourself up with a clever name (or signed up a friend), you must put that exact name in. Note, that you cannot drop someone from a raid unless 1) you are that person, 2) you signed that person up, or 3) you are the raid creator. Don't get any ideas.

`+drop 6` will drop me from the raid. If I want to un-sign-up @signup-bot's buddy, I will need to issue `+drop 6|signup-bot's buddy`. For now, capitalization and exact spelling are required. If there's a need, we may improve this functionality in the future.

### class

Use the `+class` command with syntax:
```
+class Raid_id(|Class|User)
```

If you previously specified a class and want to swap to Fill, all you need to do is type `+class 6`. If you want to change your class to punchbro, just type `+class 6|punchbro`. If you signed up your buddy for a raid as fill, and they let you know that they need to run on Warlock, you can just say `+class 6|warlock|signup-bot's buddy`.

That's about it for now. We will continue collecting requirements and do development over the coming months, letting you know what's available.

### promote
Use the `+class` command with syntax:
Use the `+class` command with syntax:
```
+class Raid_id(|User)
```
If you signed yourself up, you can simply type `+promote 6`. If you need to change a different user-name, you will have to type `+promote 6|signup-bot's buddy`. You can only promote yourself or someone you signed up. The raid creator can also promote reserves.
