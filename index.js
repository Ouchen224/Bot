
const express = require("express");
const app = express();


require('./deploy-commands');
// ✅ REQUIRED FOR FIVEM
app.get("/api/commands", (req, res) => {
    res.json({ commands: [] });
});

app.post("/api/notify", (req, res) => {
    console.log("notify:", req.body);
    res.sendStatus(200);
});

app.post("/api/players", (req, res) => {
    console.log("players:", req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("API started on port " + PORT);
});

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const API_URL = process.env.API_URL;
const API_SECRET = process.env.API_SECRET;

// 🔥 Fonction d'envoi vers ton serveur FiveM
async function sendCommand(type, data, interaction) {
    try {
        await axios.post(`${API_URL}/commands`, {
            type,
            executor: interaction.user.username,
            executorId: interaction.user.id,
            data
        }, {
            headers: {
                'x-api-secret': API_SECRET
            }
        });

        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
}

client.on('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    await interaction.deferReply({ ephemeral: true });

    let ok = false;

    // ======================
    // 📢 ANNOUNCE
    // ======================
    if (commandName === 'announce') {
        ok = await sendCommand('announce', {
            message: interaction.options.getString('message')
        }, interaction);
    }

    // ======================
    // 👢 KICK
    // ======================
    if (commandName === 'kick') {
        ok = await sendCommand('kick', {
            playerId: interaction.options.getInteger('playerid'),
            reason: interaction.options.getString('reason')
        }, interaction);
    }

    // ======================
    // ⛔ BAN
    // ======================
    if (commandName === 'ban') {
        ok = await sendCommand('ban', {
            playerId: interaction.options.getInteger('playerid'),
            reason: interaction.options.getString('reason'),
            durationDays: interaction.options.getInteger('days')
        }, interaction);
    }

    // ======================
    // 🎁 GIVE ITEM
    // ======================
    if (commandName === 'giveitem') {
        ok = await sendCommand('give_item', {
            playerId: interaction.options.getInteger('playerid'),
            item: interaction.options.getString('item'),
            quantity: interaction.options.getInteger('quantity')
        }, interaction);
    }

    // ======================
    // 🚗 GIVE VEHICLE
    // ======================
    if (commandName === 'givevehicle') {
        ok = await sendCommand('give_vehicle', {
            playerId: interaction.options.getInteger('playerid'),
            model: interaction.options.getString('model')
        }, interaction);
    }

    // ======================
    // 📍 TELEPORT
    // ======================
    if (commandName === 'teleport') {
        ok = await sendCommand('teleport', {
            playerId: interaction.options.getInteger('playerid'),
            coords: {
                x: interaction.options.getNumber('x'),
                y: interaction.options.getNumber('y'),
                z: interaction.options.getNumber('z')
            }
        }, interaction);
    }

    // ======================
    // 🌤 WEATHER
    // ======================
    if (commandName === 'weather') {
        ok = await sendCommand('weather', {
            weather: interaction.options.getString('type')
        }, interaction);
    }

    // ======================
    // 🕒 TIME
    // ======================
    if (commandName === 'time') {
        ok = await sendCommand('time', {
            hour: interaction.options.getInteger('hour'),
            minute: interaction.options.getInteger('minute')
        }, interaction);
    }

    // ======================
    // 🔄 RESTART RESOURCE
    // ======================
    if (commandName === 'restart') {
        ok = await sendCommand('restart', {
            resource: interaction.options.getString('resource')
        }, interaction);
    }

    // ======================
    // ⚕️ REVIVE
    // ======================
    if (commandName === 'revive') {
        ok = await sendCommand('revive', {
            playerId: interaction.options.getInteger('playerid')
        }, interaction);
    }

    // ======================
    // 🔒 JAIL
    // ======================
    if (commandName === 'jail') {
        ok = await sendCommand('jail', {
            playerId: interaction.options.getInteger('playerid'),
            minutes: interaction.options.getInteger('minutes'),
            reason: interaction.options.getString('reason')
        }, interaction);
    }

    if (commandName === 'unjail') {
        ok = await sendCommand('unjail', {
            playerId: interaction.options.getInteger('playerid')
        }, interaction);
    }

    // ======================
    // ⚠️ WARN
    // ======================
    if (commandName === 'warn') {
        ok = await sendCommand('warn', {
            playerId: interaction.options.getInteger('playerid'),
            reason: interaction.options.getString('reason')
        }, interaction);
    }

    // ======================
    // 🧹 WIPE
    // ======================
    if (commandName === 'wipe') {
        ok = await sendCommand('wipe', {
            playerId: interaction.options.getInteger('playerid')
        }, interaction);
    }

    await interaction.editReply(ok ? "✅ Commande envoyée au serveur FiveM" : "❌ Erreur envoi commande");
});

client.login(process.env.TOKEN);
