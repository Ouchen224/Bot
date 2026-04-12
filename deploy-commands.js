const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [

    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID du joueur")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Raison")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban un joueur")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID").setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("days").setDescription("Durée en jours").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason").setDescription("Raison").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Annonce serveur")
        .addStringOption(o =>
            o.setName("message").setDescription("Message").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("giveitem")
        .setDescription("Donner un item")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("item").setDescription("Item").setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("quantity").setDescription("Quantité").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("givevehicle")
        .setDescription("Donner un véhicule")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("model").setDescription("Modèle").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("teleport")
        .setDescription("Téléporter un joueur")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("x").setDescription("X").setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("y").setDescription("Y").setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("z").setDescription("Z").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("weather")
        .setDescription("Changer météo")
        .addStringOption(o =>
            o.setName("type").setDescription("Type météo").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("time")
        .setDescription("Changer l'heure")
        .addIntegerOption(o =>
            o.setName("hour").setDescription("Heure").setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minute").setDescription("Minutes").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("revive")
        .setDescription("Revive un joueur")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Mettre en prison")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minutes").setDescription("Minutes").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason").setDescription("Raison").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("unjail")
        .setDescription("Sortir de prison")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn un joueur")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason").setDescription("Raison").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("wipe")
        .setDescription("Wipe un joueur")
        .addIntegerOption(o =>
            o.setName("playerid").setDescription("ID joueur").setRequired(true)
        )

].map(cmd => cmd.toJSON());

// ======================
// DISCORD REST
// ======================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🚀 Déploiement des commandes...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ Commandes enregistrées avec succès !");
    } catch (err) {
        console.error("❌ Erreur deploy commands :", err);
    }
})();
