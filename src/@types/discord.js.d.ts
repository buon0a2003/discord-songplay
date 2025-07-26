import { Collection, Client as BaseClient, SlashCommandBuilder, CommandInteraction } from "discord.js";
import { DisTube } from "distube";

export interface CommandModule {
  data: SlashCommandBuilder;
  execute: (client: BaseClient, interaction: CommandInteraction) => Promise<void>;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, CommandModule>;
    distube: DisTube;
  }
}
