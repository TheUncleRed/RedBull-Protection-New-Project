const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Modal, TextInputComponent } = require("discord.js");
const { client, db, emoji, settings } = require('./../../index.js');
const { generateNumberUniqueTempCase } = require('./../../function/function/generateNumber.js');
const { getDetailedStory } = require('./../../function/function/StoryAnalysis-byAi.js');

client.on('interactionCreate', async interaction => {
if (!interaction.isButton()) return;
if (interaction.customId == 'Defamation-Report'){

const modal = new Modal()
.setCustomId('ModalDefamation-Report')
.setTitle('تقديم بلاغ')
    
const scammerID = new TextInputComponent()
.setCustomId('scammerID')
.setLabel('ايدي النصاب')
.setStyle('SHORT')
.setRequired(true);

const DefraudedID = new TextInputComponent()
.setCustomId('DefraudedID')
.setLabel('ايدي المنصوب :')
.setStyle('SHORT')
.setRequired(true);

const Item = new TextInputComponent()
.setCustomId('Item')
.setLabel("السلعة :")
.setStyle('SHORT')
.setRequired(true);

const thePrice = new TextInputComponent()
.setCustomId('thePrice')
.setLabel('المبلغ :')
.setStyle('SHORT')
.setRequired(true);

const theStory = new TextInputComponent()
.setCustomId('theStory')
.setLabel('القصة :')
.setStyle('SHORT')
.setRequired(true);

const firstActionRow = new MessageActionRow().addComponents(scammerID);
const secondActionRow = new MessageActionRow().addComponents(DefraudedID);
const thirdActionRow = new MessageActionRow().addComponents(Item);
const fourthActionRow = new MessageActionRow().addComponents(thePrice);
const fifthActionRow = new MessageActionRow().addComponents(theStory);


modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);
await interaction.showModal(modal);

 }
});

//
client.on('interactionCreate', async interaction => {
if (!interaction.isModalSubmit()) return;
if (interaction.customId == 'ModalDefamation-Report'){

await interaction.deferReply({ ephemeral: true });

const scammerID = interaction.fields.getTextInputValue('scammerID');
const DefraudedID = interaction.fields.getTextInputValue('DefraudedID');
const Item = interaction.fields.getTextInputValue('Item');
const thePrice = interaction.fields.getTextInputValue('thePrice');
const theStory = interaction.fields.getTextInputValue('theStory');

const caseID = await generateNumberUniqueTempCase();
await interaction.editReply({ content: `${emoji.Waiting} **Loading the case**`, ephemeral: true });

const Embed = new MessageEmbed()
.setTitle(`بلاغ جديد`)
.addFields({
name:`**الشخص الذي نصب**` ,
value:`> <@${scammerID}> (\`${scammerID}\`)\n──────────────`,
inline:false
},{
name:`**الشخص الذي تم النصب عليه**` ,
value:`> <@${DefraudedID}> (\`${DefraudedID}\`)\n──────────────`,
inline:false
},{
name:`**السلعة**`,
value:`> ${Item}\n──────────────`,
inline: false,
},{
name:`**المبلغ**`,
value: `> ${thePrice}\n──────────────`,
inline: false,
},{
name:`**القصة**` ,
value:`\`\`\`${theStory}\`\`\``,
inline:false
})

.setColor(`${settings.HEX}`)
.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
.setFooter({ text: `By: ${interaction.user.username}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
.setTimestamp();

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
.setCustomId(`mdlclcmwcm-${caseID}`)
.addOptions([
{
label: 'تحليل القصة',
value: '1',
},{
label: 'التحكم في القضية',
value: '2'
}
])
)

await interaction.channel.setParent(`1360993690348294286`);

await interaction.channel.send({ content: `<@&${settings.Roles.Judge.JudgeRole}>`, embeds: [Embed], components: [row] }).then(async (message) => {
  await message.pin();
  setTimeout(async () => {
    await interaction.channel.send({ content: `${settings.lineurl}` });
    interaction.message.delete();
  }, 1);
});


setTimeout(() => {
interaction.channel.send({ content: `– **الدلائل ** –

**الخطوة التالية ، نحتاج منك الدلائل للاستكمال مع المُشهر .
الدلائل المطلوبة : 
دليل الاتفاق بينك وبين النصاب من بداية المحادثة مع النصاب على : ${Item}
دليل النصب (بلوك , السلعة لم تعد تعمل , لم يرد عليك)
دليل تحويل مبلغ السلعة التي تم النصب عليك فيها
اذا المبلغ كان كرديت فـ يرجى منك ان تاتي بدليل التحويل من** : https://probot.io/transactions` });
}, 3500)

await db.push(`TempCases`, {
id: `${caseID}`,
channel: `${interaction.channel.id}`,
repoter : `${scammerID}`,
scammer : `${DefraudedID}`,
screenshots : null,
oldScreenshots : null,
case : theStory,
creditstolen : `${thePrice}`,
by : null,
in: `<t:${Math.floor(Date.now() / 1000)}:F>`
});

await interaction.editReply({ content: `${emoji.yesGIF} **Successfully Case Created**`, ephemeral: true });

}
});

//
client.on('interactionCreate', async interaction => {
if (!interaction.isSelectMenu()) return;
if (interaction.customId.startsWith('mdlclcmwcm')) {
const value = interaction.values[0];
if (value == '1') {

await interaction.deferReply({ ephemeral: true });

const CaseID = interaction.customId.split('-')[1];
const dataCases = await db.get(`TempCases`) || [];
const dataCase = dataCases.find((t) => t.id === CaseID);

if (!dataCase || !dataCase.case) {
 return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**` });
}

await interaction.editReply({ content: '⏳ | جاري تحليل القصة من خلال الذكاء الاصطناعي ..' });

const originalStory = dataCase.case;

const detailedStory = await getDetailedStory(originalStory);

const Embed = new MessageEmbed()
.setTitle('تحليل القصة')
.setDescription(detailedStory)
.setColor('#0099ff')
.setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: false }) })
.setTimestamp()

await interaction.editReply({ content: null, embeds: [Embed] });

}
}
});

// تحكم في القضيه
client.on('interactionCreate', async interaction => {
if (!interaction.isSelectMenu()) return;
if (interaction.customId.startsWith('mdlclcmwcm')) {
const value = interaction.values[0];
if (value == '2') {

await interaction.deferReply({ ephemeral: true })

const CaseID = interaction.customId.split('-')[1];
let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id === CaseID);

const Acss = (interaction.user.id !== dataCase.by && !(interaction.member.permissions.has('ADMINISTRATOR') || interaction.member.roles.cache.some(role => role.id === settings.Roles.Judge.JudgeOfficer || role.id === settings.Roles.Judge.DeputeJudgeOfficer || role.id === settings.Roles.Admin.AllAccess_Staff ) ));
const hasAcss = interaction.member.roles.cache.some(role => role.id === '1349704506849366016');

if (Acss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **You're not authorized to interfere !**`, ephemeral: true });
}

if (hasAcss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **Your access to do anything is disabled !**`, ephemeral: true });
}

if(!dataCase) return interaction.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, ephemeral: true });

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
.setCustomId(`tcktcc-${CaseID}`)
.addOptions([
{
label: 'رفع البلاغ الى المسؤولين',
value: 'DefamationHelper-ReportToAdmins'
}
])
)

await interaction.editReply({ 
content: `> **مرحبًا بك، ${interaction.user}!** 👋\n\n**يمكنك من خلال القائمة ادناه :** 
- 📢 **رفع البلاغ إلى المسؤولين**\n\nيرجى اختيار الخيار المناسب من القائمة ادناه.`, 
    components: [row], 
    ephemeral: true 
});

}
}
});

//
client.on('interactionCreate', async interaction => {
if (!interaction.isSelectMenu()) return;
if (interaction.customId.startsWith('tcktcc')) {
const value = interaction.values[0];
if (value == 'DefamationHelper-ReportToAdmins') {

const CaseID = interaction.customId.split('-')[1];
const dataCases = await db.get(`TempCases`) || [];
const dataCase = await dataCases?.find((t) => t.id == CaseID)

if(!dataCase) return interaction.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, ephemeral: true });

const Embed = new MessageEmbed()
.addFields({
name:`**الشخص الذي نصب**` ,
value:`> <@${dataCase.scammer}> (\`${dataCase.scammer}\`)\n──────────────`,
inline: true
},{
name:`**الشخص الذي تم النصب عليه**` ,
value:`> <@${dataCase.repoter}> (\`${dataCase.repoter}\`)\n──────────────`,
inline: true
},{
name:`**المبلغ**`,
value: `> ${dataCase.creditstolen}\n──────────────`,
inline: false,
},{
name:`**القصة**` ,
value:`\`\`\`${dataCase.case}\`\`\``,
inline:false
})

const screenshots = dataCase.screenshots || '';
const attachments = screenshots ? screenshots.split("\n") : [];

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
.setCustomId(`DefamationHelper-SubmitReport-${CaseID}`)
.addOptions([
{
label: 'تعديل مُعرف النصاب',
value: 'DefamationHelper-EditScammerID',
},{
label: 'تعديل مُعرف المنصوب',
value: 'DefamationHelper-EditRepoterID'
},{
label: 'تعديل القصة',
value: 'DefamationHelper-EditStory'
},{
label: 'تعديل مبلغ النصب',
value: 'DefamationHelper-EditPrice'
},{
label: 'اضافة الدلائل',
value: 'DefamationHelper-AddScreeshots'
}
])
)

await interaction.update({ content: `اهلا بك عزيزي المُشهر في واجهة رفع البلاغ ، يُمكنك تعديل البلاغ قبل رفعه .
  تسطيع ان تضيف الدلائل الى القضية من خلال روم #رفع الدلائل بمُعرف القضية الحالي : **${CaseID}** !.`, embeds: [Embed], components: [row] });

  if (attachments.length > 0) {
    await interaction.followUp({
      content: `**الدلائل :**`,
      files: attachments,
      ephemeral: true
    });
  } else {
    await interaction.followUp({
      content: `${emoji.WarningG} |  **No evidence has been uploaded yet !.**`,
      ephemeral: true
    });
  }

 }
}
});

//
client.on('interactionCreate', async interaction => {
if (!interaction.isButton()) return;
if (interaction.customId.startsWith('DefamationHelper-ShowCase')) {

const CaseID = interaction.customId.split('-')[2];
const dataCases = await db.get(`TempCases`) || [];
const dataCase = await dataCases?.find((t) => t.id == CaseID)

await interaction.deferUpdate();

const Acss = (interaction.user.id !== dataCase.by && !(interaction.member.permissions.has('ADMINISTRATOR') || interaction.member.roles.cache.some(role => role.id === settings.Roles.Judge.JudgeOfficer || role.id === settings.Roles.Judge.DeputeJudgeOfficer || role.id === settings.Roles.Admin.AllAccess_Staff ) ));
const hasAcss = interaction.member.roles.cache.some(role => role.id === '1349704506849366016');

if (Acss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **You're not authorized to interfere !**`, ephemeral: true });
}

if (hasAcss) {
  return interaction.editReply({ content: `${emoji.NotAllowed} |  **Your access to do anything is disabled !**`, ephemeral: true });
}

if(!dataCase) return interaction.editReply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**`, ephemeral: true });

const Embed = new MessageEmbed()
.addFields({
name:`**الشخص الذي نصب**` ,
value:`> <@${dataCase.scammer}> (\`${dataCase.scammer}\`)\n──────────────`,
inline: true
},{
name:`**الشخص الذي تم النصب عليه**` ,
value:`> <@${dataCase.repoter}> (\`${dataCase.repoter}\`)\n──────────────`,
inline: true
},{
name:`**المبلغ**`,
value: `> ${dataCase.creditstolen}\n──────────────`,
inline: false,
},{
name:`**القصة**` ,
value:`\`\`\`${dataCase.case}\`\`\``,
inline:false
})

const row = new MessageActionRow().addComponents(
new MessageSelectMenu()
.setCustomId(`DefamationHelper-SubmitReport-${CaseID}`)
.addOptions([
{
label: 'تعديل مُعرف النصاب',
value: 'DefamationHelper-EditScammerID',
},{
label: 'تعديل مُعرف المنصوب',
value: 'DefamationHelper-EditRepoterID'
},{
label: 'تعديل القصة',
value: 'DefamationHelper-EditStory'
},{
label: 'تعديل مبلغ النصب',
value: 'DefamationHelper-EditPrice'
}
])
)

await interaction.editReply({ content: `اهلا بك عزيزي المُشهر في واجهة رفع البلاغ ، يُمكنك تعديل البلاغ قبل رفعه .
تسطيع ان تضيف الدلائل الى القضية من خلال روم #رفع الدلائل بمُعرف القضية الحالي : **${CaseID}** !.`, embeds: [Embed], components: [row] });

}
});