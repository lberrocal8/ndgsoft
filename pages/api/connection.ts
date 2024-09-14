import sql from "mssql";

export default async function getConnection() {
  try {
    return await sql.connect(
      `Server=localhost,1433;Database=bd-cursor;UserId=ndgsoft;Password=${process.env.PASSWORD_DB};Encrypt=true;trustedConnection=true`,
    );
  } catch (error) {
    return "Error de conexion a la base de datos";
  }
}
