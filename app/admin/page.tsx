"use client";

import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const App = dynamic(() => import("./app"), { ssr: false });

const AdminPage = () => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (user?.publicMetadata?.role === "admin") {
    return <App />;
  } else {
    redirect("/");
  }
};

export default AdminPage;
