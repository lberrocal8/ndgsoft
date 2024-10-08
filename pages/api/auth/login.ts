import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import { supabase } from "@/utils/supabase";

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { username, password } = req.body;
    // Inicia sesión
    const user = await authenticate(username, password);

    const activeName = user.Nombre;
    const activeUser = user.Usuario;
    const activeType = user.Tipo;

    if (user) {
      // Devuelve el token de sesión
      const token = await generateToken(user);

      res.json({ token, activeUser, activeName, activeType });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
};

const authenticate = async (username: string, password: string) => {
  try {
    const { data } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("Usuario", username)
      .eq("Clave", password);

    if (data) return data[0];
  } catch (error) {
    return "Error en la autenticación";
  }
};

const generateToken = async (user: any) => {
  // Genera un token de sesión
  const token = await jwt.sign(user, process.env.SECRET!, { expiresIn: "12h" });

  return token;
};

export default login;
