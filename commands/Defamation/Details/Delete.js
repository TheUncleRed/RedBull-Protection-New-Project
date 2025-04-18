const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { client, db, emoji, settings } = require("../../../index.js");

client.on("interactionCreate", async (interaction) => {
if (!interaction.isSelectMenu()) return;
if (interaction.customId.startsWith('DefamationHelper-Details')) {
const value = interaction.values[0];
if (value == '2') {
await interaction.deferReply({ ephemeral: true })

const CaseID = interaction.customId.split('-')[2];

let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);
if(!dataCase) return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });

const Acss = (interaction.user.id !== dataCase.by && !(interaction.member.permissions.has('ADMINISTRATOR') || interaction.member.roles.cache.some(role => role.id === settings.Roles.Judge.JudgeOfficer || role.id === settings.Roles.Judge.DeputeJudgeOfficer || role.id === settings.Roles.Admin.AllAccess_Staff ) ));
const hasAcss = interaction.member.roles.cache.some(role => role.id === '1349704506849366016');

if (Acss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **You're not authorized to interfere !**` });
}

if (hasAcss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **Your access to do anything is disabled !**` });
}

const evidenceMap = {};
const evidenceOptions = (dataCase.screenshots && typeof dataCase.screenshots === "string") ? dataCase.screenshots.split("\n").map((url, index) => {
  const key = `ev_${CaseID}_${index}`;
evidenceMap[key] = url;
  return { label: `دليل رقم : ${index + 1}`, value: key };
}) : [];

if (evidenceOptions.length === 0) {
  return interaction.editReply({ content: `${emoji.Error} |  **No evidence has been uploaded yet !.**` });
}

await db.set(`evidenceMap_${CaseID}`, evidenceMap);

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
  .setCustomId(`remove_evidence-${CaseID}`)
  .addOptions(evidenceOptions)
);

const buttonRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(`remove_all_evidence-${CaseID}`)
    .setLabel('Delete all evidence')
    .setEmoji(`${emoji.Trash}`)
    .setStyle('DANGER')
);

await interaction.editReply({ content: `${emoji.Trash} |  **Select evidence to delete !.**`, components: [row, buttonRow] });

}
}
});


//
client.on("interactionCreate", async (interaction) => {
if (!interaction.isSelectMenu()) return;
if (interaction.customId.startsWith('remove_evidence')) {
const CaseID = interaction.customId.split("-")[1];
const selectedKey = interaction.values[0];

const evidenceMap = await db.get(`evidenceMap_${CaseID}`) || {};
const selectedUrl = evidenceMap[selectedKey];

if (!selectedUrl) interaction.update({ content: `${emoji.Error} | **Couldn't find the selected evidence.**`, components: [] });

await db.set(`confirmDelete_${interaction.user.id}_${CaseID}`, selectedKey);

return interaction.update({
content: `${emoji.WarningG} | **Are you sure you want to delete this evidence?**\n📌 Evidence:\n${selectedUrl}`,
  components: [
new MessageActionRow().addComponents(
new MessageButton()
  .setCustomId(`confirm_delete-${CaseID}`)
  .setLabel('Delete')
  .setEmoji(`${emoji.Trash}`)
  .setStyle('SECONDARY'),

new MessageButton()
  .setCustomId(`cancel_delete-${CaseID}`)
  .setLabel('Cancel')
  .setStyle('DANGER'))
]
});

  }
});


//
client.on("interactionCreate", async (interaction) => {
if (!interaction.isButton()) return;
if (interaction.customId.startsWith("confirm_delete")) {
const CaseID = interaction.customId.split("-")[1];
const selectedKey = await db.get(`confirmDelete_${interaction.user.id}_${CaseID}`);

let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);

await interaction.deferUpdate();

if(!dataCase) return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });

const evidenceMap = await db.get(`evidenceMap_${CaseID}`) || [];
const selectedUrl = evidenceMap[selectedKey];

if (!selectedUrl) return interaction.editReply({ content: `${emoji.Error} | **Could not find the evidence to delete.**`, components: [] });
    
if (!dataCase.oldScreenshots || typeof dataCase.oldScreenshots !== "string") {
  dataCase.oldScreenshots = "";
}

await interaction.editReply({ content: `${emoji.Waiting} - **Please wait ..**`, components: [] });

dataCase.oldScreenshots += (dataCase.oldScreenshots ? "\n" : "") + selectedUrl;
dataCase.screenshots = dataCase.screenshots.split("\n").filter((url) => url !== selectedUrl).join("\n");
    
await db.set("TempCases", dataCases);

delete evidenceMap[selectedKey];
await db.delete(`evidenceMap_${CaseID}`);
await db.delete(`confirmDelete_${interaction.user.id}_${CaseID}`);

await interaction.editReply({ content: `${emoji.yesGIF} | **Evidence has been deleted successfully .**`, components: [] });

  }
});


//
client.on("interactionCreate", async (interaction) => {
if (!interaction.isButton()) return;
if (interaction.customId.startsWith("cancel_delete")) {
const CaseID = interaction.customId.split("-")[1];
await db.delete(`confirmDelete_${interaction.user.id}_${CaseID}`);

let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);

if(!dataCase) return interaction.update({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });
await db.delete(`confirmDelete_${interaction.user.id}_${CaseID}`);

const evidenceMap = await db.get(`evidenceMap_${CaseID}`) || {};
const evidenceOptions = Object.keys(evidenceMap).map((key, index) => ({
  label: `دليل رقم : ${index + 1}`,
  value: key
}));

if (evidenceOptions.length === 0) return interaction.update({ content: `${emoji.Error} |  **No evidence has been uploaded yet !.**`, components: [] });

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
.setCustomId(`remove_evidence-${CaseID}`)
.addOptions(evidenceOptions))

const buttonRow = new MessageActionRow().addComponents(
new MessageButton()
.setCustomId(`remove_all_evidence-${CaseID}`)
.setLabel('Delete all evidence')
.setEmoji(`${emoji.Trash}`)
.setStyle('DANGER'))

await interaction.update({ content: `${emoji.Trash} |  **Select evidence to delete !.**`, components: [row, buttonRow] });

  }
});


//
client.on("interactionCreate", async (interaction) => {
if (!interaction.isButton()) return;
if (interaction.customId.startsWith('remove_all_evidence')) {

const CaseID = interaction.customId.split("-")[1];
let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);

await interaction.deferUpdate();

if(!dataCase) return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });

const Acss = (interaction.member.permissions.has('ADMINISTRATOR') || interaction.member.roles.cache.some(role => role.id === settings.Roles.Judge.JudgeOfficer || role.id === settings.Roles.Judge.DeputeJudgeOfficer || role.id === settings.Roles.Admin.AllAccess_Staff ) );

if (!Acss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **You're not authorized to interfere !**`, components: [] });
}

if (!dataCase.screenshots || dataCase.screenshots.trim() === "") {
return interaction.editReply({ content: `${emoji.Error} |  **There are no evidences to delete !**`, components: [] })
}

await interaction.editReply({ content: `${emoji.Waiting} - **Please wait ..**`, components: [] })

if (!dataCase.oldScreenshots || typeof dataCase.oldScreenshots !== "string") {
  dataCase.oldScreenshots = "";
}

const deletedScreenshots = dataCase.screenshots.split("\n");
dataCase.oldScreenshots += (dataCase.oldScreenshots ? "\n" : "") + deletedScreenshots.join("\n");

dataCase.screenshots = null;

await db.set("TempCases", dataCases);
await db.delete(`evidenceMap_${CaseID}`);

await interaction.editReply({ 
  content: `${emoji.yesGIF} |  **All evidences have been deleted successfully .**`
});

  }
});


// client.on("interactionCreate", async (interaction) => {
// if (!interaction.isSelectMenu()) return;
// if (interaction.customId.startsWith('remove_evidence')) {

// const CaseID = interaction.customId.split("-")[1];
// let dataCases = await db.get("TempCases") || [];
// let dataCase = dataCases.find((t) => t.id === CaseID);

// await interaction.deferUpdate();

// if(!dataCase) return interaction.editReply({ content: `${emoji.WarningG} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });

// await interaction.editReply({ content: `${emoji.Waiting} - **Please wait ..**`, components: [] })

// const evidenceMap = await db.get(`evidenceMap_${CaseID}`) || [];
// const selectedKey = interaction.values[0];
// const selectedUrl = evidenceMap[selectedKey];

// if (!selectedUrl) {
//   return interaction.editReply({ content: `${emoji.WarningG} |  **I couldn't find the evidence: **\`${selectedKey}\` !**` });
// }

// if (!dataCase.oldScreenshots || typeof dataCase.oldScreenshots !== "string") {
//   dataCase.oldScreenshots = "";
// }

// dataCase.oldScreenshots += (dataCase.oldScreenshots ? "\n" : "") + selectedUrl;

// dataCase.screenshots = dataCase.screenshots.split("\n").filter((url) => url !== selectedUrl).join("\n");

// await db.set("TempCases", dataCases);

// delete evidenceMap[selectedKey];
// await db.delete(`evidenceMap_${CaseID}`);

// await interaction.editReply({ content: `${emoji.yesGIF} |  **the evidence deleted successfully .**` });

// }
// });