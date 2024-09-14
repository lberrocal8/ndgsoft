"use client";
import { useRouter } from "next/navigation";

import { LogoutIcon } from "@/components/icons";

function Button() {
  const router = useRouter();

  sessionStorage.removeItem("token");
  router.push("/");
}

export default function LogoutButton() {
  Button();

  return (
    <>
      <LogoutIcon />
    </>
  );
}
