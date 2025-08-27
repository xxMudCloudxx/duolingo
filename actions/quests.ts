"use server";

import { getQuests as getQuestsFromDb } from "@/db/queries";

/**
 * @param timeZone 从客户端传递的用户时区
 * @returns 返回用户每日任务的 Promise
 */
export const getQuestsAction = async (timeZone: string) => {
  const quests = await getQuestsFromDb(timeZone);
  return quests;
};
