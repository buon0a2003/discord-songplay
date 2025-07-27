import { SlashCommandBuilder, Client, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("skipto")
  .setDescription("Chuyển đến vị trí cụ thể trong hàng chờ")
  .addIntegerOption(option => 
    option.setName("position")
      .setDescription("Vị trí bài hát cần chuyển đến (bắt đầu từ 1)")
      .setRequired(true)
  );

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

  const position = (interaction as any).options?.getInteger("position");
  if (!position || position < 1) {
    await interaction.reply({ content: "❌ Vị trí phải là số nguyên dương!" });
    return;
  }

  try {
    const queue = client.distube.getQueue(voiceChannel);
    if (!queue) {
      await interaction.reply({ content: "❌ Không có bài hát nào đang phát!" });
      return;
    }

    if (position > queue.songs.length) {
      await interaction.reply({ content: `❌ Vị trí ${position} vượt quá số bài hát trong hàng chờ (${queue.songs.length})!` });
      return;
    }

    await interaction.deferReply();

    const song = await client.distube.jump(voiceChannel, position);
    
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("⏭️ Đã chuyển đến bài hát")
          .setDescription(`Đang phát: **${song.name || song.url}**\nVị trí: ${position}`)
          .setFooter({ text: `Yêu cầu bởi: ${interaction.user.tag}` })
      ],
    });
  } catch (error) {
    console.error('Skipto error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (interaction.deferred) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Lỗi rồi e ơi!")
            .setDescription(`Error: \`${errorMessage}\``)
        ],
      });
    } else {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Lỗi rồi e ơi!")
            .setDescription(`Error: \`${errorMessage}\``)
        ],
      });
    }
  }
}