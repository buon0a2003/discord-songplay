import { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Hiển thị danh sách các lệnh và cách sử dụng")
  .addStringOption(option =>
    option.setName("command")
      .setDescription("Tên lệnh cụ thể để xem chi tiết")
      .setRequired(false)
  );

export async function execute(client: Client, interaction: CommandInteraction) {
  const commandName = (interaction as any).options?.getString("command");
  
  if (commandName) {
    // Show detailed help for a specific command
    const command = client.commands.get(commandName.toLowerCase());
    if (!command) {
      await interaction.reply({ 
        content: `❌ Không tìm thấy lệnh \`${commandName}\`!`, 
        ephemeral: true 
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`📖 Chi tiết lệnh: /${command.data.name}`)
      .setDescription(command.data.description || "Không có mô tả")
      .addFields(
        { name: "Cách sử dụng", value: `\`/${command.data.name}\``, inline: false }
      );

    // Add options if the command has any
    if (command.data.options && command.data.options.length > 0) {
      const optionsText = command.data.options.map((option: any) => {
        const required = option.required ? " (bắt buộc)" : " (tùy chọn)";
        return `• \`${option.name}\`${required}: ${option.description}`;
      }).join('\n');
      
      embed.addFields({ name: "Tham số", value: optionsText, inline: false });
    }

    await interaction.reply({ embeds: [embed] });
    return;
  }

  // Show all commands grouped by category
  const commandsByCategory = new Map<string, any[]>();
  
  client.commands.forEach((command, name) => {
    // Determine category based on file path (stored in the command loading process)
    // Since we can't access file path directly, we'll categorize by command patterns
    let category = "🛠️ Tiện ích";
    
    const musicCommands = ["play", "pause", "resume", "stop", "skip", "queue", "playlist"];
    if (musicCommands.includes(name)) {
      category = "🎵 Âm nhạc";
    }
    
    if (!commandsByCategory.has(category)) {
      commandsByCategory.set(category, []);
    }
    
    commandsByCategory.get(category)!.push({
      name: command.data.name,
      description: command.data.description || "Không có mô tả"
    });
  });

  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("📚 Danh sách lệnh")
    .setDescription("Sử dụng `/help <tên_lệnh>` để xem chi tiết một lệnh cụ thể")
    .setFooter({ text: "💡 Mẹo: Tất cả lệnh đều bắt đầu bằng dấu /" });

  commandsByCategory.forEach((commands, category) => {
    const commandList = commands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`)
      .join('\n');
    
    embed.addFields({ 
      name: category, 
      value: commandList || "Không có lệnh nào", 
      inline: false 
    });
  });

  await interaction.reply({ embeds: [embed] });
} 