"use client";
import { UserProfile } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const UserProfilePage = () => (
  <UserProfile
    path="/user-profile"
    routing="path"
    appearance={{
      elements: {
        cardBox: "shadow-none! sm:max-h-[600px]!  border-1!",
        footer: "hidden!",
      },
    }}
  >
    <UserProfile.Link
      label="Back to Learn"
      labelIcon={<LogOut size={16} />}
      url="/learn"
    />
  </UserProfile>
);

export default UserProfilePage;
