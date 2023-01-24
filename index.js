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

const history = {};

client.on('ready', () => {
  consoleLog('>>> Bot ready');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  console.log('>>> message', message);

  if (message.content.startsWith(PREFIX)) {
    const msg = message.content.substring(1);

    message.member.displayName;

    if (!REGEX_DICE.test(msg)) return;

    let results = [];

    const cmd = msg.split(REGEX_DICE);

    console.log('>>> cmd', cmd);

    const dice_number = cmd[1] || 1;
    const dice_limit = cmd[3] || 100;
    const special_cmd = cmd[4] || null;

    if (special_cmd) {
      const channelId = message.channelId;

      switch (special_cmd) {
        case '-start':
          startHistory(channelId);
          message.channel.send('Start saving history...');
          break;
        case '-reset':
          clearHistory(channelId);
          message.channel.send('History cleared !');
          break;
        case 'stop':
          message.channel.send('Stop saving results !');
          break;
        case '-show':
          displayHistory(channelId);
          break;
        default:
          break;
      }
      return;
    }

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

    results.map((result) => {
      addToHistory(message.channelId, message.author.username, result);
    });

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

// History methods
function startHistory(channelId) {
  return (history[channelId] = []);
}

function addToHistory(channelId, username, result) {
  if (!history[channelId]) {
    return;
  }

  if (!history[channelId][username]) {
    history[channelId][username] = [];
  }

  return history[channelId][username].push(result);
}

function displayHistory(channelId) {
  console.log('>>> history', history[channelId]);
}

function clearHistory(channelId) {
  return (history[channelId] = {});
}
