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

function getFormattedList(my_Raid){
    var ret = "====ROSTER====\n";
    for (var i = 0; i<6; i++){
        if(typeof my_Raid.main[i]== 'undefined'){
            ret += String(i+1) + '. OPEN \n';
        }else{
            ret += String(i+1) + '. ' + my_Raid.main[i].name + ' - ' + my_Raid.main[i].cl + '\n';
        }
    }
    ret += "====RESERVES==== \n"
    for (var i = 0; i<Math.max(my_Raid.reserves.length, 2); i++){
        if(typeof my_Raid.reserves[i]== 'undefined'){
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
            + "\n" + nRaid.description
            + "\n\nTo join this raid, reply in #" + config.signup_here + " with the command `+join " + raid_id + "|Name|Class(|Reserve)`" + " \n"
            + "For example: `+join " + raid_id + "|signup-bot|Hunter" + "` would join me to the main roster, and `+join " + raid_id 
            + "|signup-bot|Fill|reserve` would have me be a reserve fill.\n"
            + "```" + getFormattedList(nRaid) + "```";
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
        return message.reply("You are already in this raid, please leave and rejoin if you want to swap roles.");
    }
    if(typeof res != 'undefined'){
        sRaid.reserves.push({name: user, cl: m_cl, adding_user: message.author.username});
        message.react('✅');
        retStr =  "I've added you to the reserve list.";
    }
    else{
        if(sRaid.main.length < 6){
            sRaid.main.push({name: user, cl: m_cl, adding_user: message.author.username});
            message.react('✅');
            retStr = "You're in!";
        }else{
            sRaid.reserves.push({name: user, cl:m_cl, adding_user: message.author.username});
            message.react('❕');
            retStr = "List was full, but you have been added to reserves.";
        }
    }
    writeRaid(raid_id, sRaid);
    return retStr;
}
function dropIndex(arr, index, user, message, author){
    if(message.author.username==arr[index].name || message.author.username==arr[index].adding_user || message.author.username == author){
        arr.splice(index,1);
        message.react('✅');
        return "User " + user + " removed successfully.";
    }else{
        message.react('🛑');
        return "You are not authorized to remove " + user + " from the raid.";
    }
}
async function dropFromRaid(raid_id, sRaid, user, message){
    var retStr = "I've encountered some sort of strange exception. Try again maybe? But also maybe not. I'm not sure. This should never happen.";
    if(typeof user == 'undefined'){
        user = message.author.username;
    }
    var index = findIndexOfUser(sRaid.main, user);
    if(index >= 0){
        retStr = dropIndex(sRaid.main, index, user, message, sRaid.author);
    }else{
        index = findIndexOfUser(sRaid.reserves, user);
        if(index >= 0){
            retStr = dropIndex(sRaid.reserves, index, user, message, sRaid.author);
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
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
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
        //The syntax for creating a new raid is:
        //+raid Raid Name, 5/21 8:00 PST, (Description, Class)
        const args2 = args.join(" ").split('|');

        const raids = args2.shift();
        if(typeof raids == 'undefined'){
            message.author.send("Sorry, I couldn't create this raid because you haven't specified a raid, time, or description. Please re-read the pinned syntax for creating raids and resbumit.")
            message.delete().catch(O_o=>{});
            return;
        }
            //.catch(error=>{message.author.send("Sorry,  I couldn't create that raid because you have not supplied a valid title. Please re-read the syntax for creation and re-submit."});
        const time = args2.shift();
        if(typeof time == 'undefined'){
            message.author.send("Sorry, I couldn't create this raid because you haven't specified a time or description. Please re-read the pinned syntax for creating raids and resbumit.")
            message.delete().catch(O_o=>{});
            return;
        }
        const desc = args2.shift();
        if(typeof desc == 'undefined'){
            message.author.send("Sorry, I couldn't create this raid because you haven't specified a description. Please re-read the pinned syntax for creating raids and resbumit.")
            message.delete().catch(O_o=>{});
            return;
        }
        var m_cl = args2.shift();
        if(typeof m_cl == 'undefined'){
            m_cl = 'Fill';
        }
        const m = await message.channel.send("Preparing...");
        const msg_id = m.id;

        var raid_id = await getId();//await storage.length() + 1);
        
        var nRaid = {
            title: raids,
            description: desc,
            main: [{name: message.author.username, cl: m_cl}],
            reserves: [],
            time: time,
            author: message.author.username,
            message_id: msg_id,
            channel_id: m.channel.id
          };
        //message.edit(sayMessage);
        message.delete().catch(O_o=>{});
        const sayMessage = getMessage(raid_id, nRaid); 
        writeRaid(raid_id, nRaid);
        m.edit(sayMessage);
    }
    if(command === "purge") {
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
      }
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

        if(command == "join"){
            const args2 = args.join(" ").split('|');
            const raid_id = args2.shift();
            if(typeof raid_id == 'undefined'){
                message.reply("Sorry, I can't add you unless you tell me which raid you want. Please check the syntax for this function and resubmit.")
                return;
            }
            var user = args2.shift();
            if(typeof user == 'undefined'){
                user = message.author.username;
                //message.reply("For now, I'm requiring you to give me a username to sign up. This may change in the future if my author can figure out something clever. Please check the syntax for this function and resubmit.")
                //return;
            }
            var cl = args2.shift();
            if(typeof cl == 'undefined'){
                cl = 'Fill'
            }
            const res = args2.shift();
            
            var sRaid = await getRaid(raid_id);
            if(typeof sRaid == 'undefined'){
                message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
                return;
            };
            var addResponse = await addToRaid(raid_id, sRaid, user, cl, res, message);
            var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
            updateRaidMessage(raid_id, sRaid, raidMsg);
            message.reply(addResponse);
        }
        if(command == "drop" || command == "kick" || command =="getfucked"){
            const args2 = args.join(" ").split('|');
            const raid_id = args2.shift();
            if(typeof raid_id == 'undefined'){
                return message.reply("Sorry, I can't drop you unless you tell me which raid you want out of. Please check the syntax for this function and resubmit.");
            }
            var user = args2.shift();
            var sRaid = await getRaid(raid_id);
            if(typeof sRaid == 'undefined'){
                return message.reply("Sorry, I couldn't find a raid with ID " + raid_id + ". Please try again and resubmit.");
            };
            if(user == sRaid.author){
                return message.reply("You can't use this command to leave your own raid. You must delete it separately. (This functionality not yet implemented).")
            } else {
                var dropResponse = await dropFromRaid(raid_id, sRaid, user, message);
                var raidMsg = await message.guild.channels.get(sRaid.channel_id).fetchMessage(sRaid.message_id);
                updateRaidMessage(raid_id, sRaid, raidMsg);
                message.reply(dropResponse);
            }
        }
        if(command === "purge") {
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
          }
    }
});

client.login(config.token);