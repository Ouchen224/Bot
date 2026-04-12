const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

// ======================
// COMMANDS LIST
// ======================
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
                .setDescription("Raison du kick")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID du joueur")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("days")
                .setDescription("Durée du ban (jours)")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Raison du ban")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Annonce serveur")
        .addStringOption(o =>
            o.setName("message")
                .setDescription("Message de l'annonce")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("giveitem")
        .setDescription("Donner un item")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("item")
                .setDescription("Nom de l'item")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("quantity")
                .setDescription("Quantité")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("givevehicle")
        .setDescription("Donner un véhicule")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("model")
                .setDescription("Modèle véhicule")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("teleport")
        .setDescription("Téléporter un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("x")
                .setDescription("Coordonnée X")
                .setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("y")
                .setDescription("Coordonnée Y")
                .setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("z")
                .setDescription("Coordonnée Z")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("weather")
        .setDescription("Changer la météo")
        .addStringOption(o =>
            o.setName("type")
                .setDescription("Type météo")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("time")
        .setDescription("Changer l'heure")
        .addIntegerOption(o =>
            o.setName("hour")
                .setDescription("Heure")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minute")
                .setDescription("Minute")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("revive")
        .setDescription("Revive un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Mettre en prison un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minutes")
                .setDescription("Durée en minutes")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Raison")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("unjail")
        .setDescription("Sortir un joueur de prison")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Raison")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("wipe")
        .setDescription("Wipe un joueur")
        .addIntegerOption(o =>
            o.setName("playerid")
                .setDescription("ID joueur")
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// ======================
// REST CLIENT
// ======================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// ======================
// DEPLOY
// ======================
(async () => {
    try {
        console.log("🚀 Déploiement des commandes...");

        if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
            throw new Error("❌ Variables d'environnement manquantes");
        }

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ Commandes enregistrées avec succès !");
    } catch (err) {
        console.error("❌ Erreur déploiement :", err);
    }
})();
