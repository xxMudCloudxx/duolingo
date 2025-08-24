import { generateAndCacheAudio } from "@/actions/text-to-speech";
import { languageCode } from "@/constants";
import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useState, useTransition } from "react";
import { useAudio, useKey } from "react-use";
import { toast } from "sonner";

type Props = {
  id: number;
  imgSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  status?: "correct" | "wrong" | "none";
  type: (typeof challenges.$inferSelect)["type"];
  languageCode: languageCode;
};

export const Card = ({
  imgSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  disabled,
  status,
  type,
  languageCode,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const [dynamicAudioSrc, setDynamicAudioSrc] = useState<string | null>(null);

  const finalAudioSrc = audioSrc || dynamicAudioSrc;
  const [audio, , controls] = useAudio({ src: finalAudioSrc || "" });

  const handleClick = useCallback(() => {
    if (disabled || isPending) return;

    if (finalAudioSrc) {
      controls.play();
    } else {
      startTransition(() => {
        generateAndCacheAudio(text, languageCode)
          .then((result) => {
            if (result.success && result.url) {
              setDynamicAudioSrc(result.url);
              const newAudio = new Audio(result.url);
              newAudio.play();
            } else {
              toast.error(result.error);
            }
          })
          .catch(() => toast.error("something went wrong"));
      });
    }

    onClick();
  }, [
    disabled,
    onClick,
    controls,
    finalAudioSrc,
    languageCode,
    text,
    isPending,
  ]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "lg:p-3 w-full"
      )}
    >
      {audio}
      {imgSrc && (
        <div className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
          <Image src={imgSrc} fill alt={text} />
        </div>
      )}
      <div
        className={cn(
          "flex items-center justify-between",
          type === "ASSIST" && "flex-row-reverse"
        )}
      >
        {
          // 占位来实现布局：[ Text ]<-------------------->[ Shortcut ]
          type === "ASSIST" && <div />
        }
        <p
          className={cn(
            "text-neutral-600 text-sm lg:text-base",
            selected && "text-sky-500",
            selected && status === "correct" && "text-green-500",
            selected && status === "wrong" && "text-rose-500"
          )}
        >
          {text}
        </p>
        <div
          className={cn(
            "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center",
            "rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
            selected && "text-sky-500 border-sky-300",
            selected &&
              status === "correct" &&
              "text-green-500 border-green-500",
            selected && status === "wrong" && "text-rose-500 border-rose-500"
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  );
};
