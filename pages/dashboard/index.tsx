"use client";
import React, { useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import Comanda from "@/pages/dashboard/comanda";
import Mesa from "@/pages/dashboard/mesa";
import { supabase } from "@/utils/supabase";
import GetUser from "@/utils/getuser";

export default function Dashboard() {
  async function fetchData() {
    try {
      const { data: Mercancia } = await supabase.rpc("rownumbermercancia");

      if (Mercancia.length > 0) {
        localStorage.setItem("ProductosBD", JSON.stringify(Mercancia));
      }
    } catch (error) {
      return "Error al solicitar los productos a la base de datos";
    }
  }

  useEffect(() => {
    GetUser;
    fetchData();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col justify-center mt-2 mb-6">
        <Mesa />
      </section>
      <section className="flex flex-col items-center justify-center">
        <Comanda />
      </section>
    </DefaultLayout>
  );
}
