'use client'
import { LogoutIcon } from "@/components/icons"
import { useRouter } from "next/navigation";

function Button() {
  const router = useRouter();
  sessionStorage.removeItem('token');
  router.push('/');
}

export default function LogoutButton() {
  Button();
  return (
    <>
      <LogoutIcon />
    </>
  );
};