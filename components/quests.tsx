import { getDailyProgress } from "@/db/queries";
import { QuestsClient } from "./quests-client";

export const Quests = async () => {
  const dailyProgress = await getDailyProgress();
  return <QuestsClient points={dailyProgress?.points || 0} />;
};
