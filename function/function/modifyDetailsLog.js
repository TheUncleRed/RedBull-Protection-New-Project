const { WebhookClient, MessageEmbed } = require('discord.js');

const webhook = new WebhookClient({
    url: 'https://discord.com/api/webhooks/1362791808819659024/HMoGYwm9NZYygD8yCbXust3d_5ZV8w-I6l0wRK_BLgbckOWtsHb3B8mHRfmwt_jCSp_d'
});

async function sendLogToWebhook({ title, caseID, fieldName, oldValue, newValue, editor }) {
  const embed = new MessageEmbed()
    .setTitle(`**Case Modifyed**`)
    .setColor('#00AE86')
    .addFields(
      { name: 'Case ID :', value: caseID, inline: false },
      { name: 'Field :', value: fieldName, inline: false },
      { name: 'Old Value', value: oldValue || '/`/`/`N/A/`/`/`', inline: false },
      { name: 'New Value', value: newValue || '/`/`/`N/A/`/`/`', inline: false },
      { name: 'Modifyed By', value: `<@${editor}>`, inline: false }
    )
    .setTimestamp();
  try {
    await webhook.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Failed to send webhook log:', err);
  }
}

module.exports = { sendLogToWebhook };