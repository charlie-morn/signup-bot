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
const storage_lookup = require('node-persist');
const storage_log = require('node-persist');
//storage holds all the raid information that the bot uses

async function createActivity(args2, playerCounts, activity, message, mID, mChID){
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
        author_id: message.author.id,
        players: playerCounts,
        activityType: activity
        };
    //message.edit(sayMessage);
    return nRaid;
}

async function getActivityPlayers(activity_id){
    mRaid = await getActivity(activity_id)
    if(mRaid){
        if(mRaid.players) return parseInt(mRaid.players);
        else return 6;
    }
    else{ return 6;}
}

async function getFormattedList(activity_id, my_Raid){
    var ret = "====ROSTER====\n";
    var players = await getActivityPlayers(activity_id)
    for (var i = 0; i<players; i++){
        if(!my_Raid.main[i]){
            ret += String(i+1) + '. OPEN \n';
        }else{
            ret += String(i+1) + '. ' + my_Raid.main[i].name + ' - ' + my_Raid.main[i].cl + '\n';
        }
    }
    if(my_Raid.main.length > players){
        ret += "====RESERVES - WILL AUTOPROMOTE IF SPACE OPENS====\n"
        for (var i=players; i< my_Raid.main.length; i++){
            ret += String(i+1 - players) + '. ' + my_Raid.main[i].name + ' - ' + my_Raid.main[i].cl + '\n';
        }
    }
    ret += "====TENTATITVE - WILL NOT AUTOPROMOTE==== \n"
    for (var i = 0; i<Math.max(my_Raid.reserves.length, 1); i++){
        if(!my_Raid.reserves[i]){
            ret += String(i+1) + '. OPEN \n';
        }else{
            ret += String(i+1) + '. ' + my_Raid.reserves[i].name + ' - ' + my_Raid.reserves[i].cl + '\n';
        }
    }
    ret = ret.replace(/\n$/,"");
    return ret;
}

async function getMessage(activity_id, nRaid){
    return "**__" + nRaid.activityType + ":__ " + nRaid.title 
            + "** \n**Time:** " + nRaid.time
            + "\n**Posted by:** " + nRaid.author
            + "\n**Activity ID: **" + activity_id 
            + "\n" + nRaid.description
            + "\n\nTo join this raid, react with the class icon you'd like to use below. For fill, use <:Fill:"+ config.classes["Fill"] + ">."
            + "If you're not sure you can make it, press 🔃 after joining to go on the tentative list (or promote yourself back when you're sure). To leave this raid, press 🚪."
            + "```" + await getFormattedList(activity_id, nRaid) + "```";
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
    for (var key in config.classes) {
        await message.react(config.classes[key]);
    }
    await message.react('🔃');
    await message.react('🚪');
}

async function writeRaid(activity_id, nRaid){
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
    await storage.setItem(activity_id, nRaid);

    await storage_lookup.init({
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
    await storage_lookup.setItem(nRaid.message_id, activity_id);

}

async function getActivity(activity_id){
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
    return await storage.getItem(activity_id)
}
async function getActivityIDFromMessageID(message_id){
    //Reads the raid from persistent storage.
    await storage_lookup.init({
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
    return await storage_lookup.getItem(message_id)
}
async function updateRaidMessage(activity_id, sRaid, message){
    const sayMessage = await getMessage(activity_id, sRaid); 
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
async function addToRaid(activity_id, sRaid, user, m_cl, res, message, adding_user_id){
    var retStr = "I've encountered some sort of strange exception. Try again maybe? But also maybe not. I'm not sure. This should never happen.";
    var players = await getActivityPlayers(activity_id);
    if(!adding_user_id) { var adding_id = message.author.id;}
    else{ var adding_id = adding_user_id;}
    if(!message) {var adding_user = user;}
    else{ var adding_user = message.author.username; }
    if(findIndexOfUser(sRaid.main, user) != -1 || findIndexOfUser(sRaid.reserves, user) != -1){
        return "You are already in this raid, please use the icons to change classes, or the 🔃 button to swap to/from the tentative roster."
    }
    if(res){
        sRaid.reserves.push({name: user, cl: m_cl, adding_user: adding_user, adding_user_id: adding_id});
        if (message) message.react('✅');
        retStr =  "I've added " + user + " to the tentative list. You will not be autopromoted.";
    }
    else{
        if(sRaid.main.length < players){
            sRaid.main.push({name: user, cl: m_cl, adding_user: adding_user, adding_user_id: adding_id});
            if (message) message.react('✅');
            retStr = user + ", you're in!";
        }else{
            sRaid.main.push({name: user, cl:m_cl, adding_user: adding_user, adding_user_id: adding_id});
            if (message) message.react('❕');
            retStr = "List was full, but " + user + " has been added to reserves. You will be autopromoted if space opens.";
        }
    }
    await writeRaid(activity_id, sRaid);
    return retStr;
}
function getSignupListHelp(){
    var ret = "The commands you can issue here include `+raid`, `+time`, `+delete` and the variants of `+message`.\n"
    ret += "To create a raid, use the syntax `+raid Title | Date | Description (| Class)`. (Note that the parentheses shouldn't be included, they are to designate optional arguments)."
    ret += "\nOther activities you can create are: ep, gambit, trials, comp, weekly (pvp), quickplay, pve"
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
async function modifyRaidTime(activity_id, sRaid, newTime, message){
    if(ownsRaid(message.author.id, sRaid)){
        const oldTime = sRaid.time;
        sRaid.time = newTime;
        await writeRaid(activity_id, sRaid);
        return [0, sRaid.author + "'s raid " + sRaid.title + " has moved from " + oldTime + " to " + newTime + "."];
    }
    return [1, "You are not authorized to modify " + sRaid.author + "'s raid."]
}
async function deleteRaid(message){
    message.delete()
}
async function ownsUser(arr, index, message, author){
    return (message.author.username == config.botname || 
        message.author.username==arr[index].name || 
        message.author.username==arr[index].adding_user || 
        message.author.username == author ||
        message.member.roles.some(r=>["Admin", "admin", "Clan Leader", "Skynet"].includes(r.name)) 
    );
}
async function swapRoles(activity_id, sRaid, user, message){
    var index = findIndexOfUser(sRaid.reserves, user);
    var retStr = "";
    var players = await getActivityPlayers(activity_id)
    if(index > -1){
        if(await ownsUser(sRaid.reserves, index, message, sRaid.author)){
            sRaid.main.push(sRaid.reserves[index]);
            sRaid.reserves.splice(index, 1);
            if(sRaid.main.length >= players){
                retStr =  "❕ This raid is full, but " + user + " has been moved to the reserves list.";
            }else{
                retStr =  "✅ " + user + " has been promoted to the main roster."
            }
        }else{
            retStr =  "❌ You are not authorized to modify " + user + ".";
        }
    }else{
        index = findIndexOfUser(sRaid.main, user);
        if(index > -1){
            if (await ownsUser(sRaid.main, index, message, sRaid.author)){
                sRaid.reserves.push(sRaid.main[index]);
                sRaid.main.splice(index, 1);
                retStr =  "✅ " + user + " has been moved to the tentative roster."
            }else{
                retStr =  "❌ You are not authorized to modify " + user + ".";
            }
        }else{
            retStr =  "❌ " + user + " is not in the reserves list for this raid.";
        }
    }
    await writeRaid(activity_id, sRaid);
    return retStr;
    
}
async function promoteRaider(activity_id, sRaid, user, message){
    return swapRoles(activity_id, sRaid, user, message);
}
async function modifyUserIndex(arr, index, user, message, author, dispo, modTo){
    var ou = await ownsUser(arr, index, message, author);
    if(ou){
        //if (message) {message.react('✅');}
        if(dispo=='drop'){
            arr.splice(index,1);
            return "User " + user + " has been removed successfully.";
        }
        if(dispo=='class'){
            arr[index].cl = modTo;
            return "User " + user + " has class changed to " + modTo + ".";
        }
    }else{
        //if (message) {message.react('❌');}
        return "You are not authorized to modify " + user + ".";
    }
}
async function modifyRaidUser(activity_id, sRaid, user, message, dispo, modTo){
    var retStr = "I've encountered some sort of strange exception. Try again maybe? But also maybe not. I'm not sure. This should never happen.";
    var players = await getActivityPlayers(activity_id)
    if(!user){
        user = message.author.username;
    }
    var index = findIndexOfUser(sRaid.main, user);
    if(index >= 0){
        retStr = await modifyUserIndex(sRaid.main, index, user, message, sRaid.author, dispo, modTo);
        if(dispo=='drop' && retStr.startsWith("User") && sRaid.main.length == players - 1){
            const msg = "A free space has opened in " + sRaid.author + "'s raid at " + sRaid.time + ". "
            + "If you would like to join, please go to #" + config.signup_here + " and issue the command: \n"
            + "`"+ config.prefix + "promote " + activity_id + "|";
            await messageRaiders(sRaid, message, msg, "reserve", true);
        }else if (dispo=='drop' ** sRaid.main.length >= players && index < 6){
            const msg = "A free space has opened in " + sRaid.author + "'s event at " + sRaid.time + ". "
            + "You have been autopromoted into the main roster. (Activity ID: " + activity_id + ")"
            await message.guild.members.get(sRaid.main[players - 1].adding_user_id).send(msg);
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
    await writeRaid(activity_id, sRaid);
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

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.bot) return;
    if(reaction.message.channel.name != config.signup_list) return;
    var activity_id = await getActivityIDFromMessageID(reaction.message.id);
    console.log(Date.now() + ": " + user.username + " - " + reaction.emoji.name + " on " + activity_id)
    var sRaid = await getActivity(activity_id)
    var response = "";
    if (findIndexOfUser(sRaid.main, user.username)==-1 
        && findIndexOfUser(sRaid.reserves, user.username)==-1 
        && config.classes[reaction.emoji.name]){
        response = await addToRaid(activity_id, sRaid, user.username, reaction.emoji.name, undefined, undefined, user.id);
        //console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
    }else{
        //await message.react('🔃');
        //await message.react('🚪');
        if(reaction.emoji.name == '🔃'){
            response = await swapRoles(activity_id, sRaid, user.username, reaction.message)
        } else if (reaction.emoji.name == '🚪'){
            response = await modifyRaidUser(activity_id, sRaid, user.username, reaction.message, 'drop', reaction.emoji.name);
        }else{
            response = await modifyRaidUser(activity_id, sRaid, user.username, reaction.message, 'class', reaction.emoji.name);
        }
    }
    var raidMsg = await reaction.message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
    updateRaidMessage(activity_id, sRaid, raidMsg);
    var m = await reaction.message.channel.send(response);
    reaction.remove(user);
    setTimeout(function(){m.delete()}, 7000);
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  
    if(message.channel.name == config.signup_list){
        console.log(Date.now() + ": " + message.author.username + " - " + message.content)
        const args = message.content.slice(config.prefix.length).split(/ +/g);
        const command = args.shift().toLowerCase();

        if(config.activityType[command]) {
            const m = await message.channel.send("Preparing...");
            const nRaid = await createActivity(args.join(" ").split('|'), config.activityType[command].count, 
                config.activityType[command].name, message, m.id, m.channel.id);
            var activity_id = await getId();//await storage.length() + 1);
            message.delete().catch(O_o=>{});
            await writeRaid(activity_id, nRaid);
            const sayMessage = await getMessage(activity_id, nRaid); 
            await m.edit(sayMessage);
            await reactRaid(m);
            return;
        }
        if(command == "time"){
            const args2 = args.join(" ").split('|');

            var activity_id = args2.shift();
            if(activity_id){activity_id = activity_id.trim();}
            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
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
            const newTimeMessage = await modifyRaidTime(activity_id, sRaid, newTime, message);
            if(newTimeMessage[0] == 0){
                await messageRaiders(sRaid, message, newTimeMessage[1] + " " + text, "all");
                var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
                updateRaidMessage(activity_id, sRaid, raidMsg);
                message.delete().catch(O_o=>{});
                return;
            }
            else{
                message.delete().catch(O_o=>{});
                return message.author.send(newTimeMessage[1]);
            }
            return;
        }
        if(command == "remind" || command == "message" || command == "message_all" || command == "message_reserve" 
            || command == "message_reserves" || command == "message_main" || command == "message_mains" 
            || command == "delete"){
            const args2 = args.join(" ").split('|');

            var activity_id = args2.shift();
            if(activity_id){activity_id = activity_id.trim();}
            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                await message.author.send("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
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
            return;
        }
        if(command == "help"){
            await message.author.send(getSignupListHelp());
            var rep = message.reply("Help information has been sent to you via DM.")
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            return;
        }
        if(command == "join" || command == "add"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                message.reply("Sorry, I can't add you unless you tell me a title you want. Please check the syntax for this function and resubmit.")
                return;
            }
            activity_id = activity_id.trim();
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}
            
            var res = args2.shift();
            if(res){res=res.trim();}
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}
            
            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
                return;
            };
            var addResponse = await addToRaid(activity_id, sRaid, user, cl, res, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(addResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            return;
        }
        if(command == "drop" || command == "kick" || command =="getfucked" || command == "leave"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't drop you unless you tell me which raid you want out of. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim();

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
            };
            //if(user == sRaid.author && user == message.author.username){
            //    return message.reply("You can't use this command to leave your own raid. You must cancel it separately. (This functionality not yet implemented).")
            //} else {
            var dropResponse = await modifyRaidUser(activity_id, sRaid, user, message, 'drop');
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(dropResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            //}
            return;
        }
        if(command == "class"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim()
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
            };
            var changeResponse = await modifyRaidUser(activity_id, sRaid, user, message, 'class', cl);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(changeResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            return;
        }
        if(command == "promote"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim();
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find an activity with ID " + activity_id + ". Please try again and resubmit.");
            };
            var promoteResponse = await promoteRaider(activity_id, sRaid, user, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            await writeRaid(activity_id, sRaid);
            var rep = message.reply(promoteResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            return;
        }
        if(!message.member.roles.some(r=>["Admin", "admin", "Clan Leader", "Skynet"].includes(r.name)) ){
            await message.author.send("Only bot commands can be issued in this channel. The output of the +help command follows: " + getSignupListHelp());
            //console.log(message.member.roles)
            var rep = message.reply("That message does not meet the requirements for this channel. Only bot commands may be issued. A help message has been sent to you via DM.")
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
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
    }
    if(message.channel.name == config.signup_here){
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
            var activity_id = args2.shift();
            if(!activity_id){
                message.reply("Sorry, I can't add you unless you tell me a title you want. Please check the syntax for this function and resubmit.")
                return;
            }
            activity_id = activity_id.trim();
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}
            
            var res = args2.shift();
            if(res){res=res.trim();}
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}
            
            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
                return;
            };
            var addResponse = await addToRaid(activity_id, sRaid, user, cl, res, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(addResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
        }
        if(command == "drop" || command == "kick" || command =="getfucked" || command == "leave"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't drop you unless you tell me which raid you want out of. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim();

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
            };
            //if(user == sRaid.author && user == message.author.username){
            //    return message.reply("You can't use this command to leave your own raid. You must cancel it separately. (This functionality not yet implemented).")
            //} else {
            var dropResponse = await modifyRaidUser(activity_id, sRaid, user, message, 'drop');
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(dropResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
            //}
        }
        if(command == "class"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim()
            var cl = args2.shift();
            if(cl){cl = cl.trim();}
            if(!cl){cl = 'Fill';}

            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find a raid with ID " + activity_id + ". Please try again and resubmit.");
            };
            var changeResponse = await modifyRaidUser(activity_id, sRaid, user, message, 'class', cl);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            var rep = message.reply(changeResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
        }
        if(command == "promote"){
            const args2 = args.join(" ").split('|');
            var activity_id = args2.shift();
            if(!activity_id){
                return message.reply("Sorry, I can't change your class unless you tell me which raid. Please check the syntax for this function and resubmit.");
            }
            activity_id = activity_id.trim();
            var user = args2.shift();
            if(user){user = user.trim();}
            if(!user){user = message.author.username;}

            var sRaid = await getActivity(activity_id);
            if(!sRaid){
                return message.reply("Sorry, I couldn't find an activity with ID " + activity_id + ". Please try again and resubmit.");
            };
            var promoteResponse = await promoteRaider(activity_id, sRaid, user, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(activity_id, sRaid, raidMsg);
            await writeRaid(activity_id, sRaid);
            var rep = message.reply(promoteResponse)
                .then(sent => setTimeout(function(){sent.delete()}, 7000))
                .catch(console.error);
            setTimeout(function(){message.delete()}, 7000);
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

process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));

client.login(config.token);