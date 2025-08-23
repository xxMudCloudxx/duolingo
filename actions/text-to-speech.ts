"use server";

import * as fs from "node:fs/promises";
import * as path from "node:path";
import OpenAI from "openai"; // 导入 OpenAI
import { getAudioCache } from "@/db/queries";
import db from "@/db/drizzle";
import { audioCache, challengeOptions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

// 插入新的音频缓存记录
export const setAudioCache = async (
  text: string,
  languageCode: string,
  url: string
) => {
  const [data] = await db
    .insert(audioCache)
    .values({
      text,
      languageCode,
      url,
    })
    .returning();
  return data;
};

/**
 * 更新 challengeOptions 表中指定文本的 audioSrc 字段
 * @param text - 要匹配的文本
 * @param audioSrc - 新的音频文件 URL
 */
export const updateChallengeOptionsAudioSrc = async (
  text: string,
  audioSrc: string
) => {
  try {
    // 更新所有 text 匹配且 audioSrc 为 null 的记录
    await db
      .update(challengeOptions)
      .set({ audioSrc: audioSrc })
      .where(
        and(eq(challengeOptions.text, text), isNull(challengeOptions.audioSrc))
      );
  } catch (error) {
    console.error("Error updating challengeOptions audio source:", error);
  }
};

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30 * 1000, // 设置超时为 30 秒 (默认是 10 秒)
  baseURL: "https://api.wlai.vip/v1",
});

// 为不同语言分配不同的 OpenAI 声音，增加多样性
// OpenAI 的声音并非特定于语言，但我们可以手动映射
// 可选声音: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
const languageVoiceMap: Record<
  string,
  "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
> = {
  es: "nova", // 西班牙语
  fr: "echo", // 法语
  jp: "shimmer", // 日语
  cn: "onyx", // 中文
  hr: "fable", // 克罗地亚语 (示例)
  // 你可以为其他语言分配声音
};

/**
 * 将文本处理成适合用作文件名的安全字符串
 * @param text 输入文本
 * @returns 返回一个清理过的、小写的字符串
 */
const sanitizeTextForFilename = (text: string): string => {
  // 中文字符在现代文件系统中是安全的，我们主要处理空格和标点
  return text
    .toLowerCase()
    .replace(/\s+/g, "_") // 将一个或多个空格替换为下划线
    .replace(/[?？.,。!！:：;"'“”‘’]/g, ""); // 移除常见的中英文标点
};

interface AudioGenerationResult {
  success: boolean;
  url: string | null;
  error: string | null;
}

export const generateAndCacheAudio = async (
  text: string,
  languageCode: string
): Promise<AudioGenerationResult> => {
  try {
    // 检查缓存 (这部分逻辑不变)
    const cachedAudio = await getAudioCache(text, languageCode);
    if (cachedAudio) {
      return { success: true, url: cachedAudio.url, error: null };
    }

    // 调用 OpenAI API
    const voice = languageVoiceMap[languageCode] || "alloy"; // 如果没有指定，则使用默认声音

    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // 使用 tts-1 模型，延迟较低
      voice: voice,
      input: text,
      speed: 0.75,
    });

    // 将返回的音频流转换为 Buffer
    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

    // 根据语言创建目标目录
    const publicDir = path.join(process.cwd(), "public", "audio", languageCode);

    // 根据语言和文本内容创建文件名
    const sanitizedText = sanitizeTextForFilename(text);
    const fileName = `${languageCode}_${sanitizedText}.mp3`;

    // 组合成完整的文件系统路径
    const filePath = path.join(publicDir, fileName);

    // 确保目录存在，如果不存在则创建它
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(filePath, audioBuffer);

    // 创建可供前端访问的 URL 路径
    const audioUrl = `/audio/${languageCode}/${fileName}`;

    // 更新缓存数据库
    await setAudioCache(text, languageCode, audioUrl);
    await updateChallengeOptionsAudioSrc(text, audioUrl);

    return { success: true, url: audioUrl, error: null };
  } catch (error) {
    console.error("[OpenAI TTS Action Error]", error);
    return { success: false, url: null, error: "音频生成失败" };
  }
};
