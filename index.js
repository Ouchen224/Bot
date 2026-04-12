
require("./deploy-commands");

const express = require("express");
const axios = require("axios");
require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

// ======================
// EXPRESS API
// ======================
const app = express();
app.use(express.json());

app.get("/api/commands", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/notify", (req, res) => {
    console.log("notify:", req.body);
    res.sendStatus(200);
});

app.post("/api/players", (req, res) => {
    console.log("players:", req.body);
    res.sendStatus(200);
});

// ======================
// START SERVER (RENDER FIX)
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("API started on port " + PORT);
});

// ======================
// DISCORD BOT
// ======================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// 🔥 IMPORTANT ENV
const API_URL = process.env.API_URL;
const API_SECRET = process.env.API_SECRET;

// ======================
// SEND COMMAND TO FIVEM
// ======================
async function sendCommand(type, data, interaction) {
    try {
        await axios.post(`${API_URL}/commands`, {
            type,
            executor: interaction.user.username,
            executorId: interaction.user.id,
            data
        }, {
            headers: {
                "x-api-secret": API_SECRET
            }
        });

        return true;
    } catch (err) {
        console.error("SEND ERROR:", err.message);
        return false;
    }
}

// ======================
// READY
// ======================
client.once("ready", () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);
});

// ======================
// SLASH COMMANDS
// ======================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({ ephemeral: true });

    let ok = false;

    switch (interaction.commandName) {

        case "kick":
            ok = await sendCommand("kick", {
                playerId: interaction.options.getInteger("playerid"),
                reason: interaction.options.getString("reason")
            }, interaction);
            break;

        case "ban":
            ok = await sendCommand("ban", {
                playerId: interaction.options.getInteger("playerid"),
                days: interaction.options.getInteger("days"),
                reason: interaction.options.getString("reason")
            }, interaction);
            break;

        case "announce":
            ok = await sendCommand("announce", {
                message: interaction.options.getString("message")
            }, interaction);
            break;

        case "giveitem":
            ok = await sendCommand("give_item", {
                playerId: interaction.options.getInteger("playerid"),
                item: interaction.options.getString("item"),
                quantity: interaction.options.getInteger("quantity")
            }, interaction);
            break;

        case "givevehicle":
            ok = await sendCommand("give_vehicle", {
                playerId: interaction.options.getInteger("playerid"),
                model: interaction.options.getString("model")
            }, interaction);
            break;

        case "teleport":
            ok = await sendCommand("teleport", {
                playerId: interaction.options.getInteger("playerid"),
                x: interaction.options.getNumber("x"),
                y: interaction.options.getNumber("y"),
                z: interaction.options.getNumber("z")
            }, interaction);
            break;

        case "weather":
            ok = await sendCommand("weather", {
                type: interaction.options.getString("type")
            }, interaction);
            break;

        case "time":
            ok = await sendCommand("time", {
                hour: interaction.options.getInteger("hour"),
                minute: interaction.options.getInteger("minute")
            }, interaction);
            break;

        case "revive":
            ok = await sendCommand("revive", {
                playerId: interaction.options.getInteger("playerid")
            }, interaction);
            break;

        case "jail":
            ok = await sendCommand("jail", {
                playerId: interaction.options.getInteger("playerid"),
                minutes: interaction.options.getInteger("minutes"),
                reason: interaction.options.getString("reason")
            }, interaction);
            break;

        case "unjail":
            ok = await sendCommand("unjail", {
                playerId: interaction.options.getInteger("playerid")
            }, interaction);
            break;

        case "warn":
            ok = await sendCommand("warn", {
                playerId: interaction.options.getInteger("playerid"),
                reason: interaction.options.getString("reason")
            }, interaction);
            break;

        case "wipe":
            ok = await sendCommand("wipe", {
                playerId: interaction.options.getInteger("playerid")
            }, interaction);
            break;
    }

    await interaction.editReply(
        ok ? "✅ Commande envoyée au serveur FiveM" : "❌ Erreur envoi commande"
    );
});

// ======================
// LOGIN BOT
// ======================
client.login(process.env.TOKEN);
