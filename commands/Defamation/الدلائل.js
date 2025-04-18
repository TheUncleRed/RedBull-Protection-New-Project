const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { client, db, emoji } = require("./../../index.js");
const CHANNEL_ID = "1348471659774083112";

client.on("messageCreate", async (message) => {
if (message.author.bot) return;
if (message.channel.id !== CHANNEL_ID) return;

const args = message.content.split("\n");
const CaseID = args.shift().trim();

let dataCases = await db.get("TempCases") || [];
let dataCase = dataCases.find((t) => t.id == CaseID);

const Acss = (message.author.id !== dataCase?.by && !(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(role => role.id === settings.Roles.Judge.JudgeOfficer || role.id === settings.Roles.Judge.DeputeJudgeOfficer || role.id === settings.Roles.Admin.AllAccess_Staff)));
const hasAcss = message.member.roles.cache.some(role => role.id === '1349704506849366016');

if (Acss) {
  return message.reply({ content: `${emoji.NotAllowed} |  **You're not authorized to interfere !**`, ephemeral: true });
}

if (hasAcss) {
  return message.reply({ content: `${emoji.NotAllowed} |  **Your access to do anything is disabled !**` });
}

if (!dataCase) {
  return message.reply({ content: `${emoji.Error} |  **There is no case in this ID: \`${CaseID}\` !**` });
}

if (args.length === 0 && message.attachments.size === 0) {

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
    .setCustomId(`DefamationHelper-Details-${CaseID}`)
    .addOptions([
    {
    label: 'اظهار الدلائل',
    value: '1'
    },
    {
      label: 'حذف دليل',
      value: '2'  
    }
    ])
    )

return await message.reply({ content: ``, components: [row] });
}

let images = dataCase.screenshots || "";
  
message.attachments.forEach((attachment) => {
if (attachment.contentType && attachment.contentType.startsWith("image/")) {
      images += (images ? "\n" : "") + attachment.url;
  }
});

args.forEach((line) => {
  const matches = line.match(/\bhttps?:\/\/\S+/gi) || [];
if (matches) {
        images += (images ? "\n" : "") + matches.join("\n");
  }
});
  
if (images) {
dataCase.screenshots = images;
  await db.set("TempCases", dataCases);
message.reply("✅ تم حفظ الصور بنجاح!");

} else {
      message.reply("❌ لم يتم العثور على أي صور.");
  }
});