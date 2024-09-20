import { useRouter } from "next/navigation";

import notify from "@/utils/notify";

export default function GetUser() {
  const router = useRouter();
  const token = sessionStorage.getItem("token");

  if (!token) {
    notify("error", "No autorizado para realizar esta acción");
    sessionStorage.clear();
    router.push("/");
  }
}
