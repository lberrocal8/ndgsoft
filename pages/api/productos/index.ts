import { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

export default async function getProducts(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado para realizar esta acción" });
  }

  try {
    const pool = await sql.connect(
      `Server=localhost,1433;Database=${process.env.DATABASE_NAME};User Id=ndgsoft;Password=${process.env.PASSWORD_DB};trustServerCertificate=true`,
    );
    const result = await pool
      .request()
      .query(
        "SELECT ROW_NUMBER() OVER (ORDER BY [Descripcion]) AS idProducto, Referencia, Descripcion, VrVenta, Existencia FROM Mercancia;",
      );

    await pool.close();

    if (result.recordset.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No se encontraron productos" });
    }
  } catch (error) {
    return "Error en el servidor al obtener los productos de la base de datos";
  }
}
