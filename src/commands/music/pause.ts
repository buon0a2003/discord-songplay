import { SlashCommandBuilder, Client, CommandInteraction, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Tạm dừng bài hát hiện tại");

export async function execute(client: Client, interaction: CommandInteraction) {
  const member = interaction.member;
  if (!member || !(member instanceof GuildMember)) {
    await interaction.reply({ content: "❌ Không thể xác định thành viên!" });
    return;
  }
  const voiceChannel = member.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: "❌ Vào voice channel trước đi!" });
    return;
  }
  try {
    const queue = client.distube.getQueue(voiceChannel);
    if (!queue) {
      await interaction.reply({ content: "❌ Không có bài hát nào đang phát!" });
      return;
    }
    await client.distube.pause(voiceChannel);
    await interaction.reply({ content: "⏸️ Đã tạm dừng bài hát!" });
  } catch (err) {
    await interaction.reply({ content: `❌ Không thể tạm dừng: ${err}` });
  }
} 