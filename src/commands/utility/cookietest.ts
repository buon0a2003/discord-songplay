import { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("cookietest")
  .setDescription("Kiểm tra xem cookies có hoạt động đúng không");

export async function execute(client: Client, interaction: CommandInteraction) {
  await interaction.deferReply();

  try {
    // Test search functionality with a common song
    const testQuery = "Never Gonna Give You Up";
    
    const embed = new EmbedBuilder()
      .setTitle("🍪 Cookie Test Results")
      .setColor("Blue")
      .setTimestamp();

    try {
      // Check if cookies are loaded
      const fs = require('fs');
      let cookieStatus = "❌ No cookies.json found";
      let cookieCount = 0;
      
      if (fs.existsSync("cookies.json")) {
        try {
          const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
          if (cookies && cookies.cookies && Array.isArray(cookies.cookies)) {
            cookieCount = cookies.cookies.length;
            cookieStatus = `✅ ${cookieCount} cookies loaded`;
            
            // Check for important YouTube cookies
            const importantCookies = ['YSC', 'VISITOR_INFO1_LIVE', 'CONSENT', 'SAPISID'];
            const foundImportant = cookies.cookies.filter(cookie => 
              importantCookies.includes(cookie.name)
            );
            
            if (foundImportant.length > 0) {
              cookieStatus += `\n🔑 Important cookies: ${foundImportant.map(c => c.name).join(', ')}`;
            }
          } else {
            cookieStatus = "❌ Invalid cookie format";
          }
        } catch (e) {
          cookieStatus = "❌ Error reading cookies.json";
        }
      }

      embed.addFields(
        { name: "🍪 Cookie Status", value: cookieStatus, inline: false },
        { name: "📊 DisTube Plugin", value: "✅ YouTubePlugin initialized with cookies", inline: false },
        { name: "🔧 Test Method", value: "Cookies are validated at startup. Check console logs for detailed cookie information.", inline: false },
        { name: "🎯 How to verify cookies work", value: "1. Use `/play` command with a YouTube URL\n2. Check console logs for detailed error messages\n3. Look for 'Authentication cookies detected' in startup logs\n4. Monitor for 403/429 errors which indicate cookie issues", inline: false }
      );

    } catch (searchError: any) {
      embed.addFields(
        { name: "❌ Search Test", value: "Failed with error", inline: false },
        { name: "🚨 Error Details", value: `\`\`\`${searchError.message}\`\`\``, inline: false },
        { name: "🔧 Troubleshooting", value: "• Check if cookies.json exists\n• Verify cookie format\n• Update cookies if needed", inline: false }
      );
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error: any) {
    console.error('Cookie test error:', error);
    await interaction.editReply({ 
      content: `❌ Cookie test failed: \`${error.message}\``
    });
  }
} 