// scripts/pregenerate_audio.ts

import "dotenv/config";
import db from "@/db/drizzle";
import { generateAndCacheAudio } from "@/actions/text-to-speech";
import { courseTitleToLangCode } from "@/constants";

// --- 配置项 ---
const RETRY_COUNT = 3; // 每次请求失败后，最多重试3次
const RETRY_DELAY = 1000; // 每次重试前，等待1秒 (1000毫秒)
const REQUEST_DELAY = 500; // 每个文本处理完后，等待0.5秒再处理下一个

const main = async () => {
  try {
    console.log("🚀 开始智能预生成音频...");

    // 1. 使用 Drizzle 的关联查询，一次性获取所有需要的数据
    const data = await db.query.challengeOptions.findMany({
      columns: {
        text: true,
        audioSrc: true,
      },
      with: {
        challenge: {
          with: {
            lesson: {
              with: {
                unit: {
                  with: {
                    course: {
                      columns: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      //过滤掉那些已经有 audioSrc 的选项，或者文本为空的选项
      where: (challengeOptions, { isNull, eq }) =>
        isNull(challengeOptions.audioSrc),
    });

    console.log(`🔍 数据库查询完成，发现 ${data.length} 个挑战选项需要检查。`);

    for (const option of data) {
      if (
        !option.text ||
        option.audioSrc ||
        !option.challenge?.lesson?.unit?.course?.title
      ) {
        continue;
      }

      const courseTitle = option.challenge.lesson.unit.course.title;
      const lang = courseTitleToLangCode[courseTitle];
      const text = option.text;

      if (!lang) {
        console.warn(
          `- ⚠️ 跳过文本: "${text}" (课程 "${courseTitle}" 语言不支持)`
        );
        continue;
      }

      console.log(`- [${lang}] 开始处理文本: "${text}"`);

      let success = false;
      for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
        const result = await generateAndCacheAudio(text, lang);
        if (result.success) {
          console.log(
            `  ✅ 成功 (尝试 ${attempt}/${RETRY_COUNT}): ${result.url}`
          );
          success = true;
          break; // 成功，跳出重试循环
        } else {
          console.error(
            `  ❌ 失败 (尝试 ${attempt}/${RETRY_COUNT}): ${result.error}`
          );
          if (attempt < RETRY_COUNT) {
            console.log(`  ... ${RETRY_DELAY / 1000}秒后重试 ...`);
            await sleep(RETRY_DELAY);
          }
        }
      }

      if (!success) {
        console.error(
          `  🔥🔥🔥 最终失败: 文本 "${text}" 在重试 ${RETRY_COUNT} 次后仍然无法生成。`
        );
      }

      // 在处理下一个文本前等待一小段时间
      await sleep(REQUEST_DELAY);
    }

    console.log("✨ 音频预生成完成!");
    process.exit(0);
  } catch (error) {
    console.error("🔥 发生严重错误:", error);
    process.exit(1);
  }
};

main();

// --- 辅助函数 ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
