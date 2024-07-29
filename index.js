const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const { sentences } = require('./sentences.js');

dotenv.config();

const DEBUG = process.env.DEBUG;

const PREFIX = '!';
const REGEX_DICE = /^(\d*)[dD](\d*)$/;
const COLORS = {
  success: 0x3de232,
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

    if (!REGEX_DICE.test(msg)) return;

    const [, diceNumberStr, diceLimitStr] = msg.match(REGEX_DICE);
    const diceNumber = diceNumberStr ? parseInt(diceNumberStr, 10) : 1;
    const diceLimit = diceLimitStr ? parseInt(diceLimitStr, 10) : 100;

    if (isNaN(diceNumber) || isNaN(diceLimit)) return;

    let results = [];

    for (let i = 0; i < diceNumber; i++) {
      results.push(randomize(diceLimit));
    }

    consoleLog('>>> Roll dice', results);

    let color = COLORS.default;

    if (diceNumber === 1 && diceLimit === 100) {
      if (results[0] <= 5) {
        color = COLORS.success;
      } else if (results[0] >= 95) {
        color = COLORS.failed;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(
        `**${message.member.displayName}** a lancé ${diceNumber} dé${
          diceNumber > 1 ? 's' : ''
        } de ${diceLimit}`
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
  const min = Math.ceil(1);
  const max = Math.floor(limit);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
