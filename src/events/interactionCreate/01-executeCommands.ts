import { Client, Interaction, MessageFlags } from "discord.js";

// Execute slash commands
export default async function handleInteraction(
  client: Client,
  interaction: Interaction
) {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`No command matching "${interaction.commandName}"`);
    return;
  }

  try {
    console.log(`Executing ${interaction.commandName}`);
    await command.execute(client, interaction);
  } catch (err) {
    console.error(`[${interaction.commandName}] execution error:`, err);
    
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          content: "❌ There was an error running this command!",
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: "❌ There was an error running this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (responseError) {
      console.error(`Failed to send error response:`, responseError);
    }
  }
}
