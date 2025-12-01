import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoachingAdvice = async (rank: string, recentLoss: boolean): Promise<string> => {
  try {
    const prompt = recentLoss
      ? `我刚刚在王者荣耀排位赛输了（段位：${rank}），现在心态有点崩。我的账号因此被锁定了3天。请给我一段简短、严厉但带有鼓励性质的话（50字以内），告诉我为什么休息对调整心态很重要，以及如何避免“上头”。请用中文回答。`
      : `我是一名王者荣耀${rank}段位的玩家。请给我一个简短的宏观战术建议（30字以内），帮助我提高意识。请用中文回答。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt, 
    });

    return response.text || "调整心态，休息也是变强的一部分。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "保持冷静，反思刚才的对局。AI教练暂时掉线中。";
  }
};