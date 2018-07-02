Signup bot is used to manage our clan's raid lists and is currently under early development. 

Currently the commands that can be issued with this bot are:

In #signup-list

[`+raid $Title | $Date | $Description (| $Class)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#raid) to create a raid. Optionally establish your class.  
[`+time $Raid_id|$Time`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#time) to change the time of a raid you've created.  
[`+message $Raid_id|Message Text (can also be +message_all, +message_reserve or +message_main)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#message) to message members of your raid  
[`+remind $Raid_id(|Reminder Text)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#message) same as message, but will default to a reminder of the time if you don't put a message in.  

In #signup-here

[`+join $Raid_id(|$Class|$Reserve|$User)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#join) will join a raid.  
[`+drop $Raid_id(|$User)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#drop) will drop yourself or a user you signed up from a raid.  
[`+class $Raid_id(|$Class|$User)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#class) will change your class for a raid.  
[`+promote $Raid_id(|$User)`](https://github.com/cliffhanger407/signup-bot/blob/master/README.md#promote) will promote your role in the raid from reserves to main roster if there's space available.

(If you can't find it, the | key is just above your Enter key on a standard keyboard.)

Arguments in parentheses are optional and do not need to be included. The arguments are ordered, however, so if you want to join your friend Dave to the main roster as a titan, you'd say something like `+raid 5|Titan||Dave`. If Dave wanted to fill any class needed you could say `+raid 5|||Dave`. Keep in mind the number will change, depending on which raid ID it is. I'm not a mind-reader.

More detailed documentation is available on the [github site for the bot](https://github.com/cliffhanger407/signup-bot).

If the bot is misbehaving, you can DM @cliffhanger407 or create an issue on the github. Want to contribute? Make a pull request!