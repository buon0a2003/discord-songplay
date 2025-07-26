import { SlashCommandBuilder, Client, CommandInteraction, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("Tiếp tục phát bài hát hiện tại");

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
    await client.distube.resume(voiceChannel);
    await interaction.reply({ content: "▶️ Đã tiếp tục phát nhạc!" });
  } catch (err) {
    await interaction.reply({ content: `❌ Không thể tiếp tục phát: ${err}` });
  }
} 