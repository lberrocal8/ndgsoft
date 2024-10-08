"use client";
import React, { useState } from "react";

import { MesaContextType } from "@/types";

const MesaContext = React.createContext<MesaContextType>({
  mesaSeleccionada: "1",
  setMesaSeleccionada: () => {},
});

const MesaProvider = ({ children }: { children: React.ReactNode }) => {
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>("1");

  return (
    <MesaContext.Provider value={{ mesaSeleccionada, setMesaSeleccionada }}>
      {children}
    </MesaContext.Provider>
  );
};

export { MesaContext, MesaProvider };
