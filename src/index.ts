import dotenv from 'dotenv';
import { Client, IntentsBitField, Partials } from 'discord.js';
import eventHandler from './handlers/eventHandler';
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { joinVoiceChannel } from "@discordjs/voice";

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

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [
    new YouTubePlugin(),
  ],
});

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

