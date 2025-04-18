const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { client, db, emoji } = require("../../../index.js");

client.on("interactionCreate", async (interaction) => {
 if (!interaction.isSelectMenu()) return;
 if (interaction.customId.startsWith('DefamationHelper-Details')) {
const value = interaction.values[0];
if (value === '1') {
await interaction.deferReply({ ephemeral: true });

try {
const CaseID = interaction.customId.split('-')[2];
let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);

if(!dataCase) return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, components: [] });

if (!dataCase.screenshots || typeof dataCase.screenshots !== "string") return interaction.editReply({ content: `${emoji.Error} | **No evidence has been uploaded yet !.**`, ephemeral: true });

const screenshots = dataCase.screenshots.trim();
const links = screenshots.split(/\s+/).filter(url => url.startsWith("http"));

if (links.length === 0) return interaction.editReply({ content: `${emoji.Error} | **There is an error in the evidence. Try deleting all evidence and re-uploading it !.**`, ephemeral: true});

const linksText = links.map((url, i) => `دليل رقم : ${i + 1} ([${i + 1}](${url}))`).join("\n");

await interaction.editReply({ content: `📜 **الدلائل:**\n${linksText}`, ephemeral: true });

} catch (error) {
console.error(`Error Case ${interaction.user.id} :`, error);
interaction.editReply({ content: "حدث خطأ غير متوقع، تم الإبلاغ عن الخطأ. يرجى عدم تكرار العملية مؤقتًا.", ephemeral: true });
}

  }
}
});

// client.on("interactionCreate", async (interaction) => {
// if (!interaction.isSelectMenu()) return;
// if (interaction.customId.startsWith('DefamationHelper-Details')) {
// const value = interaction.values[0];
// if (value == '1') {
// await interaction.deferReply({ ephemeral: true })

// try {
//  const CaseID = interaction.customId.split('-')[2];

// let dataCases = await db.get("TempCases") || [];
// let dataCase = dataCases.find((t) => t.id === CaseID);

// if(!dataCase) return interaction.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, ephemeral: true });

// await interaction.editReply({ content: `${emoji.Waiting} - **Please wait ..**`, components: [] });

// if (!dataCase.screenshots || typeof dataCase.screenshots !== "string") {
//   return interaction.editReply({ content: `${emoji.Error} |  **No evidence has been uploaded yet !.**` });
// }

// const screenshots = dataCase.screenshots;
// const attachments = screenshots.split("\n");

// interaction.editReply({ 
//   content: attachments.length > 0 ? "📜 **الدلائل:**" : "❌ لا توجد دلائل متاحة.", 
//   files: attachments
// });

// } catch (error) {
// console.error(`Error Case ${interaction.user.id} :`, error);
// interaction.editReply({ content: "حدث خطا غير متوقع ، تم الابلاغ عن الخطا ، يرجى منك عدم التكرار !", ephemeral: true });
// }

//  }
// }
// });