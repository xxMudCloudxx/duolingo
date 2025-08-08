"use client";
import { courses, userProgress } from "@/db/schema";
import { Card } from "./card";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";

type Props = {
  courses: (typeof courses.$inferSelect)[];
  activeCourseId?: typeof userProgress.$inferInsert.activeCourseId;
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTranstition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    startTranstition(() => {
      debugger;
      upsertUserProgress(id).catch(() => toast.error("something went wrong."));
    });
  };

  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imgSrc={course.imgSrc}
          onClick={onClick}
          disabled={pending}
          active={activeCourseId === course.id}
        />
      ))}
    </div>
  );
};
