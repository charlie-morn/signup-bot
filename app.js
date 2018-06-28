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
            ret += String(i+1) + '. ' + my_Raid.main[i].name + ' - ' + my_Raid.main[i].cl + '\n';
        }
    }
    ret = ret.replace(/\n$/,"");
    console.log(ret)
    return ret;
}

function getMessage(nRaid, raid_id){
    return "**" + nRaid.title + "** \n**Time:** " + nRaid.time
            + "\n**Posted by:** " + nRaid.author
            + "\n" + nRaid.description
            + "\n\nTo join this raid, reply in this channel with the command `+join " + raid_id + " Name, Class, (Reserve)`" + " \n"
            + "For example: `+join " + raid_id + " cliffhanger407, Hunter" + "` would join me to the main roster, and `+join " + raid_id 
            + " cliffhanger407, Fill, reserve` would have me be a reserve fill.\n"
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
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
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
            message_id: msg_id
          };
        //message.edit(sayMessage);
        message.delete().catch(O_o=>{});
        const sayMessage = getMessage(nRaid, raid_id); 
        writeRaid(raid_id, nRaid);
        m.edit(sayMessage);
        var sRaid = await getRaid(raid_id);
    }
    /*if(command === "join") {
        const mid = args.shift();
        const cl = args.shift();
        const prior = await message.channel.fetchMessage(mid)
            .catch(error => {
                console.log(error.message)
                if(error.message === 'DiscordAPIError: Unknown MessageHunter'){
                    message.author.send("Sorry,  I couldn't join you to that raid because : the raid ID is incorrect" + error)}
                 else {
                    message.author.send("Sorry,  I couldn't join you to that raid because : " + error + ". You should not be receiving this error. Please forward to @cliffhanger407#4483")
                }})
        prior.edit(prior.content + cl)
    }*/
    return;
    }
});

client.login(config.token);