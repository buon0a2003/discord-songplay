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
    await interaction.reply({ content: "❌ Cần nhập link hoặc tên bài hát!" });
    return;
  }
  
  const voiceChannel = (interaction.member as GuildMember)?.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: "❌ Vào voice channel trước đi!" });
    return;
  }

  const member = interaction.member;
  if (!member || !(member instanceof GuildMember)) {
    await interaction.reply({ content: "❌ Không thể xác định thành viên!" });
    return;
  }

  // Defer the reply to give us more time
  await interaction.deferReply();

  try {
    await client.distube.play(voiceChannel, query, {
      textChannel: interaction.channel,
      member: member,
    });
    
    // Edit the deferred reply with success message
    await interaction.editReply({ content: `🔎 Đang tìm kiếm: **${query}**...` });
  } catch (error) {
    console.error('DisTube play error:', error);
    await interaction.editReply({ content: "❌ Có lỗi xảy ra khi phát nhạc!" });
  }
} 