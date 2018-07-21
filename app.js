// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

const storage = require('node-persist');
//storage holds all the raid information that the bot uses

async function createRaid(args2, message, mID, mChID){
    const raids = args2.shift();
    if(!raids){
        message.author.send("Sorry, I couldn't create this raid because you haven't specified a raid, time, or description. Please re-read the pinned syntax for creating raids and resbumit.")
        message.delete().catch(O_o=>{});
        return;
    }
        //.catch(error=>{message.author.send("Sorry,  I couldn't create that raid because you have not supplied a valid title. Please re-read the syntax for creation and re-submit."});
    const time = args2.shift();
    if(!time){
        message.author.send("Sorry, I couldn't create this raid because you haven't specified a time or description. Please re-read the pinned syntax for creating raids and resbumit.")
        message.delete().catch(O_o=>{});
        return;
    }
    const desc = args2.shift();
    if(!desc){
        message.author.send("Sorry, I couldn't create this raid because you haven't specified a description. Please re-read the pinned syntax for creating raids and resbumit.")
        message.delete().catch(O_o=>{});
        return;
    }
    var m_cl = args2.shift();
    if(!m_cl){
        m_cl = 'Fill';
    }
    
    var nRaid = {
        title: raids,
        description: desc,
        main: [{name: message.author.username, cl: m_cl, adding_user_id: message.author.id}],
        reserves: [],
        time: time,
        author: message.author.username,
        message_id: mID,
        channel_id: mChID,
        author_id: message.author.id
        };
    //message.edit(sayMessage);
    return nRaid;
}

function getFormattedList(my_Raid){
    var ret = "====ROSTER====\n";
    for (var i = 0; i<6; i++){
        if(!my_Raid.main[i]){
            ret += String(i+1) + '. OPEN \n';
        }else{
            ret += String(i+1) + '. ' + my_Raid.main[i].name + ' - ' + my_Raid.main[i].cl + '\n';
        }
    }
    ret += "====RESERVES==== \n"
    for (var i = 0; i<Math.max(my_Raid.reserves.length, 2); i++){
        if(!my_Raid.reserves[i]){
            ret += String(i+1) + '. OPEN \n';
        }else{
            ret += String(i+1) + '. ' + my_Raid.reserves[i].name + ' - ' + my_Raid.reserves[i].cl + '\n';
        }
    }
    ret = ret.replace(/\n$/,"");
    return ret;
}

function getMessage(raid_id, nRaid){
    return "**" + nRaid.title + "** \n**Time:** " + nRaid.time
            + "\n**Posted by:** " + nRaid.author
            + "\n**Bot Raid ID: **" + raid_id 
            + "\n" + nRaid.description
            + "\n\nTo join this raid, reply in #" + config.signup_here + " with the command `"+ config.prefix +"join " + raid_id + "(|Class|Reserve|Name)`" + " \n"
            + "For example: `"+ config.prefix +"join " + raid_id + "|Hunter" + "` would join me to the main roster, and `"+ config.prefix +"join " + raid_id 
            + "|Fill|reserve` would have me be a reserve fill. Lastly, `+join " + raid_id + "|Titan||signup-bot-evil-twin` would add my evil twin to the raid.\n"
            + "```" + getFormattedList(nRaid) + "```"
            + "\n ."
            + "\n .";
}

async function getId(){
    await storage.init({
        dir: 'raid_store',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,  // can also be custom logging function
        ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
        expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
        // in some cases, you (or some other service) might add non-valid storage files to your
        // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
        forgiveParseErrors: false
    });
    return String(await storage.length() + 1); // yourname
}

async function reactRaid(message){
    await message.react(config.warlock);
    await message.react(config.titan);
    await message.react(config.hunter);
    await message.react(config.fill);
    await message.react('❓');
    await message.react('🚪');
}

async function writeRaid(raid_id, nRaid){
    //Writes the raid to persistent storage.
    await storage.init({
        dir: 'raid_store',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,  // can also be custom logging function
        ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
        expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
        // in some cases, you (or some other service) might add non-valid storage files to your
        // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
        forgiveParseErrors: false
    });
    await storage.setItem(raid_id, nRaid);

    await storage.init({
        dir: 'message_raid_map',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,  // can also be custom logging function
        ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
        expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
        // in some cases, you (or some other service) might add non-valid storage files to your
        // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
        forgiveParseErrors: false
    });
    await storage.setItem(nRaid.message_id, raid_id);

}

async function getRaid(raid_id){
    //Reads the raid from persistent storage.
    await storage.init({
        dir: 'raid_store',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,  // can also be custom logging function
        ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
        expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
        // in some cases, you (or some other service) might add non-valid storage files to your
        // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
        forgiveParseErrors: false
    });
    return await storage.getItem(raid_id)
}
async function getRaidFromMessageID(message_id){
        //Reads the raid from persistent storage.
        await storage.init({
            dir: 'message_raid_map',
            stringify: JSON.stringify,
            parse: JSON.parse,
            encoding: 'utf8',
            logging: false,  // can also be custom logging function
            ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
            expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
            // in some cases, you (or some other service) might add non-valid storage files to your
            // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
            forgiveParseErrors: false
        });
        return await storage.getItem(message_id)
}
async function updateRaidMessage(raid_id, sRaid, message){
    const sayMessage = getMessage(raid_id, sRaid); 
    message.edit(sayMessage);
    //client.TextChannel.fetchMessage(sRaid.message_id)
    //    .then(message => message.edit(sayMessage));
}
function findIndexOfUser(userList, user){
    for(i=0;i<userList.length;i++){
        if(userList[i].name == user){
            return i;
        }
    }
    return -1;
}
async function addToRaid(raid_id, sRaid, user, m_cl, res, message){
    var retStr = "I've encountered some sort of strange exception. Try again maybe? But also maybe not. I'm not sure. This should never happen.";
    if(findIndexOfUser(sRaid.main, user) != -1 || findIndexOfUser(sRaid.reserves, user) != -1){
        return "You are already in this raid, please use `"+config.prefix+"class`  to change classes, or `" + config.prefix + "promote`"
            + " to promote to the main roster."
    }
    if(res){
        sRaid.reserves.push({name: user, cl: m_cl, adding_user: message.author.username, adding_user_id: message.author.id});
        message.react('✅');
        retStr =  "I've added you to the reserve list.";
    }
    else{
        if(sRaid.main.length < 6){
            sRaid.main.push({name: user, cl: m_cl, adding_user: message.author.username, adding_user_id: message.author.id});
            message.react('✅');
            retStr = "You're in!";
        }else{
            sRaid.reserves.push({name: user, cl:m_cl, adding_user: message.author.username, adding_user_id: message.author.id});
            message.react('❕');
            retStr = "List was full, but you have been added to reserves.";
        }
    }
    writeRaid(raid_id, sRaid);
    return retStr;
}
function getSignupListHelp(){
    var ret = "The commands you can issue here include `+raid`, `+time`, `+delete` and the variants of `+message`.\n"
    ret += "To create a raid, use the syntax `+raid Title | Date | Description (| Class)`. (Note that the parentheses shouldn't be included, they are to designate optional arguments)."
    ret += "\nFor more help related to the #signup-list channel, please go to https://github.com/cliffhanger407/signup-bot#things-you-can-do-in-signup-list";
    return ret;
}

function getSignupHereHelp(){
    var ret = "The commands you can issue here include `+join`, `+drop`, `+class`, and `+promote`.\n";
    ret += "To join a raid (raid IDs are noted in the raid posting) as any class simply type `+join RaidID`. If you want to play as your Titan just type `+join RaidID|Titan`";
    ret += "For help related to the #signup-here channel, please go to https://github.com/cliffhanger407/signup-bot#things-you-can-do-in-signup-here";
    return ret;
}
async function messageRaiders(sRaid, message, text, group, endWithUser){
    if(group == "main" || group =="all"){
        for(i=0; i<sRaid.main.length;i++){
            var sendText = text;
            if(endWithUser){
                sendText += sRaid.main[i].name + '`';
            }
            await message.guild.members.get(sRaid.main[i].adding_user_id).send(sendText);
        }
    }
    if(group == "reserve" || group == "all"){
        for(i=0; i<sRaid.reserves.length;i++){
            var sendText = text;
            if(endWithUser){
                sendText += sRaid.reserves[i].name + '`';
            }
            await message.guild.members.get(sRaid.reserves[i].adding_user_id).send(sendText);
        }
    }
}
function ownsRaid(sender, sRaid){
    return (sRaid.author_id == sender);
}
async function modifyRaidTime(raid_id, sRaid, newTime, message){
    if(ownsRaid(message.author.id, sRaid)){
        const oldTime = sRaid.time;
        sRaid.time = newTime;
        writeRaid(raid_id, sRaid);
        return [0, sRaid.author + "'s raid " + sRaid.title + " has moved from " + oldTime + " to " + newTime + "."];
    }
    return [1, "You are not authorized to modify " + sRaid.author + "'s raid."]
}
async function deleteRaid(message){
    message.delete()
}
function ownsUser(arr, index, message, author){
    return (message.author.username==arr[index].name || message.author.username==arr[index].adding_user || message.author.username == author);
}
function promoteRaider(sRaid, user, message){
    const index = findIndexOfUser(sRaid.reserves, user)
    if(sRaid.main.length > 5 && index > -1){
        message.react('❌');
        return "That raid is full, cannot promote.";
    }else if(index > -1){
        if(ownsUser(sRaid.reserves, index, message, sRaid.author)){
            const user_dict = sRaid.reserves[index];
            sRaid.main.push(user_dict);
            sRaid.reserves.splice(index, 1);
            message.react('✅');
            return user + " has been promoted to the main roster."
        }else{
            message.react('❌');
            return "You are not authorized to modify " + user + ".";
        }
    }else{
        message.react('❌');
        return "That user is not in the reserves list for this raid.";
    }
    
}
function modifyUserIndex(arr, index, user, message, author, dispo, modTo){
    if(ownsUser(arr, index, message, author)){
        message.react('✅');
        if(dispo=='drop'){
            arr.splice(index,1);
            return "User " + user + " removed successfully.";
        }
        if(dispo=='class'){
            arr[index].cl = modTo;
            return "User " + user + " class changed to " + modTo + ".";
        }
    }else{
        message.react('❌');
        return "You are not authorized to modify " + user + ".";
    }
}
async function modifyRaidUser(raid_id, sRaid, user, message, dispo, modTo){
    var retStr = "I've encountered some sort of strange exception. Try again maybe? But also maybe not. I'm not sure. This should never happen.";
    if(!user){
        user = message.author.username;
    }
    var index = findIndexOfUser(sRaid.main, user);
    if(index >= 0){
        retStr = modifyUserIndex(sRaid.main, index, user, message, sRaid.author, dispo, modTo);
        if(dispo=='drop' && retStr.startsWith("User") && sRaid.main.length == 5){
            const msg = "A free space has opened in " + sRaid.author + "'s raid at " + sRaid.time + ". "
            + "If you would like to join, please go to #" + config.signup_here + " and issue the command: \n"
            + "`"+ config.prefix + "promote " + raid_id + "|";
            await messageRaiders(sRaid, message, msg, "reserve", true);
        }
    }else{
        index = findIndexOfUser(sRaid.reserves, user);
        if(index >= 0){
            retStr = modifyUserIndex(sRaid.reserves, index, user, message, sRaid.author, dispo, modTo);
        }
        else{
            retStr = "That user is not in this raid. Check for spelling errors and try again.";
        }
    }
    writeRaid(raid_id, sRaid);
    return retStr;
}

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`For help go to https://goo.gl/QLSNVU`);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`For help go to https://goo.gl/QLSNVU`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`For help go to https://goo.gl/QLSNVU`);
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();

	if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	const reaction = message.reactions.get(emojiKey);

	client.emit(events[event.t], reaction, user);
});

client.on('messageReactionAdd', (reaction, user) => {
    if(user.bot) return;
    
	console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  
  if(message.channel.name === config.signup_list){
    if(message.content.indexOf(config.prefix) !== 0){
          //Commenting these to allow for other messages to be posted.
          //message.author.send("You have posted an invalid response. Please try again.")
          //message.delete().catch(O_o=>{});
          return;
      }
    const args = message.content.slice(config.prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "raid") {
        const m = await message.channel.send("Preparing...");
        const nRaid = await createRaid(args.join(" ").split('|'), message, m.id, m.channel.id);
        var raid_id = await getId();//await storage.length() + 1);
        message.delete().catch(O_o=>{});
        const sayMessage = getMessage(raid_id, nRaid); 
        writeRaid(raid_id, nRaid);
        await m.edit(sayMessage);
        await reactRaid(m);
    }
    if(command == "time"){
        const args2 = args.join(" ").split('|');

        var raid_id = args2.shift();
        if(raid_id){raid_id = raid_id.trim();}
        var sRaid = await getRaid(raid_id);
        if(!sRaid){
            message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            return;
        };
        var newTime = args2.shift();
        if(newTime){newTime = newTime.trim();}
        else{
            message.delete().catch(O_o=>{});
            return message.author.send("You must specify a time to update this raid to.");
        }
        var text = args2.shift();
        if(text){text = text.trim();}
        else{text = "";}
        const newTimeMessage = await modifyRaidTime(raid_id, sRaid, newTime, message);
        if(newTimeMessage[0] == 0){
            await messageRaiders(sRaid, message, newTimeMessage[1] + " " + text, "all");
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            message.delete().catch(O_o=>{});
            return;
        }
        else{
            message.delete().catch(O_o=>{});
            return message.author.send(newTimeMessage[1]);
        }
    }
    if(command == "remind" || command == "message" || command == "message_all" || command == "message_reserve" 
        || command == "message_reserves" || command == "message_main" || command == "message_mains" 
        || command == "delete"){
        const args2 = args.join(" ").split('|');

        var raid_id = args2.shift();
        var sRaid = await getRaid(raid_id);
        if(!sRaid){
            await message.author.send("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            message.delete().catch(O_o=>{});
            return;
        };
        var msg_text = args2.shift();
        if(msg_text){msg_text = msg_text.trim();}
        else if(command == "remind"){
            msg_text = "This is a reminder that " + sRaid.author + "'s raid is starting at " + sRaid.time;
        }
        else if(command != "delete"){
            await message.author.send("Sorry, you need to specify a message for your reminder.")
            message.delete().catch(O_o=>{});
            return;
        }
        var send_to = "all";
        if(command=="messsage_reserve" || command == "message_reserves"){
            send_to = "reserve";
        }else if(command=="remind" || command=="message_main" || command == "message_mains"){
            send_to = "main";
        }
        //Add a function here that will verify that the user is authorized to remind.
        if(sRaid.author_id == message.author.id){
            if(msg_text){
                await messageRaiders(sRaid, message, msg_text, send_to);
            }
            if (command == "delete"){
                var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
                await deleteRaid(raidMsg)
                    .catch(console.error);
            }
        }else{
            await message.author.send("You are not authorized to send reminders for this raid. Please check the ID and try again.");
        }
        message.delete().catch(O_o=>{});
    }
    if(command == "help"){
        await message.author.send(getSignupListHelp());
        message.delete().catch(O_o=>{});
    }
    /**if(command === "purge") {
        // This command removes all messages from all users in the channel, up to 100.
        
        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);
        
        // Ooooh nice, combined conditions. <3
        if(!deleteCount || deleteCount < 2 || deleteCount > 100)
          return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
        
        // So we get our messages, and delete them. Simple enough, right?
        const fetched = await message.channel.fetchMessages({limit: deleteCount});
        message.channel.bulkDelete(fetched)
          .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
      }*/
    return;
    }
    if(message.channel.name === config.signup_here){
        if(message.content.indexOf(config.prefix) !== 0){
            //Commenting these to allow for other messages to be posted. This ignores input that does not begin with our prefix.
            //message.author.send("You have posted an invalid response. Please try again.")
            //message.delete().catch(O_o=>{});
            return;
        }
        const args = message.content.slice(config.prefix.length).split(/ +/g);
        const command = args.shift().toLowerCase();

        if(command == "join" || command == "add"){
            const args2 = args.join(" ").split('|');
            var raid_id = args2.shift();
            if(!raid_id){
                message.reply("Sorry, I can't add you unless you tell me a title you want. Please check the syntax for this function and resubmit.")
                return;
            }
            raid_id = raid_id.trim();
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}
            
            var res = args2.shift();
            if(res){res=res.trim();}
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}
            
            var sRaid = await getRaid(raid_id);
            if(!sRaid){
                message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
                return;
            };
            var addResponse = await addToRaid(raid_id, sRaid, user, cl, res, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            return message.reply(addResponse);
        }
        if(command == "drop" || command == "kick" || command =="getfucked" || command == "leave"){
            const args2 = args.join(" ").split('|');
            var raid_id = args2.shift();
            if(!raid_id){
                return message.reply("Sorry, I can't drop you unless you tell me which raid you want out of. Please check the syntax for this function and resubmit.");
            }
            raid_id = raid_id.trim();

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getRaid(raid_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            };
            //if(user == sRaid.author && user == message.author.username){
            //    return message.reply("You can't use this command to leave your own raid. You must cancel it separately. (This functionality not yet implemented).")
            //} else {
            var dropResponse = await modifyRaidUser(raid_id, sRaid, user, message, 'drop');
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            message.reply(dropResponse);
            //}
        }
        if(command == "class"){
            const args2 = args.join(" ").split('|');
            var raid_id = args2.shift();
            if(!raid_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            raid_id = raid_id.trim()
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getRaid(raid_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            };
            var changeResponse = await modifyRaidUser(raid_id, sRaid, user, message, 'class', cl);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            message.reply(changeResponse);
        }
        if(command == "promote"){
            const args2 = args.join(" ").split('|');
            var raid_id = args2.shift();
            if(!raid_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            raid_id = raid_id.trim();
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getRaid(raid_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            };
            var promoteResponse = await promoteRaider(raid_id, sRaid, user, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            writeRaid(raid_id, sRaid);
            message.reply(promoteResponse);
        }
        if(command == "help"){
            await message.reply(getSignupHereHelp());
        }
        /**if(command === "purge") {
            // This command removes all messages from all users in the channel, up to 100.
            
            // get the delete count, as an actual number.
            const deleteCount = parseInt(args[0], 10);
            
            // Ooooh nice, combined conditions. <3
            if(!deleteCount || deleteCount < 2 || deleteCount > 100)
              return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
            
            // So we get our messages, and delete them. Simple enough, right?
            const fetched = await message.channel.fetchMessages({limit: deleteCount});
            message.channel.bulkDelete(fetched)
              .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
          }*/
          return;
    }
});

client.login(config.token);