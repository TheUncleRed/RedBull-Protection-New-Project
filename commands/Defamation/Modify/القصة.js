const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const { client, db, emoji } = require('../../../index.js');
// const { sendLogToWebhook } = require('../../../function/function/modifyDetailsLog.js');

client.on('interactionCreate', async interaction => {
if (!interaction.isSelectMenu()) return
if (interaction.customId.startsWith('DefamationHelper-SubmitReport')) {
const value = interaction.values[0];
if (value == 'DefamationHelper-EditStory') {

const CaseID = interaction.customId.split('-')[2];
const dataCases = await db.get(`TempCases`) || [];
const dataCase = await dataCases?.find((t) => t.id == CaseID)

if(!dataCase) return interaction.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**` });

const modal = new Modal()
.setCustomId(`ModalDefamationHelper-EditStory-${CaseID}`)
.setTitle('・| Edit Case')
    
const story = new TextInputComponent()
.setCustomId('newStory')
.setLabel('القصة؟ :')
.setValue(`${dataCase.case}`)
.setStyle('SHORT')
.setRequired(true);

const firstActionRow = new MessageActionRow().addComponents(story);

modal.addComponents(firstActionRow);
await interaction.showModal(modal);

  }
}
});

//
client.on('interactionCreate', async interaction => {
if (!interaction.isModalSubmit()) return;
if (interaction.customId.startsWith('ModalDefamationHelper-EditStory')) {

const NewStory = interaction.fields.getTextInputValue('newStory');

const CaseID = interaction.customId.split('-')[2];
const dataCases = await db.get(`TempCases`) || [];
const dataCase = await dataCases?.find((t) => t.id == CaseID)

if(!dataCase) return interaction.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**` });

const row = new MessageActionRow().addComponents(
  new MessageButton()
.setCustomId(`DefamationHelper-ShowCase-${CaseID}`)
.setStyle('SUCCESS')
.setEmoji(`✅`))

/*await sendLogToWebhook({
  title: "Edited",
  caseID: CaseID,
  fieldName: "Case",
  oldValue: dataCase.,
  newValue: '',
  editor: interaction.user.id
});*/

dataCase.case = NewStory;
  await db.set("TempCases", dataCases);

  await interaction.update({ content: null, embeds: [], components: [row] });
  
  }
});