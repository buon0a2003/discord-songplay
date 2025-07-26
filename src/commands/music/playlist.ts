import { SlashCommandBuilder, Client, CommandInteraction, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("playlist")
  .setDescription("Xem playlist hiện tại (giống hàng chờ)");

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
    if (!queue || !queue.songs.length) {
      await interaction.reply({ content: "❌ Playlist đang trống!" });
      return;
    }
    const list = queue.songs.map((song, i) => `${i === 0 ? '▶️' : `${i}.`} **${song.name}** (${song.formattedDuration}) - <@${song.user?.id || song.user}>`).join('\n');
    await interaction.reply({ content: `📃 **Playlist hiện tại:**\n${list}` });
  } catch (err) {
    await interaction.reply({ content: `❌ Không thể lấy playlist: ${err}` });
  }
} 