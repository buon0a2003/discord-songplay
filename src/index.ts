import dotenv from 'dotenv';
import { Client, IntentsBitField, Partials } from 'discord.js';
import eventHandler from './handlers/eventHandler';
import { DisTube, DisTubeOptions } from "distube";
import { joinVoiceChannel } from "@discordjs/voice";
import { json } from 'stream/consumers';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { YouTubePlugin } from '@distube/youtube';
import ytdlPatch from './ytdl_patch';

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

// (async () => {
//   await ytdlPatch();
// })();

let youtubeCookies: any;

if (fs.existsSync("cookies.json")) {
  try {
    youtubeCookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
    console.log("✅ cookies loaded from cookies.json");
  } catch (error) {
    console.error("❌ Error loading cookies:", error);
    youtubeCookies = null;
  }
} else {
  console.log("⚠️  cookies.json not found - using default configuration");
}

client.distube = new DisTube(client, {
  ffmpeg: {
    path: ffmpegPath,
  },
  plugins: [new YouTubePlugin(
    {
      cookies: youtubeCookies,
      // ytdlOptions: {
      //   playerClients: ['ANDROID'],
      // }
    }
  )],

});

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
      stack: e.stack,
      code: e.code,
    });
    queue.textChannel?.send(`⛔ Lỗi phát nhạc! Chi tiết: ${e.message.substring(0, 100)}...`)
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

