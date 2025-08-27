"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

export const SidebarItem = ({ label, iconSrc, href }: Props) => {
  const path = usePathname();
  const active = path === href;
  const router = useRouter();

  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"}
      asChild
      className="justify-start h-[52px]"
      onMouseEnter={() => router.prefetch(href)}
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className="mr-5"
          height={52}
          width={52}
        />
        {label}
      </Link>
    </Button>
  );
};
