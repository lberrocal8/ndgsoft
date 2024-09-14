"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import DefaultLayout from "@/layouts/default";
import Comanda from "@/pages/dashboard/comanda";
import Mesa from "@/pages/dashboard/mesa";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("No autorizado");
      sessionStorage.removeItem("token");
      router.push("/");
    }

    async function fetchData() {
      try {
        const response = await fetch("/api/productos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!localStorage.getItem("ProductosBD")) {
          localStorage.setItem("ProductosBD", JSON.stringify(data.recordset));
        }
      } catch (error) {
        return "Error al cargar los productos de la base de datos";
      }
    }
    fetchData();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center mb-6">
        <Mesa />
      </section>
      <section className="flex flex-col items-center justify-center">
        <Comanda />
      </section>
    </DefaultLayout>
  );
}
