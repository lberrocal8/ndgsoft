import type { NextApiRequest, NextApiResponse } from "next";

import { supabase } from "@/utils/supabase";

interface DetallesComandaToBD {
  ReferenciaComanda: number;
  ReferenciaProducto: number;
  Descripcion: string;
  Cantidad: number;
  VrVenta: number;
  Subtotal: number;
}

interface ComandaToBD {
  Mesa: string;
  Observacion?: string;
  Total: number;
  Empleado: string;
  Fecha: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { facturaToAPI } = req.body;
    const facturaInsert: ComandaToBD[] = [
      {
        Mesa: facturaToAPI.productos[0].mesa,
        Observacion: facturaToAPI.observacion,
        Total: facturaToAPI.total,
        Empleado: facturaToAPI.empleado,
        Fecha: facturaToAPI.fecha,
      },
    ];
    const detallesInsert: DetallesComandaToBD[] = facturaToAPI.productos.map(
      (item: {
        mesa: string;
        referencia: number;
        descripcion: string;
        cantidad: number;
        vrventa: number;
        subtotal: number;
      }) => ({
        ReferenciaComanda: facturaToAPI.consecutivo,
        ReferenciaProducto: item.referencia,
        Descripcion: item.descripcion,
        Cantidad: item.cantidad,
        VrVenta: item.vrventa,
        Subtotal: item.subtotal,
      }),
    );

    const { error: ErrorComanda } = await supabase
      .from("Comanda")
      .insert(facturaInsert);

    if (ErrorComanda == null || ErrorComanda == undefined) {
      const { error: ErrorDetallesComanda } = await supabase
        .from("detalles_comanda")
        .insert(detallesInsert);

      if (ErrorDetallesComanda == null || ErrorDetallesComanda == undefined) {
        res.status(200).json({ message: "Comanda registrada correctamente" });
      } else {
        res.status(400).json({
          message: `detalles comanda bad: ${JSON.stringify(ErrorDetallesComanda)}`,
        });
      }
    } else {
      res
        .status(400)
        .json({ message: `comanda bad: ${JSON.stringify(ErrorComanda)}` });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
