import { SlashCommandBuilder, Client, CommandInteraction, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Dừng phát nhạc và xóa hàng chờ");

export async function execute(client: Client, interaction: CommandInteraction) {
  const member = interaction.member;
  if (!member || !(member instanceof GuildMember)) {
    await interaction.reply({ content: "❌ Không thể xác định thành viên!" });
    return;
  }
  const voiceChannel = member.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: "❌ Bạn cần tham gia kênh thoại trước!" });
    return;
  }
  try {
    const queue = client.distube.getQueue(voiceChannel);
    if (!queue) {
      await interaction.reply({ content: "❌ Không có bài hát nào đang phát!" });
      return;
    }
    await client.distube.stop(voiceChannel);
    await interaction.reply({ content: "⏹️ Đã dừng phát nhạc và xóa hàng chờ!" });
  } catch (err) {
    await interaction.reply({ content: `❌ Không thể dừng nhạc: ${err}` });
  }
} 