import { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

const Facturas = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado para realizar esta acción" });
  }

  if (req.method === "POST") {
    const {
      ResoFacturas,
      FACTURA,
      Item,
      Referencia,
      DESCRIPCION,
      Observacion,
      CANTIDAD,
      VALUNITARIO,
      Descuento,
      VrFinal,
      SUBTOTAL,
      IVA,
      TOTAL,
      FECHA,
      CLIENTE,
      Usuario,
      Mesa,
      CodEMpleado,
      Nombre,
      Propina,
    } = req.body;
    const nuevaFactura = await agregarFacturas(
      ResoFacturas,
      FACTURA,
      Item,
      Referencia,
      DESCRIPCION,
      Observacion,
      CANTIDAD,
      VALUNITARIO,
      Descuento,
      VrFinal,
      SUBTOTAL,
      IVA,
      TOTAL,
      FECHA,
      CLIENTE,
      Usuario,
      Mesa,
      CodEMpleado,
      Nombre,
      Propina,
    );

    if (nuevaFactura) {
      return res
        .status(201)
        .json({ message: "Factura agregada correctamente" });
    } else {
      return res.status(500).json({ message: "Error al agregar factura" });
    }
  }
};

async function agregarFacturas(
  ResoFacturas: string,
  FACTURA: string,
  Item: number,
  Referencia: string,
  DESCRIPCION: string,
  Observacion: string,
  CANTIDAD: number,
  VALUNITARIO: number,
  Descuento: number,
  VrFinal: number,
  SUBTOTAL: number,
  IVA: number,
  TOTAL: number,
  FECHA: Date,
  CLIENTE: string,
  Usuario: string,
  Mesa: string,
  CodEMpleado: string,
  Nombre: string,
  Propina: number,
) {
  try {
    const pool = await sql.connect(
      `Server=localhost,1433;Database=${process.env.DATABASE_NAME};User Id=ndgsoft;Password=${process.env.PASSWORD_DB};trustServerCertificate=true`,
    );
    const result = await pool
      .request()
      .input("ResoFacturas", sql.NVarChar, ResoFacturas)
      .input("FACTURA", sql.NVarChar, FACTURA)
      .input("Item", sql.Int, Item)
      .input("Referencia", sql.NVarChar, Referencia)
      .input("DESCRIPCION", sql.NVarChar, DESCRIPCION)
      .input("Observacion", sql.NVarChar, Observacion)
      .input("CANTIDAD", sql.Decimal, CANTIDAD)
      .input("VALUNITARIO", sql.Decimal, VALUNITARIO)
      .input("VrFinal", sql.Decimal, VrFinal)
      .input("SUBTOTAL", sql.Decimal, SUBTOTAL)
      .input("IVA", sql.Decimal, IVA)
      .input("TOTAL", sql.Decimal, TOTAL)
      .input("FECHA", sql.Date, FECHA)
      .input("CLIENTE", sql.NVarChar, CLIENTE)
      .input("Usuario", sql.NVarChar, Usuario)
      .input("Mesa", sql.Int, Mesa)
      .input("CodEMpleado", sql.NVarChar, CodEMpleado)
      .input("Nombre", sql.NVarChar, Nombre)
      .input("Propina", sql.Decimal, Propina)
      .query(
        "INSERT INTO VentasCargadas (ResoFacturas, FACTURA, Item, Referencia, DESCRIPCION, Observacion, CANTIDAD, VALUNITARIO, Descuento, VrFinal, SUBTOTAL, IVA, TOTAL, FECHA, CLIENTE, Usuario, Mesa, CodEMpleado, Nombre, Propina) VALUES (@ResoFacturas, @FACTURA, @Item, @Referencia, @DESCRIPCION, @Observacion, @CANTIDAD, @VALUNITARIO, @Descuento, @VrFinal, @SUBTOTAL, @IVA, @TOTAL, @FECHA, @CLIENTE, @Usuario, @Mesa, @CodEMpleado, @Nombre, @Propina);",
      );

    await pool.close();
    if (result.recordset.length > 0) {
      return result.recordset[0];
    }
  } catch (error) {
    return "Error en el servidor al intentar registrar la factura";
  }
}

export default Facturas;
