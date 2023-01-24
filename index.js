const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const { sentences } = require('./sentences.js');

dotenv.config();

const DEBUG = process.env.DEBUG;

const PREFIX = '!';
const REGEX_DICE = new RegExp(/(\d*)(D)(\d*)?/i);
const COLORS = {
  succes: 0x3de232,
  failed: 0xe23236,
  default: 0x3281e2,
};

const USERNAMES = process.env.SPECIALS_USERNAMES.split(',');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  consoleLog('>>> Bot ready');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const msg = message.content.substring(1);

    message.member.displayName;

    if (!REGEX_DICE.test(msg)) return;

    let results = [];

    const cmd = msg.split(REGEX_DICE);

    const dice_number = cmd[1] || 1;
    const dice_limit = cmd[3] || 100;

    for (let i = 0; i < dice_number; i++) {
      results.push(randomize(dice_limit));
    }

    consoleLog('>>> Roll dice', results);

    let color = COLORS.default;

    if (dice_number === 1 && dice_limit === 100) {
      if (results[0] <= 5) {
        color = COLORS.succes;
      } else if (results[0] >= 95) {
        color = COLORS.failed;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(
        `**${message.member.displayName}** a lancé ${dice_number} dé${
          dice_number > 1 ? 's' : ''
        } de ${dice_limit}`
      )
      .addFields({
        name: 'Résultats ',
        value: `${results.map((result) => {
          return `[${result}]`;
        })}`,
      });

    getSentence(embed, message.author.username);

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);

function randomize(limit) {
  min = Math.ceil(1);
  max = Math.floor(limit);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getSentence(embed, username) {
  const index = USERNAMES.indexOf(username);
  const sentencesArray = sentences[index];

  if (sentencesArray) {
    const sentence =
      sentencesArray[Math.floor(Math.random() * sentencesArray.length)];
    embed.setFooter({ text: sentence });
  }

  return embed;
}

function consoleLog(message, variables) {
  if (!DEBUG) {
    return;
  }

  console.log(message, variables);
}
