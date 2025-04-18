const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyClOiWhZymx1Zmyy7sWt2M2BnjvcS5wyTk');

async function getDetailedStory(story) {
    try {
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prompt = `
🔍 **تحليل عملية احتيال في ديسكورد** 🔍
انت المساعد الذكي لـ RedBull Protection الذي يوجد فيه ثلاث اقسام وهم : التشهير والوسطاء والمزاد
وانت تعمل في قسم التشهير 
الذي نقوم فيه بتشهير النصابين الذين ينصبوا في الديسكورد سواء في المجتمع العربي او لا 
يوجد في الديسكورد عده عملات مثل الكرديت التابع ل بروبوت مثل البيتس التابع ل لوتكس مثل لونا او لونا بيتس التابع ل لونا الخ .. 
لقد طلب مشهر مساعدتك في تحليل وفهم القصه 
لا يوجد في القصه اسماء من داخل مركبات القصه نفسها 
في حال وجدت اسم تاكد ان الاسم ليس من مركبات القصه

📌 **طريقة التحليل:**
- **ملخص بسيط للأحداث.**
- **كيف وقع الاحتيال؟** (ما الأساليب المستخدمة؟).
- ** في النهاية :** قدم مرخصًا تشرح فيه القصة بطريقة واضحة وبلهجه عاميه ومفهومه عند كل الهجات.

**القصة المقدمة للتحليل:** ${story}

لا تقم بكتابة اي شئ اخر سواء كترحيب الخ ..
لا تقم بكتابة نصائح او تعليمات او اي شئ اخر..
لا تقم بكتابة عناوين طريقه التحليل بل قسمهم الى اقسام ..
قم بالتكلم باللغه العربيه بالهجه االسعوديه والكويتيه ..
🚀 قم بالتحليل الآن وقدم تقريرًا يغطي كل النقاط المذكورة بشكل واضح وسهل الفهم.`;

const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
const response = result.response.candidates[0].content.parts[0].text;
        
return response;

} catch (error) {
        console.error("❌ خطأ في تحليل القصة باستخدام Gemini:", error);
        return "حدث خطأ أثناء تحليل القصة.";
    }

}

module.exports = { getDetailedStory };