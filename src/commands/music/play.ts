import { SlashCommandBuilder, Client, CommandInteraction, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Phát nhạc từ YouTube hoặc tìm kiếm bài hát")
  .addStringOption(option =>
    option.setName("songurl")
      .setDescription("Link YouTube hoặc tên bài hát")
      .setRequired(true)
  );

export async function execute(client: Client, interaction: CommandInteraction) {
  const query = (interaction as any).options?.getString("songurl");
  if (!query) {
    await interaction.reply({ content: "❌ Bạn cần nhập link hoặc tên bài hát!" });
    return;
  }
  const voiceChannel = (interaction.member as GuildMember)?.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: "❌ Bạn cần tham gia kênh thoại trước!" });
    return;
  }
  await interaction.reply({ content: `🔎 Đang tìm kiếm: **${query}**...` });

  const member = interaction.member;
  if (!member || !(member instanceof GuildMember)) {
    await interaction.followUp({ content: "❌ Không thể xác định thành viên!" });
    return;
  }
  await client.distube.play(voiceChannel, query, {
    textChannel: interaction.channel,
    member: member,
  });
} 