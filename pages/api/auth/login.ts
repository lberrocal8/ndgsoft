import { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import sql from 'mssql';

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    // Inicia sesión
    const user = await authenticate(username, password);
    if (user) {
      // Devuelve el token de sesión
      const token = await generateToken(user);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};

const authenticate = async (username: string, password: string) => {
  try {
    const pool = await sql.connect(`Server=localhost,1433;Database=${process.env.DATABASE_NAME};User Id=ndgsoft;Password=${process.env.PASSWORD_DB};trustServerCertificate=true`);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query('SELECT * FROM Usuarios WHERE Usuario = @username AND Clave = @password;');
    // Cierra la conexión
    await pool.close();
    // Devuelve el resultado
    if (result.recordset.length > 0) {
      return result.recordset[0];
    }
  } catch (error) {
    console.error(`Error authenticate: ${error}`);
  }
};

const generateToken = async (user: any) => {
  // Genera un token de sesión
  const token = await jwt.sign(user, process.env.SECRET!, { expiresIn: '12h' });
  return token;
};

export default login;