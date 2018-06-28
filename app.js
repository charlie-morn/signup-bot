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

function writeRaid(raid_id){

}

function getRaid(raid_id){

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
          message.author.send("You have posted an invalid response. Please try again.")
          message.delete().catch(O_o=>{});
          return;
      }
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "say") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const sayMessage = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        message.delete().catch(O_o=>{}); 
        // And we get the bot to say the thing: 
        message.channel.send(sayMessage);
      } 
    if(command === "id"){
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
        message.delete().catch(O_o=>{});
        console.log(await storage.length()); // yourname
    }
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
        await storage.setItem(raid_id, nRaid);
        m.edit(sayMessage);
        var sRaid = await storage.getItem(raid_id);
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
  /* 
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
 
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
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
*/
});

client.login(config.token);