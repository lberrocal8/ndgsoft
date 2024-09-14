'use client'
import { MesaContextType } from '@/types';
import React, { useState } from 'react'

const MesaContext = React.createContext<MesaContextType | undefined>(undefined);

const MesaProvider = ({ children }: { children: React.ReactNode }) => {
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number>(0);
  return (
    <MesaContext.Provider value={{ mesaSeleccionada, setMesaSeleccionada }}>
      {children}
    </MesaContext.Provider>
  )
}

export { MesaContext, MesaProvider };