import { supabase } from "@/utils/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getProducts (req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No autorizado para realizar esta acción' });
  }

  try {
    const { data: Mercancia } = await supabase.rpc('rownumbermercancia');
    return res.status(200).json(Mercancia);
  } catch (error) {
    return res.status(500).json('Error obteniendo los productos de la base de datos');
  }
}