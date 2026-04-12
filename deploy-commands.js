const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick un joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addStringOption(o => o.setName('reason').setRequired(true)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban un joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addIntegerOption(o => o.setName('days').setRequired(true))
        .addStringOption(o => o.setName('reason').setRequired(true)),

    new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Annonce serveur')
        .addStringOption(o => o.setName('message').setRequired(true)),

    new SlashCommandBuilder()
        .setName('giveitem')
        .setDescription('Donner un item')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addStringOption(o => o.setName('item').setRequired(true))
        .addIntegerOption(o => o.setName('quantity').setRequired(true)),

    new SlashCommandBuilder()
        .setName('givevehicle')
        .setDescription('Donner véhicule')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addStringOption(o => o.setName('model').setRequired(true)),

    new SlashCommandBuilder()
        .setName('teleport')
        .setDescription('Téléporter joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addNumberOption(o => o.setName('x').setRequired(true))
        .addNumberOption(o => o.setName('y').setRequired(true))
        .addNumberOption(o => o.setName('z').setRequired(true)),

    new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Changer météo')
        .addStringOption(o => o.setName('type').setRequired(true)),

    new SlashCommandBuilder()
        .setName('time')
        .setDescription('Changer heure')
        .addIntegerOption(o => o.setName('hour').setRequired(true))
        .addIntegerOption(o => o.setName('minute').setRequired(true)),

    new SlashCommandBuilder()
        .setName('revive')
        .setDescription('Revive joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true)),

    new SlashCommandBuilder()
        .setName('jail')
        .setDescription('Jail joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setRequired(true))
        .addStringOption(o => o.setName('reason').setRequired(true)),

    new SlashCommandBuilder()
        .setName('unjail')
        .setDescription('Unjail joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))
        .addStringOption(o => o.setName('reason').setRequired(true)),

    new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('Wipe joueur')
        .addIntegerOption(o => o.setName('playerid').setRequired(true))

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );
    console.log("✅ Commandes enregistrées !");
})();
