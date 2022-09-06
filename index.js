const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const { config } = require('./config');

const PREFIX = '!';
const REGEX_DICE = new RegExp(/(\d*)(D)(\d*)?/i);
const colors = {
  succes: 0x3DE232,
  failed: 0xE23236,
  default: 0x3281E2,
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('>>> Bot ready');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const msg = message.content.substring(1);

    message.member.displayName

    if (!REGEX_DICE.test(msg)) return;

    let results = [];

    console.log('>>> Roll dice')
    const cmd = msg.split(REGEX_DICE);

    const dice_number = cmd[1] || 1;
    const dice_limit = cmd[3] || 100;

    for (let i = 0; i < dice_number; i++) {
      results.push(randomize(dice_limit));
    }

    let color = colors.default;

    if (dice_number === 1 && dice_limit === 100) {
      if (results[0] <= 5) {
        color = colors.succes;
      }
      else if (results[0] >= 95) {
        color = colors.failed;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(`**${message.member.displayName}** a lancé ${dice_number} dé${dice_number > 1 ? 's' : ''} de ${dice_limit}`)
      .addFields(
        { name: 'Résultats ', value: `${results.map(result => { return `[${result}]` })}` },
      );

    if (message.author.username === 'PhoRésie') {
      embed.setFooter({ text: '(PS: Love you White !)' })
    }

    message.channel.send({ embeds: [embed] });
  }

});

client.login(process.env.DISCORD_TOKEN || config.token);

function randomize(limit) {
  min = Math.ceil(1);
  max = Math.floor(limit);
  return Math.floor(Math.random() * (max - min)) + min;
}