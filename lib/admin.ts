import { auth } from "@clerk/nextjs/server";

const allowedIds = ["user_30uyoRAytT2ZCxdtvEoT6VjuNHf"];
export const isAdmin = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  return allowedIds.indexOf(userId) !== -1;
};
