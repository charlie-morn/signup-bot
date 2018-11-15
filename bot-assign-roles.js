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
async function reactRole(message){
    for (var key in config.roles) {
        await message.react(config.roles[key].id);
    }
}

async function getRoleMessage(embed){
    //var retmsg =  ""
    for (var key in config.roles) {
        if(config.roles[key].emoji != config.roles[key].id){
            embed.fields.push({
                name: "<:"+ config.roles[key].emoji +":"+ config.roles[key].id +"> : @" + config.roles[key].role,
                value: config.roles[key].description})
            //retmsg = retmsg + "\n<:"+ config.roles[key].emoji +":"+ config.roles[key].id +"> : @" + config.roles[key].role + " - " + config.roles[key].description;
        }else{
            embed.fields.push({
                name: config.roles[key].emoji +": @" + config.roles[key].role,
                value: config.roles[key].description
            })
            //embed.addField(config.roles[key].emoji +": @" + config.roles[key].role, config.roles[key].description)
            //retmsg = retmsg + "\n"+ config.roles[key].emoji +": @" + config.roles[key].role + " - " + config.roles[key].description;
        }
    }
    return embed
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
    if(config.role_channel.indexOf(reaction.message.channel.name)<0) return;
    var response = "";
    var member = reaction.message.channel.guild.member(user);
    var roles = reaction.message.channel.guild.roles;
    //console.log(roles)
    for (var key in config.roles){
        if (config.roles[key].emoji == reaction.emoji.name){
            //console.log(member.roles)
            if(await member.roles.some(r=>[config.roles[key].role].includes(r.name))){
                response = "Removed " + user.username + " from " + config.roles[key].role;
                var role = await roles.find(r=>[config.roles[key].role].includes(r.name))
                await member.removeRole(role.id);
            }else{
                response = "Added " + user.username + " to " + config.roles[key].role;
                var role = await roles.find(r=>[config.roles[key].role].includes(r.name))
                await member.addRole(role.id)
            }
        }
    }
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
  
    if(config.role_channel.indexOf(message.channel.name) >= 0){
        console.log(Date.now() + ": " + message.author.username + " - " + message.content)
        const args = message.content.slice(config.prefix.length).split(/ +/g);
        const command = args.shift().toLowerCase();

        if(command == "role"){
            var m_embed = {
                color: 0x00AE86,
                /*
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },*/
                title: "__**Self-Service Role Assignment**__",
                description: "To add or remove optional server roles to your account, please react to this message.",
                fields:[],
                timestamp: new Date(),
                footer: {
                    text: "To suggest new roles, DM an admin."
                }
            }
            m_embed = await getRoleMessage(m_embed);
            var m = await message.channel.send({embed: m_embed})
            reactRole(m);
            //m.setTitle("Test Update")
            return;
        }

        message.author.send("The only command that can be issued in this channel is `+role`. It has no arguments and refreshes the roles displayed.")
        message.delete().catch(O_o=>{})
        return;
    }
});

process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));

client.login(config.token);