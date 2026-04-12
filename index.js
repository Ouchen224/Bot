require("./deploy-commands");

const express = require("express");
const axios = require("axios");
require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ======================
// STORAGE
// ======================
let commandsQueue = [];
let resultsMap = {};

// ======================
// DEBUG LOGS
// ======================
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.url}`);
    next();
});

// ======================
// RECEIVE COMMAND FROM DISCORD
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
// FIVEM POLL COMMANDS
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
// RECEIVE RESULT FROM FIVEM
// ======================
app.post("/api/command-result", (req, res) => {
    const { commandId, ok, message } = req.body;

    if (!commandId) {
        return res.status(400).json({ error: "Missing commandId" });
    }

    resultsMap[commandId] = {
        ok: !!ok,
        message: message || "No message",
        time: Date.now()
    };

    console.log("✅ Résultat reçu:", req.body);

    res.json({ success: true });
});

// ======================
// DISCORD GET RESULT
// ======================
app.get("/api/command-result/:id", (req, res) => {
    const result = resultsMap[req.params.id];

    if (!result) {
        return res.json({ pending: true });
    }

    delete resultsMap[req.params.id];

    res.json(result);
});

// ======================
// ALL FIVEM LOG ROUTES
// ======================
app.post("/api/notify", (req, res) => {
    console.log("📢 notify:", JSON.stringify(req.body));
    res.sendStatus(200);
});

app.post("/api/players", (req, res) => {
    console.log("👥 players:", JSON.stringify(req.body));
    res.sendStatus(200);
});

app.post("/api/staff-stats", (req, res) => {
    console.log("📊 staff-stats:", JSON.stringify(req.body));
    res.sendStatus(200);
});

app.post("/api/ranks", (req, res) => {
    console.log("🏷️ ranks:", JSON.stringify(req.body));
    res.sendStatus(200);
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("✅ API started on port " + PORT);
});

// ======================
// DISCORD BOT
// ======================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const API_URL = process.env.API_URL;
const API_SECRET = process.env.API_SECRET;

// ======================
// SEND COMMAND
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

        console.log("➡️ SEND COMMAND:", payload);

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
            await interaction.editReply("⚠️ Commande envoyée, pas de réponse FiveM");
            return true;
        }

        await interaction.editReply(
            result.ok
                ? `✅ ${result.message}`
                : `❌ ${result.message}`
        );

        return result.ok;

    } catch (err) {
        console.error("❌ SEND ERROR:", err.response?.data || err.message);
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

    try {
        await interaction.deferReply({ flags: 64 });
    } catch (e) {
        console.log("Interaction expirée:", e.message);
        return;
    }

    let ok = false;
    const cmd = interaction.commandName;
    const opt = interaction.options;

    const commandMap = {
        kick: ["kick", {
            playerId: opt.getInteger("playerid"),
            reason: opt.getString("reason")
        }],
        ban: ["ban", {
            playerId: opt.getInteger("playerid"),
            durationDays: opt.getInteger("days"),
            reason: opt.getString("reason")
        }],
        announce: ["announce", {
            message: opt.getString("message")
        }],
        giveitem: ["give_item", {
            playerId: opt.getInteger("playerid"),
            item: opt.getString("item"),
            quantity: opt.getInteger("quantity")
        }],
        givevehicle: ["give_vehicle", {
            playerId: opt.getInteger("playerid"),
            model: opt.getString("model")
        }],
        teleport: ["teleport", {
            playerId: opt.getInteger("playerid"),
            coords: {
                x: opt.getNumber("x"),
                y: opt.getNumber("y"),
                z: opt.getNumber("z")
            }
        }],
        weather: ["weather", {
            weather: opt.getString("type")
        }],
        time: ["time", {
            hour: opt.getInteger("hour"),
            minute: opt.getInteger("minute")
        }],
        revive: ["revive", {
            playerId: opt.getInteger("playerid")
        }],
        jail: ["jail", {
            playerId: opt.getInteger("playerid"),
            minutes: opt.getInteger("minutes"),
            reason: opt.getString("reason")
        }],
        unjail: ["unjail", {
            playerId: opt.getInteger("playerid")
        }],
        warn: ["warn", {
            playerId: opt.getInteger("playerid"),
            reason: opt.getString("reason")
        }],
        wipe: ["wipe", {
            playerId: opt.getInteger("playerid")
        }]
    };

    if (commandMap[cmd]) {
        const [type, data] = commandMap[cmd];
        ok = await sendCommand(type, data, interaction);
    }

    if (!ok) {
        await interaction.editReply("❌ Erreur envoi commande");
    }
});

// ======================
// LOGIN
// ======================
client.login(process.env.TOKEN);
