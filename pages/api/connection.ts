import sql from 'mssql';

const configConnection = {
  user: "ndgsoft",
  password: process.env.PASSWORD_DB!,
  server: "localhost",
  database: "bd-cursor",
  options: {
    encrypt: true,
    trustedConnection: true, // Set to true if using Windows Authentication
  }
};

export default async function getConnection() {
  try {
    return await sql.connect(`Server=localhost,1433;Database=bd-cursor;UserId=ndgsoft;Password=${process.env.PASSWORD_DB};Encrypt=true;trustedConnection=true`);
  } catch (error) {
    console.error(`Error de conexion: ${error}`);
  }
}