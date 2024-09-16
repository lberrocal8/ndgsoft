'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import DefaultLayout from "@/layouts/default";
import Comanda from "@/pages/dashboard/comanda";
import Mesa from "@/pages/dashboard/mesa";
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('No autorizado');
      sessionStorage.clear();
      router.push('/');
    }

    async function fetchData() {
      try {
        const { data: Mercancia } = await supabase.rpc('rownumbermercancia');
        if (Mercancia.length > 0) {
          localStorage.setItem('ProductosBD', JSON.stringify(Mercancia));
        }
      } catch (error) {
        return 'Error al solicitar los productos a la base de datos';
      }
    }
    fetchData();
  }, []);

  return (  
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center mb-6">
        <Mesa />
      </section>
      <section className='flex flex-col items-center justify-center'>
        <Comanda />
      </section>
    </DefaultLayout>
  );
}
