import dotenv from 'dotenv';
import { Client, IntentsBitField, Partials } from 'discord.js';
import eventHandler from './handlers/eventHandler';
import { DisTube, DisTubeOptions } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { joinVoiceChannel } from "@discordjs/voice";
import { json } from 'stream/consumers';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';

dotenv.config();

const client: Client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,  
    Partials.User
  ],
});

let cookies: any;

if (fs.existsSync("cookies.json")) {
  try {
    cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
    console.log("✅ cookies loaded from cookies.json");
    
    // Validate cookie structure
    if (cookies && cookies.cookies && Array.isArray(cookies.cookies)) {
      console.log(`📊 Cookie validation: Found ${cookies.cookies.length} cookies`);
      
      // Check for essential YouTube cookies
      const essentialCookies = ['YSC', 'VISITOR_INFO1_LIVE', 'CONSENT'];
      const foundEssential = cookies.cookies.filter(cookie => 
        essentialCookies.includes(cookie.name)
      );
      
      console.log(`🔑 Essential cookies found: ${foundEssential.map(c => c.name).join(', ')}`);
      
      // Check for authentication-related cookies
      const authCookies = cookies.cookies.filter(cookie => 
        cookie.name.includes('LOGIN') || 
        cookie.name.includes('SAPISID') || 
        cookie.name.includes('SSID')
      );
      
      if (authCookies.length > 0) {
        console.log(`🔐 Authentication cookies detected: ${authCookies.length} found`);
      } else {
        console.log("⚠️  No authentication cookies found - bot may have limited access");
      }
      
    } else {
      console.error("❌ Invalid cookie structure in cookies.json");
      cookies = null;
    }
  } catch (error) {
    console.error("❌ Error loading cookies:", error);
    cookies = null;
  }
} else {
  console.log("⚠️  cookies.json not found - using default configuration");
}

// console.log(cookies.cookies);

client.distube = new DisTube(client, {
  ffmpeg: {
    path: ffmpegPath,
  },
  plugins: [new YouTubePlugin({ 
    cookies: cookies?.cookies || undefined
  })]
});

// DisTube event listeners with Vietnamese responses  
client.distube
  .on('playSong' as any, (queue, song) => {
    console.log(`🎵 Playing: ${song.name} | Duration: ${song.formattedDuration} | Source: ${song.source}`);
    queue.textChannel?.send(`▶️ Đang phát: **${song.name}** (${song.formattedDuration})\nYêu cầu bởi: ${song.user}`);
  })
  .on('addSong' as any, (queue, song) => {
    console.log(`➕ Added to queue: ${song.name} | Source: ${song.source}`);
    queue.textChannel?.send(`✅ Đã thêm bài hát **${song.name}** vào hàng chờ!`);
  })
  .on('addList' as any, (queue, playlist) => {
    console.log(`📃 Added playlist: ${playlist.name} | Songs: ${playlist.songs.length}`);
    queue.textChannel?.send(`📃 Đã thêm playlist **${playlist.name}** (${playlist.songs.length} bài) vào hàng chờ!`);
  })
  .on('error' as any, (e, queue, song)  => {
    console.error('🚨 DisTube error details:', {
      error: e.message,
      song: song?.name || 'Unknown',
      source: song?.source || 'Unknown',
      stack: e.stack
    });
    queue.textChannel?.send(`⛔ Lỗi rồi người ơi!`)
  })
  .on('empty' as any, queue => {
    console.log('📭 Voice channel empty, leaving...');
    queue.textChannel?.send('Kênh thoại trống, bot sẽ rời đi!');
  })
  .on('finish' as any, queue => {
    console.log('✅ Queue finished playing all songs');
    queue.textChannel?.send('✅ Đã phát xong tất cả bài hát trong hàng chờ!');
  })
  .on('initQueue' as any, queue => {
    console.log(`🎯 Queue initialized for guild: ${queue.id}`);
  })
  .on('noRelated' as any, queue => {
    console.log('🔍 No related songs found - this might indicate cookie/access issues');
    queue.textChannel?.send('❌ Không tìm thấy bài hát liên quan!');
  });

(async () => {
  try {
    eventHandler(client);
    await client.login(process.env.TOKEN!);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
})();

