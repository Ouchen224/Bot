require("./deploy-commands");

const express = require("express");
const axios = require("axios");
require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// ======================
// QUEUES / STORAGE
// ======================
let commandsQueue = [];
let resultsMap = {};

// ======================
// LOG ALL REQUESTS (DEBUG)
// ======================
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.url}`);
    next();
});

// ======================
// DISCORD -> API (SEND COMMAND)
// ======================
app.post("/api/commands", (req, res) => {
    const command = req.body;

    if (!command || !command.type) {
        return res.status(400).json({ error: "Invalid command" });
    }

    commandsQueue.push(command);

    console.log("📩 Commande reçue:", command.type);

    res.json({ success: true });
});

// ======================
// FIVEM -> GET COMMANDS
// ======================
app.get("/api/commands", (req, res) => {
    const secret = req.headers["x-api-secret"];

    if (secret !== process.env.API_SECRET) {
        return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ commands: commandsQueue });

    commandsQueue = [];
});

// ======================
// RESULT RECEIVER (FIVEM -> DISCORD)
// ======================
app.post("/api/command-result", (req, res) => {
    console.log("📩 COMMAND RESULT RECEIVED");
    console.log(req.body);

    const { commandId, ok, message } = req.body;

    if (!commandId) {
        return res.status(400).json({ error: "Missing commandId" });
    }

    resultsMap[commandId] = {
        ok: !!ok,
        message: message || "No message",
        time: Date.now()
    };

    res.status(200).json({ success: true });
});

// ======================
// DISCORD POLL RESULT
// ======================
app.get("/api/command-result/:id", (req, res) => {
    const id = req.params.id;

    const result = resultsMap[id];

    if (!result) {
        return res.json({ pending: true });
    }

    delete resultsMap[id];

    res.json(result);
});

// ======================
// LOG ROUTES
// ======================
app.post("/api/notify", (req, res) => {
    console.log("notify:", req.body);
    res.sendStatus(200);
});

app.post("/api/players", (req, res) => {
    console.log("players:", req.body);
    res.sendStatus(200);
});

app.post("/api/staff-stats", (req, res) => {
    console.log("staff-stats:", req.body);
    res.sendStatus(200);
});

// ======================
// START SERVER
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

const API_URL = process.env.API_URL;
const API_SECRET = process.env.API_SECRET;

const { v4: uuidv4 } = require("uuid");

// ======================
// SEND COMMAND (WITH RESULT WAIT)
// ======================
async function sendCommand(type, data, interaction) {
    try {
        const commandId = uuidv4();

        const payload = {
            commandId,
            type,
            executor: interaction.user.username,
            executorId: interaction.user.id,
            data
        };

        await axios.post(`${API_URL}/commands`, payload, {
            headers: {
                "x-api-secret": API_SECRET
            }
        });

        let result = null;

        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1000));

            const res = await axios.get(`${API_URL}/command-result/${commandId}`);

            if (!res.data.pending) {
                result = res.data;
                break;
            }
        }

        if (!result) {
            await interaction.editReply("⚠️ Commande envoyée mais aucune réponse du serveur");
            return true;
        }

        await interaction.editReply(
            result.ok
                ? `✅ Succès: ${result.message}`
                : `❌ Erreur: ${result.message}`
        );

        return result.ok;

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
// COMMAND HANDLER
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
// LOGIN
// ======================
client.login(process.env.TOKEN);
