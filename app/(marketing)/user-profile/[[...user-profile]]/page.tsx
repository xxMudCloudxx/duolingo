import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <UserProfile
    appearance={{
      elements: {
        cardBox: "shadow-none! sm:max-h-[600px]!  border-1!",
        footer: "hidden!",
      },
    }}
  />
);

export default UserProfilePage;
