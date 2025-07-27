import { SlashCommandBuilder, Client, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Phát nhạc từ YouTube hoặc tìm kiếm bài hát")
  .addStringOption(option =>
    option.setName("songurl")
      .setDescription("Link YouTube hoặc tên bài hát")
      .setRequired(true)
  ).addBooleanOption(option =>
    option.setName("skip")
      .setDescription("Bỏ qua bài hát hiện tại")
      .setRequired(false)
  ).addIntegerOption(option =>
    option.setName("position")
      .setDescription("Vị trí bài hát trong Queue")
      .setRequired(false)
  );

export async function execute(client: Client, interaction: CommandInteraction) {
  const query = (interaction as any).options?.getString("songurl");
  const skip = (interaction as any).options?.getBoolean("skip", false) ?? false;
  const position = (interaction as any).options?.getInteger("position", false) ?? undefined;
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

  await interaction.deferReply();

  try {
    await client.distube.play(voiceChannel, query, {
      textChannel: interaction.channel,
      member: member,
      skip: skip,
      position: position,
      metadata: {
        interaction: interaction,
      },
    });
    await interaction.editReply({ 
      content: "✅ Đã xử lý xong!"
    });
  } catch (error) {
    console.error('DisTube play error:', error);
    await interaction.editReply({ 
      embeds: [
        new EmbedBuilder().setColor("Blurple").setTitle("Lỗi rồi e ơi!").setDescription(`Error: \`${error.message}\``),
      ],
    });
  }
} 