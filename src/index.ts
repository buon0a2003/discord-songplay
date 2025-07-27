import dotenv from 'dotenv';
import { Client, IntentsBitField, Partials } from 'discord.js';
import eventHandler from './handlers/eventHandler';
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { joinVoiceChannel } from "@discordjs/voice";
import { json } from 'stream/consumers';
import fs from 'fs';

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

// Handle cookies for cloud deployment
let cookiesArray: any[] = [];

try {
  // Try to get cookies from environment variable first (for cloud deployment)
  if (process.env.YOUTUBE_COOKIES) {
    console.log('🍪 Loading cookies from environment variable...');
    const cookiesData = JSON.parse(process.env.YOUTUBE_COOKIES);
    cookiesArray = cookiesData.cookies.map((cookie: any) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      session: cookie.session,
    }));
  } 
  // Fallback to local cookies.json file (for development)
  else if (fs.existsSync("cookies.json")) {
    console.log('🍪 Loading cookies from cookies.json file...');
    const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
    cookiesArray = cookies.cookies.map((cookie: any) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      session: cookie.session,
    }));
  } else {
    console.warn('⚠️  No cookies found. Bot will work with limited YouTube functionality.');
  }
} catch (error) {
  console.error('❌ Error loading cookies:', error);
  console.warn('⚠️  Continuing without cookies. Some YouTube features may be limited.');
}

// Initialize DisTube with or without cookies
const distubeOptions: any = {
  emitNewSongOnly: true,
  plugins: [],
};

// Only add YouTube plugin with cookies if cookies are available
if (cookiesArray.length > 0) {
  distubeOptions.plugins.push(new YouTubePlugin({ cookies: cookiesArray }));
  console.log('✅ DisTube initialized with YouTube cookies');
} else {
  distubeOptions.plugins.push(new YouTubePlugin());
  console.log('✅ DisTube initialized without cookies (limited functionality)');
}

client.distube = new DisTube(client, distubeOptions);

// DisTube event listeners with Vietnamese responses  
client.distube
  .on('playSong' as any, (queue, song) => {
    queue.textChannel?.send(`▶️ Đang phát: **${song.name}** (${song.formattedDuration})\nYêu cầu bởi: ${song.user}`);
  })
  .on('addSong' as any, (queue, song) => {
    queue.textChannel?.send(`✅ Đã thêm bài hát **${song.name}** vào hàng chờ!`);
  })
  .on('addList' as any, (queue, playlist) => {
    queue.textChannel?.send(`📃 Đã thêm playlist **${playlist.name}** (${playlist.songs.length} bài) vào hàng chờ!`);
  })
  .on('error' as any, (e, queue, song)  => {
    queue.textChannel?.send(`⛔ Lỗi rồi người ơi!`)
    console.error('DisTube error:', e);
  })
  .on('empty' as any, queue => {
    queue.textChannel?.send('Kênh thoại trống, bot sẽ rời đi!');
  })
  .on('finish' as any, queue => {
    queue.textChannel?.send('✅ Đã phát xong tất cả bài hát trong hàng chờ!');
  });

(async () => {
  try {
    eventHandler(client);
    await client.login(process.env.TOKEN!);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
})();

