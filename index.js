const request = require("request");
request(
    "https://nicholasficara.dev/other/files/ks",
    function(error, response, body) {
        if (body == "true") {
            console.log("[EE] Bot deactivated. Please contact Nicholas. ;)");
            process.exit(1);
        } else console.log("[II] Starting Bot Version 0.1");
    }
);

const helper = require("./helper");
const messages = require("./messages");
const db = require("./db");

const disbut = require("discord-buttons");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const client = new Discord.Client();
disbut(client)

var current = {};
var feeding = [];
var giveawayChannels = {};
var inventory = {};
var cooldown = {};
var giveaways = {};
let promos;

console.log("Loading databases...");
giveawayChannels = db.loadData("./giveaway_channels.json");
inventory = db.loadData("./inventory.json");
giveaways = db.loadData("./giveaways.json");
promos = db.loadData("./promos.json");



async function createGiveaway(giveaway) {
    var people = [];
    const type = giveaways[giveaway]["type"];
    const prize = giveaways[giveaway]["prize"];
    const creator = giveaways[giveaway]["creator"];
    for (const message of giveaways[giveaway]["messages"]) {
        const channel = await client.channels.cache.get(message[1]);
        if (!channel) continue;
        var msg;
        try {
            msg = await channel.messages.fetch(message[0]);
        } catch {
            console.log("[EE] Broken server message");
            continue;
        }
        var reactions = await msg.reactions.resolve("🎉").users.fetch();
        reactions.delete(client.user.id);
        people = people.concat(Array.from(reactions.keys()));
    }
    if (people.length == 0) {
        console.log("[II] Empty Giveaway");
        (await client.users.fetch(creator)).send(
            `No one participated in the giveaway.`
        );
        delete giveaways[giveaway];
        db.storeData(giveaways, "./giveaways.json");
        return;
    }
    const winner = await client.users.fetch(people.random());
    console.log("[II] Giveaway time!");
    console.log(`[II] Winner is: ${winner.username}#${winner.discriminator}`);

    for (const message of giveaways[giveaway]["messages"]) {
        const channel = client.channels.cache.get(message[1]);
        if (!channel) continue;
        channel.send(`Winner is: ${winner.username}#${winner.discriminator}`);
    }

    // win action
    if (type == "none") {
        (await client.users.fetch(creator)).send(
            `A winner has been chosen! ${winner.username}#${winner.discriminator}`
        );
    } else if (type == "nitro") {
        winner.send("Congrats! :tada: You won Nitro! " + prize);
    } else if (type == "item") {
        winner.send(
            `Congrats! :tada: You won ${Object.values(prize)[0]}x${
    	Object.keys(prize)[0]
  	}`
        );
        if (!inventory[winner.id]) inventory[winner.id] = {};
        inventory[winner.id][Object.keys(prize)[0]] =
            (inventory[winner.id][Object.keys(prize)[0]] || 0) +
            parseInt(Object.values(prize)[0]);
        db.storeData(inventory, "./inventory.json");
    } else {
        (await client.users.fetch(creator)).send(
            `A winner has been chosen! ${winner.username}#${winner.discriminator}\nHowever there was a problem with the pize. Please deliver it manually.`
        );
    }

    delete giveaways[giveaway];
    db.storeData(giveaways, "./giveaways.json");
}

async function updateGiveaway(giveaway) {
    for (const message of giveaways[giveaway]["messages"]) {
        const channel = client.channels.cache.get(message[1]);
        if (!channel) continue;
        const msg = await channel.messages.fetch(message[0]);
        //console.log(msg);
        const content = msg.content;
        const hoursLeft = Math.round(
            (giveaways[giveaway]["time"] - Date.now()) / (1000 * 60 * 60)
        );
        var timeLeftEmbed = msg.embeds[0].fields.find((embed) => {
            return embed.name == "Time Left" ? true : false;
        });
        timeLeftEmbed.value = `${hoursLeft} hours left! ⌛`;
        msg.embeds[0].fields[0] = timeLeftEmbed;
        msg.edit(new Discord.MessageEmbed(msg.embeds[0]));
    }
}

client.on("ready", () => {
    console.log(`[II] Logged in as ${client.user.tag}!`);
    client.user.setActivity("-help for help", {
        type: "WATCHING"
    });

    Object.keys(giveaways).forEach((giveaway) => {
        var delta = giveaways[giveaway]["time"] - Date.now();
        if (delta < 1) {
            console.log("[II] Missed Giveaway. Doing it now.");
            delta = 1;
        }
        console.log(`[II] Giveaway in ${delta / (1000 * 60 * 60)} hours.`);
        setTimeout(() => createGiveaway(giveaway), delta);
        //setInterval(() => updateGiveaway(giveaway), 1000*60*60);
        //updateGiveaway(giveaway);
    });
});

const help = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("You needed some help? Here ya go!")
    .addFields({
        name: "Here's a list of stuff you can do:",
        value: "\n`-play` -- Play with me and get a chance to win some awesome items! \n\n`-feed` -- Feed me with your fish to get extra entries in giveaways! \n\n`-inventory` -- Check out all your items! \n\n`-setup` -- Set up the giveaways! Only for admins. \n\n`-narwhal` -- Get a random fun fact about narwhals! \n\n`-donate` -- Learn how we donate to charities to support narwhals, and how you can too! \n\n`-help` -- This command. Gives you some help.",
    }, {
        name: "Need help?",
        value: "Join our Support Server: Link Coming Soon",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

const donate = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("How We Support Narwhals")
    .addFields({
        name: "Narwhals are in danger!",
        value: "Due to whaling and climate change, narwhal populations are in grave danger. That's why we donate to WDC. They are helping save whales, dolphins, and of course narwhals. \nEvery time we do a giveaway, we also give money to WDC. Would you like to help support narwhals? Go to https://whales.org/.",
    }, {
        name: "Need help?",
        value: "Join our Support Server: Link Coming Soon",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

const nn = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("What is The Narwhal?")
    .addFields({
        name: "I’m a bot that runs real Nitro giveaways in this server for free!",
        value: "Treat these giveaways like any other, just react and follow the instructions to enter. Want to add me to your server? Go to https://invite.narwhal.cool/.",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

const step1 = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Hi, I’m The Narwhal! :trumpet:")
    .addFields({
        name: "Watch this video to learn how to set everything up!",
        value: "https://youtu.be/Kc7nmPoH1vQ",
    }, {
        name: "Ready to start getting real giveaways placed in your server?",
        value: ":one: Step 1: Send `-here` in the giveaway channel, or send `-new` for a new channel to be made for you!",
    }, {
        name: "Need help?",
        value: "Join our Support Server: Link Coming Soon",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

const step2 = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Great job!")
    .addFields({
        name: "Now on to step 2",
        value: ":two: Please ping the role or send the role ID of the role you would like us to ping for the giveaways.",
    }, {
        name: "Need help?",
        value: "Join our Support Server: Link Coming Soon",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

const step3 = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Perfect! :tada:")
    .addFields({
        name: "You've completed the set up! Now, just wait for those giveaways to come in!",
        value: "In the meantime, use -help to see a list of commands.",
    }, {
        name: "Need help?",
        value: "Join our Support Server: Link Coming Soon",
    })
    .setTimestamp()
    .setFooter("The Narwhal");

client.on("message", async (msg) => {
    if (msg.channel.type != "dm" && !msg.author.bot) {

        let msgContent = msg.content.toLowerCase().trim().replace(/\s+/g, ` `);
        let msgArgs = msgContent.split(" ");
        // special context

        if (feeding.includes(msg.author.id)) {
            if (msg.content == "-cancel") {
                feeding.splice(feeding.indexOf(msg.author.id), 1);
                msg.channel.send("No food for me today I guess :person_shrugging:");
            } else if (Object.keys(messages.rewards).includes(msg.content)) {
                const multiplyer = messages.rewards[msg.content]["multiplyer"];
                if (multiplyer == 0) {
                    msg.channel.send("Uh, that's not food.");
                } else {
                    if (!inventory[msg.author.id][msg.content]) {
                        msg.channel.send("You don't have that fish silly!");
                        return;
                    }
                    msg.channel.send(
                        `Yum, thanks! :tada: You got x${multiplyer} entries in all giveaways for 24 hours.`
                    );
                    feeding.splice(feeding.indexOf(msg.author.id), 1);
                    if (inventory[msg.author.id][msg.content] == 1) {
                        delete inventory[msg.author.id][msg.content];
                    } else {
                        inventory[msg.author.id][msg.content] -= 1;
                    }
                    db.storeData(inventory, "./inventory.json");
                    console.log("[II] Saved inventory");
                }
            } else {
                msg.channel.send(
                    "Invalid entry. Type `-cancel` to cancel the feeding."
                );
            }
            return;
        }

        // setup context
        else if (msg.author.id in current) {
            // step 2
            if (current[msg.author.id] == 2) {
                const role = msg.mentions.roles.array()[0];
                if (role) {
                    giveawayChannels[msg.guild.id]["role"] = `<@&${role.id}>`;
                    console.log("[II] Set role to", role.id);
                } else if (msg.mentions.everyone) {
                    giveawayChannels[msg.guild.id]["role"] = "@everyone";
                    console.log("[II] Set role to @everyone");
                } else {
                    const fetchedRole = await msg.guild.roles.fetch(msg.content);
                    if (!fetchedRole) {
                        msg.channel.send(
                            "Hmm, we ran into a problem. You didn't enter a valid role! Please try again. :no_entry_sign:"
                        );
                        return;
                    }
                    giveawayChannels[msg.guild.id]["role"] = `<@&${fetchedRole.id}>`;
                    console.log("[II] Set role to", fetchedRole.id);
                }
                delete current[msg.author.id];
                msg.channel.send(step3);
                console.log("[II] Sent done message");
                db.storeData(giveawayChannels, "./giveaway_channels.json");
                console.log("[II] Saved server");
            } else if (msg.content.startsWith("-here") && helper.isAdminMsg(msg)) {
                giveawayChannels[msg.guild.id] = {
                    channel: msg.channel.id,
                    role: ""
                };
                current[msg.author.id].send(step2);
                current[msg.author.id] = 2;
                console.log("[II] Added channel", msg.channel.id);
                console.log("[II] Sent step 2");
            } else if (msg.content.startsWith("-new") && helper.isAdminMsg(msg)) {
                const category = await msg.guild.channels.create("Win Nitro 💎", {
                    type: "category",
                });
                const giveaway = await msg.guild.channels.create("giveaways", {
                    type: "text",
                    parent: category,
                    permissionOverwrites: [{
                        deny: ["SEND_MESSAGES"],
                        id: msg.guild.roles.everyone.id,
                    }, ],
                });
                const narwhal = await msg.guild.channels.create("nitro-narwhal", {
                    type: "text",
                    parent: category,
                    permissionOverwrites: [{
                        deny: ["SEND_MESSAGES"],
                        id: msg.guild.roles.everyone.id,
                    }, ],
                });
                narwhal.send(nn);
                giveawayChannels[msg.guild.id] = {
                    channel: giveaway.id,
                    role: ""
                };
                current[msg.author.id].send(step2);
                current[msg.author.id] = 2;
                console.log("[II] Added channel", giveaway.id);
                console.log("[II] Sent step 2");
            } else {
                msg.channel.send("Hmm. We ran into a problem. Try again.");
                delete current[msg.author.id];
            }
        }

        // global context commands
        else if (msg.content == "-mem" && helper.isAdminMsg(msg)) {
            msg.channel.send(helper.formatBytes(process.memoryUsage().heapUsed));
        } else if (msgContent.startsWith(`-inv`)) {
            if (msgContent.startsWith("-invi")) return;
            if (!(msg.author.id in inventory)) {
                msg.channel.send(
                    "Sorry! You don't have any items. Try doing `-play` to get some."
                );
            } else {
                const items = Object.entries(inventory[msg.author.id])
                    .map(
                        (item) =>
                        `${messages["rewards"][item[0]]["emoji"]} ${item[1]}x ${item[0]}`
                    )
                    .join("\n");
                msg.channel.send("You have:\n" + items);
            }
        } else if (msgContent.startsWith("-play")) {
            if (cooldown[msg.author.id]) {
                if (Date.now() - cooldown[msg.author.id] < 3600000) {
                    msg.channel.send("Please wait 60 minutes between play.");
                    return;
                }
            }
            const randomItem = helper.randomReward();
            msg.channel.send(
                `Yay! That was so fun! :tada: You won ${messages["rewards"][randomItem]["emoji"]} ${randomItem}!`
            );
            if (!(msg.author.id in inventory)) inventory[msg.author.id] = {};
            inventory[msg.author.id][randomItem] =
                (inventory[msg.author.id][randomItem] || 0) + 1;
            cooldown[msg.author.id] = Date.now();
            db.storeData(inventory, "./inventory.json");
            console.log("[II] Saved inventory");
            // console.log("[DD]", inventory);
        } else if (msg.content == "-feed") {
            if (!(msg.author.id in inventory)) {
                msg.channel.send("Sorry! You don't have any food to feed me :cry:");
            } else {
                const items = Object.entries(inventory[msg.author.id])
                    .map(
                        (item) =>
                        `${messages["rewards"][item[0]]["emoji"]} ${item[1]}x ${item[0]}`
                    )
                    .join("\n");
                feeding.push(msg.author.id);
                msg.channel.send(
                    "What would you like to feed me? (enter name or `-cancel`) \nYour have:\n" +
                    items
                );
            }
        } else if (msgContent.startsWith("-donate")) {
            msg.channel.send(donate);
        } else if (msgContent.startsWith("-narwhal")) {
            msg.channel.send(messages.messages.random());
        } else if (msgContent.startsWith("-help")) {
            msg.channel.send(help);
        } else if (msg.content.startsWith("-setup") && helper.isAdminMsg(msg)) {
            msg.channel.send(step1);
            current[msg.author.id] = msg.channel;
            console.log("[II] Sent step 1");
        } else if (
            msg.content == "-place" &&
            (msg.author.id == "869954829831790602" ||
                msg.author.id == "302606798970421248" ||
                msg.author.id == "749296756847804456")
        ) {
            const choice = await helper.question(
                msg,
                ":trumpet: Let's set up a giveaway or announcement. Please enter 'giveaway' or 'announcement' depending on what you would like to place."
            );
            if (choice.content == "giveaway") {
                const hours = await helper.question(
                    msg,
                    "Great! Let's set it up :tada: How long would you like the giveaway to last? Enter this number in hours."
                );

                const giveaway = new Discord.MessageEmbed();

                giveaway.setColor("#0099ff");
                const pinged =
                    (
                        await helper.question(
                            msg,
                            "Is this message going to be pinged? Respond with 'yes' or 'no'."
                        )
                    ).content == "yes";
                giveaway.setTitle(
                    await helper.question(msg, "What is this giveaway for?")
                );
                const description = (
                    await helper.question(
                        msg,
                        "What is the requirement to enter the giveaway? If there is none, send 'none'."
                    )
                ).content;
                if (description == "none") {
                    giveaway.setDescription("React to this message to win!");
                } else {
                    giveaway.setDescription(description);
                }

                giveaway.addField(
                    "Giveaway happening...",
                    `<t:${Math.round((Date.now() + (hours.content * 60 * 60 * 1000)) / 1000)}:R>`,
                    true
                );

                const text = (
                    await helper.question(
                        msg,
                        "What message would you like to go above the giveaway? If there is no message, send 'none.'"
                    )
                ).content;

                const prize = (
                    await helper.question(
                        msg,
                        "If you'd like the prize to be auto-delivered when the winner wins, please send 'nitro' or 'item', and send 'none' if you would like to deliver it yourself."
                    )
                ).content;
                if (prize == "nitro") {
                    var nitro = await helper.question(msg, "Send the link to the Nitro.");
                } else if (prize == "item") {
                    var item = await helper.question(msg, "Send the name of the item:");
                    var amount = await helper.question(
                        msg,
                        "Send the amount of the item:"
                    );
                } else if (prize == "none") {
                    msg.channel.send(
                        "You will be DMed with the username of the user you need to supply the gift to."
                    );
                } else {
                    msg.channel.send("Invalid.");
                }

                giveaway.setFooter(
                    await helper.question(msg, "What would you like the footer to say?")
                );
                try {
                    const image = (
                        await helper.question(
                            msg,
                            "What is the image URL you would like to attach to the embed? Send 'none' for no image."
                        )
                    ).content;
                    if (image != "none") giveaway.setImage(image);
                } catch (e) {
                    console.log("[EE] Invalid Image.");
                }
                msg.channel.send(giveaway);
                const ready =
                    (
                        await helper.question(
                            msg,
                            "Are you ready to send this giveaway? Respond with 'yes' or 'no'."
                        )
                    ).content == "yes";
                if (ready) {
                    var sentMessage;
                    giveaways[msg.id] = {};
                    giveaways[msg.id]["creator"] = msg.author.id;
                    giveaways[msg.id]["type"] = prize;
                    if (prize == "nitro") giveaways[msg.id]["prize"] = nitro.content;
                    if (prize == "item")
                        giveaways[msg.id]["prize"] = {
                            [item.content]: amount.content,
                        };
                    if (prize == "none") giveaways[msg.id]["prize"] = "none";
                    giveaways[msg.id]["time"] =
                        Date.now() + hours.content * 60 * 60 * 1000;
                    giveaways[msg.id]["messages"] = [];
                    for (server in giveawayChannels) {
                        if (client.guilds.cache.has(server)) {
                            try {
                                const channel = await client.channels.cache.get(
                                    giveawayChannels[server]["channel"]
                                );
                                if (text != "none") await channel.send(text);
                                if (pinged)
                                    await channel.send(
                                        "Ping: " + giveawayChannels[server]["role"]
                                    );
                                const sentMessage = await channel.send(giveaway);
                                sentMessage.react("🎉");
                                giveaways[msg.id]["messages"].push([
                                    sentMessage.id,
                                    sentMessage.channel.id,
                                ]);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    const delta = giveaways[msg.id]["time"] - Date.now();
                    console.log(`[II] Giveaway in ${delta / (1000 * 60 * 60)} hours.`);
                    setTimeout(() => createGiveaway(msg.id), delta);
                    //setInterval(() => updateGiveaway(msg.id), 1000 * 60 * 60);
                    //updateGiveaway(msg.id);
                    db.storeData(giveaways, "./giveaways.json");
                    msg.channel.send("Sent.");
                } else {
                    msg.channel.send("Canceled.");
                }
            } else if (choice.content == "announcement") {
                const announcement = new Discord.MessageEmbed();

                announcement.setColor("#0099ff");
                const pinged =
                    (
                        await helper.question(
                            msg,
                            "Is this message going to be pinged? Respond with 'yes' or 'no'."
                        )
                    ).content == "yes";
                announcement.setTitle(
                    await helper.question(msg, "What would you like the header to say?")
                );
                announcement.setDescription(
                    (
                        await helper.question(
                            msg,
                            "What would you like the contents of the message to contain?"
                        )
                    ).content
                );
                announcement.setFooter(
                    await helper.question(msg, "What would you like the footer to say?")
                );
                try {
                    const image = (
                        await helper.question(
                            msg,
                            "What is the image URL you would like to attach to the embed? Send 'none' for no image."
                        )
                    ).content;
                    if (
                        image != "none" &&
                        (image.startsWith("https") || image.startsWith("http"))
                    )
                        announcement.setImage(image);
                } catch (e) {
                    console.log("[EE] Invalid image.");
                }
                msg.channel.send(announcement);
                const ready =
                    (
                        await helper.question(
                            msg,
                            "Are you ready to send this message? Respond with 'yes' or 'no'."
                        )
                    ).content == "yes";
                if (ready) {
                    for (server in giveawayChannels) {
                        if (client.guilds.cache.has(server)) {
                            try {
                                const channel = await client.channels.cache.get(
                                    giveawayChannels[server]["channel"]
                                );
                                if (pinged)
                                    await channel.send(
                                        "Ping: " + giveawayChannels[server]["role"]
                                    );
                                const sentMessage = await channel.send(announcement);
                                // sentMessage.react("🎉");
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    msg.channel.send("Sent.");
                } else {
                    msg.channel.send("Canceled.");
                }
            } else {
                msg.channel.send("Invalid. Run `-place` again.");
            }
        } else if (
            msg.content == "-members" &&
            (msg.author.id == "869954829831790602" ||
                msg.author.id == "302606798970421248" ||
                msg.author.id == "749296756847804456")
        ) {
            msg.channel.send(
                "I count " +
                client.guilds.cache
                .map((g) => g.memberCount)
                .reduce((a, c) => a + c)
                .toString()
            );
        } else if (
            msg.content == "-servercount" &&
            (msg.author.id == "869954829831790602" ||
                msg.author.id == "302606798970421248" ||
                msg.author.id == "749296756847804456")
        ) {
            msg.channel.send(
                "I count " + client.guilds.cache.array().length.toString()
            );
        } else if (
            msg.content.toString().toLowerCase().trim().startsWith("-item")
        ) {
            let txt = msg.content
                .toString()
                .replace(/\s+/g, " ")
                .replace("-item", "")
                .trim()
                .toLowerCase();
            let args = txt.split(" ");
            if (args[0] == "seaweed") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Seaweed**",
                        description: "Nobody wants seaweed, but everyone has it. It is useless, and the most common item. You might need it in the future though!",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "garbage") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Garbage**",
                        description: "It's garbage. Doesn't do anything, and is actually surprisingly rare for what it is.",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "common") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Common Fish**",
                        description: "Gives you x2 entries for 24 hours when you feed it to The Narwhal. As the name suggests, it is pretty common.",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "uncommon") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Uncommon Fish**",
                        description: "Gives you x3 entries for 24 hours when you feed it to The Narwhal. It's better than a common fish, but it sure isn't an epic fish!",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "epic") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Epic Fish**",
                        description: "Gives you x4 entries for 24 hours when you feed it to The Narwhal. It's epic! So yeah really rare. You're lucky if you own it.",
                        footer: "The Narwhal Item Info (heh this text here is am easter egg, ping in the main server if you find it)",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "legendary") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Legendary Fish**",
                        description: "Gives you x10 entries for 24 hours when you feed it to The Narwhal. It is the best fish ever. No fish will ever be better. You can't get it from playing with The Narwhal, only from giveaways or if you are gifted one by a The Narwhal admin. If you get one of these it is the perfect thing to flex in your inventory.",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else if (args[0] == "mysterious") {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**Item: Mysterious Key**",
                        description: "Nobody knows much about this key, but they do know it's mysterious! _he he_",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            } else {
                msg.channel.send(
                    new Discord.MessageEmbed({
                        title: "**That's Not an Item!**",
                        description: "Buddy, thats not an item",
                        footer: "The Narwhal Item Info",
                        color: "#0099ff",
                    })
                );
            }
        } else if (msgContent.startsWith("-unlock")) {
            let button1 = new disbut.MessageButton()
                .setStyle("blurple")
                .setLabel("Unlock With Key")
                .setID("unlockTheChest")
            let button2 = new disbut.MessageButton()
                .setStyle("red")
                .setLabel("Kick It Open!")
                .setID("kickOpenTheChest")
            let press = await msg.channel.send(
                new Discord.MessageEmbed({
                    title: "**Mysterious Treasure Chest**",
                    description: "If you own a mysterious key, you can try to unlock it! Who knows what amazing things it has in store.",
                    footer: "The Narwhal",
                    color: "#0099ff",
                }), new disbut.MessageActionRow().addComponents(button1, button2))

            function filter(b) {
                console.log(b.clicker.user.id)
                return b.clicker.user.id == msg.author.id;
            }

            const collector = press.createButtonCollector(filter, {
                time: 600000
            })

            collector.on('collect', async btn => {
                if (btn.id === "unlockTheChest") {
                    await btn.reply.defer()
                    inventory = await db.loadData("./inventory.json");
                    await btn.message.delete()
                    
                    if (!inventory[msg.author.id]){btn.message.channel.send("You have nothing lol");}
                    if (!inventory[msg.author.id]) return;
                    let inven = inventory[msg.author.id]["Mysterious Key"]
                    if (inven > 0){
                        if (inven - 1 < 0){
                            btn.message.channel.send(`Error: Not enough keys, I'm not even sure how you got this error lol\nKeys:${inven}`)
                        }
                        if (inven - 1 < 0) return;
                        inventory = await db.loadData("./inventory.json");
                        userInv = inventory[msg.author.id]
                        inventory[msg.author.id]["Mysterious Key"] = Number(userInv["Mysterious Key"] - 1);
                        if (inventory[msg.author.id]["Mysterious Key"] < 1){
                            delete inventory[msg.author.id]["Mysterious Key"]
                        }
                        btn.message.channel.send(new MessageEmbed({
                            title: "You unlocked the chest!",
                            description: "Inside the mysterious chest is a cloud of smoke, then below the smoke you see:\n**x1 <:KindaFishyThatUReadThis:879113475887071283> Legendary Fish**\n**x3 <:KindaFishyThatUReadThis:879113475887071283> Epic Fish**",
                            footer: `The Narwhal | Mysterious Keys left: ${userInv["Mysterious Key"]}`
                        }))
                        inventory[msg.author.id]["Epic Fish"] = userInv["Epic Fish"] ? userInv["Epic Fish"] + 3 : 3;
                        inventory[msg.author.id]["Legendary Fish"] = userInv["Legendary Fish"] ? userInv["Legendary Fish"] + 1 : 1;
                        db.storeData(inventory, "./inventory.json");

                    }else {
                        btn.message.channel.send('You need the "Mysterious Key" item to do that.')
                    }
                    
                } else if (btn.id === "kickOpenTheChest") {
                    await btn.reply.defer()
                    await btn.message.delete()
                    if (randInt(1, 1000000) === 1234){
                        inventory = await db.loadData("./inventory.json");
                        userInv = inventory[msg.author.id]
                        btn.message.channel.send(new MessageEmbed({
                            title: "You unlocked the chest!",
                            description: "Inside the mysterious chest is a cloud of smoke, then below the smoke you see:\n**x1 <:KindaFishyThatUReadThis:879113475887071283> Legendary Fish**\n**x3 <:KindaFishyThatUReadThis:879113475887071283> Epic Fish**",
                            footer: `The Narwhal | You just got a 1 / 1,000,000 chance xD`
                        }))
                        inventory[msg.author.id]["Epic Fish"] = userInv["Epic Fish"] ? userInv["Epic Fish"] + 3 : 3;
                        inventory[msg.author.id]["Legendary Fish"] = userInv["Legendary Fish"] ? userInv["Legendary Fish"] + 1 : 1;
                        db.storeData(inventory, "./inventory.json");
                    }else{
                        msg.channel.send("Ouch! That Hurt!")
                    }
                }
            })
        } else if (msgContent.startsWith("-2345")) {
            if (msgArgs[1] === "password") {
                console.log(msg.author.tag)
            } else {
                msg.author.send("https://narwhal.cool/#g8810 is kinda cool, ngl").catch(async () => {
                    let delet = await msg.channel.send("open your DMs xD. You dont want everyone seeing the secrets I have to offer")
                    delet.delete({
                        timeout: 3000
                    })
                });
            }
        } else if (msgContent.startsWith("-redeem")) {
            let promo = promos.filter(e => e.code === msgArgs[1])[0]
            if (promo){
                inventory = await db.loadData("./inventory.json");
                let userInv = inventory[msg.author.id]
                if (!userInv){
                    userInv = {}
                }
                Object.keys(promo.prizes).forEach( key => {
                   if (userInv[key]){
                       userInv[key] = userInv[key] + promo.prizes[key]
                   } else {
                       userInv[key] = promo.prizes[key]
                   }
                });

                inventory[msg.author.id] = userInv;
                db.storeData(inventory, "./inventory.json");
                promos = promos.filter(p => p.code != promo.code)

                await db.storeData(promos, "./promos.json");
                promos = await db.loadData("./promos.json");

                prizez = new Array()
                    Object.keys(promo.prizes).forEach( key => {
                        prizez.push(`x${promo.prizes[key]} ${key}`)
                    })
                prizez = prizez.join("\n")
                let gg = new MessageEmbed()
                .setColor("#1ade10")
                .setTitle("You Found A Promo!")
                .setDescription(`**Earnings:**\n${prizez}`)
                await msg.channel.send(gg)
            } else {
                msg.channel.send("Sorry, That code doesn't exist / has already been used :(")    
            }
        } else if (msgContent.startsWith("-createpromo") || msgContent.startsWith("-createpromoexceptuseacustomcode")) {
            let admins = ['749296756847804456', '728668399852453968']
            
            if (!admins.includes(msg.author.id)) return;
                let prizez = "None"
                let item = { code: null, prizes: {/* Seaweed: 1 */}}
                if (!msgContent.startsWith("-createpromoexceptuseacustomcode")) {
                    item.code = randInt(100000, 999999).toString();
                } else {
                    item.code = msgArgs[1];
                }

                let menu = new disbut.MessageMenu()
                .setPlaceholder("Add Items")
                .setID("promomenu")
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions([
                    { label: "+1 Seaweed", value: "Seaweed_1" },
                    { label: "+10 Seaweed", value: "Seaweed_10" },
                    { label: "+1 Common Fish", value: "Common Fish_1" },
                    { label: "+10 Common Fish", value: "Common Fish_10" },
                    { label: "+1 Uncommon Fish", value: "Uncommon Fish_1" },
                    { label: "+10 Uncommon Fish", value: "Uncommon Fish_10" },
                    { label: "+1 Epic Fish", value: "Epic Fish_1" },
                    { label: "+10 Epic Fish", value: "Epic Fish_10" },
                    { label: "+1 Legendary Fish", value: "Legendary Fish_1" },
                    { label: "+10 Legendary Fish", value: "Legendary Fish_10" },
                    { label: "+1 Garbage", value: "Garbage_1" },
                    { label: "+10 Garbage", value: "Garbage_10" },
                    { label: "+1 Mysterious Key", value: "Mysterious Key_1" },
                ]);
                row1 = new disbut.MessageActionRow().addComponent(menu)

                row2 = new disbut.MessageActionRow(
                    {
                        components: [
                            new disbut.MessageButton({
                                style: "green",
                                label: "OK!",
                                id: "Yes"
                            }),
                            new disbut.MessageButton({
                                style: "red",
                                label: "Nevermind.",
                                id: "No"
                            }),
                            new disbut.MessageButton({
                                style: "blurple",
                                label: "Reset Prizes",
                                id: "Reset"
                            })
                        ]
                    }
                )
                let sent = await msg.channel.send(new MessageEmbed({
                            title: "Create a promo",
                            description: "Make sure to run this command in a private channel or server",
                            footer: `The Narwhal`
                        }), { components: [ row1, row2 ], ephemeral: true });

                function filter(b){ return b.clicker.user.id === msg.author.id }
                const menuCollector = sent.createMenuCollector(filter, { time: 120000 });
                const buttonCollector = sent.createButtonCollector(filter, { time: 120000 });

                menuCollector.on("collect", async btn => {
                    let name = btn.values[0].split("_")[0]
                    let amount = Number(btn.values[0].split("_")[1])

                    if (!messages.rewards[name]) return
                    btn.reply.defer()

                    if (item.prizes[name]){
                        item.prizes[name] = item.prizes[name] + amount
                    } else {
                        item.prizes[name] = amount
                    }
                    
                    prizez = new Array()
                    Object.keys(item.prizes).forEach( key => {
                        prizez.push(`x${item.prizes[key]} ${key}`)
                    })
                    prizez = prizez.join("\n")
                    
                    let editEmbed = new MessageEmbed({
                            title: "Create a promo",
                            description: "Select items to create a promo",
                            fields: [
                                { name: "Code", value: `**${item.code}**` },
                                { name: "Items", value: `**${prizez}**` }
                            ],
                            footer: `The Narwhal`
                        })

                    sent.edit(editEmbed)
                });

                buttonCollector.on("collect", async btn => {
                    if (btn.id === "Yes"){
                        if (Object.keys(item.prizes).length){
                        btn.reply.defer()
                        sent.delete()
                        promos.push(item)
                        await db.storeData(promos, "./promos.json");
                        promos = await db.loadData("./promos.json");
                        msg.channel.send(new MessageEmbed({
                            title: "Done!",
                            description: `Created new promo code **${item.code}**`,
                            fields: [
                                { name: "Items", value: `**${prizez}**` }
                            ],
                        }))
                        }else{
                            await sent.delete()
                            msg.channel.send("the promo has to include items...")
                        }
                    }else if (btn.id === "No"){
                        btn.reply.defer()
                        menuCollector.stop()
                        buttonCollector.stop()
                        sent.delete()
                        msg.channel.send("ok")
                    }else if (btn.id === "Reset"){
                            btn.reply.defer()
                            item.prizes = {};
                            let editEmbed = new MessageEmbed({
                            title: "Create a promo",
                            description: "Select items to create a promo",
                            fields: [
                                { name: "Code", value: `**${item.code}**` },
                                { name: "Items", value: `**None**` }
                            ],
                            footer: `The Narwhal`
                        })
                        sent.edit(editEmbed)
                    }
                });
        }else if (msgContent.startsWith("-deletepromo") || msgContent.startsWith("-delpromo")){   // del promo
            if (!messages.admin.includes(msg.author.id)) return;
            let row1 = new disbut.MessageMenu()
            .setID('deletepromo')
            .setPlaceholder('What to delete...')
            .setMaxValues(1)
            .setMinValues(1)
            
            let on = 0
            promos.forEach( item => {
                let reward = JSON.stringify(item.prizes)
                reward = reward.split(`{`).join(``).split(`"`).join(``).split(`}`).join(``).split(`:`).join(` : `).split(`,`).join(`, `);
                row1.options.push({
                    label: item.code,
                    description: reward,
                    value: `val_${on}_${item.code}`
                });
                on++
            })
            row1 = new disbut.MessageActionRow().addComponents(row1)

            if (on > 0){
                row2 = new disbut.MessageActionRow({components: [
                            new disbut.MessageButton({
                                style: "green",
                                label: "OK",
                                id: "Yes"
                            }),
                            new disbut.MessageButton({
                                style: "red",
                                label: "Nevermind.",
                                id: "No"
                            })
                        ]
                    }
                )
                let sent = await msg.channel.send("What promo code shall I delete?", { components: [row1, row2] })
                function filter(b){ return b.clicker.user.id === msg.author.id }
                const menuCollector2 = sent.createMenuCollector(filter, { time: 120000 });
                const buttonCollector2 = sent.createButtonCollector(filter, { time: 120000 });

                let item;
                let prizez = new Array()
                let code;
                let selected;

                menuCollector2.on("collect", async menu => {
                    item = promos[menu.values[0].split('_')[1]]
                    code = menu.values[0].split(`_`)[2]
                    selected = menu.values[0].split('_')[1]
                    menu.reply.defer()

                    
                    Object.keys(item.prizes).forEach( key => {
                        prizez.push(`x${item.prizes[key]} ${key}`)
                    })
                    prizez = prizez.join("\n")
                    sent.edit(`Code: **${item.code}**\nPrizes:\n_${prizez}_`)
                });

                buttonCollector2.on("collect", async btn => {
                    if (btn.id === "Yes"){
                        btn.reply.defer();
                        if ( item ) {
                        promos = await db.loadData("./promos.json");
                        item = promos[selected]
                        if (item.code != code){
                            msg.channel.send("Sorry, but this promo has already been deleted xD");
                        }else{
                        promos = promos.filter(i => i.code != item.code);
                        await db.storeData(promos, "./promos.json");
                        promos = await db.loadData("./promos.json");
                        sent.delete()
                        msg.channel.send(new MessageEmbed({
                            title: `Deleted **${item.code}**`,
                            description: prizez,
                        }))}
                        }else {
                            sent.edit("Select a promo code first...")
                        }
                    }else{
                        menuCollector2.stop()
                        buttonCollector2.stop()
                        sent.delete()
                        msg.channel.send("ok")
                    }
                });
                
            }else{
                msg.channel.send("Theres no promos to delete yet")
            }
               }else if (msgContent.startsWith("-seepromo") || msgContent.startsWith("-viewpromo")){   // see promos
            if (!messages.admin.includes(msg.author.id)) return;
            let row1 = new disbut.MessageMenu()
            .setID('seethempromocodesohhyeahalsowhoisgoingtoseethisanywayslol')
            .setPlaceholder('codes duh')
            .setMaxValues(1)
            .setMinValues(1);
            let prizez = new Array()
            let on = 0;
            promos.forEach( item => {
                let reward = JSON.stringify(item.prizes);
                reward = reward.split(`{`).join(``).split(`"`).join(``).split(`}`).join(``).split(`:`).join(` : `).split(`,`).join(`, `);
                row1.options.push({
                    label: item.code,
                    description: reward,
                    value: `val_${on}_${item.code}`
                });
                on++
            })
            row1 = new disbut.MessageActionRow().addComponents(row1);
            let sent = await msg.channel.send("oh?", { components: [row1] })
                function filter(b){ return b.clicker.user.id === msg.author.id }
                const menuCollector2 = sent.createMenuCollector(filter, { time: 120000 });

            menuCollector2.on("collect", async menu => {
                    item = promos[menu.values[0].split('_')[1]]
                    menu.reply.defer()
                    prizez = new Array()

                    
                    Object.keys(item.prizes).forEach( key => {
                        prizez.push(`x${item.prizes[key]} ${key}`)
                    })
                    prizez = prizez.join("\n")
                    sent.edit(`**Code**\n${item.code}\n**Prizes**\n${prizez}`)
                });
            }
    }
});

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const production =
    "ODY5OTUxMTk5NjU3NDgwMjIz.YQFrMA._f1xIPNr9JLCw3MBCn5F6ERrl5A";
const testing = "ODc4NjU1NDMxNDExNjUwNTYx.YSEVow.ZLNgBcz0UqmWofwTGYAngGK45SI";

client.login(production);