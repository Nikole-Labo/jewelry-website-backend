import 'dotenv/config';
import sql from 'mssql';

/**
 * SQL Server connection — configure via backend/.env (copy from .env.example).
 * Default TCP port is 1433. For named instances (e.g. .\SQLEXPRESS), omit SQLSERVER_PORT when using dynamic ports.
 */
const server = (process.env.SQLSERVER_HOST || 'localhost').trim();
const instanceNamed = /\\/.test(server);
const portEnv = process.env.SQLSERVER_PORT;
let portOption = {};
if (portEnv !== undefined && portEnv !== '') {
  const p = parseInt(String(portEnv).trim(), 10);
  if (Number.isFinite(p) && p > 0) portOption = { port: p };
} else if (!instanceNamed) {
  portOption = { port: 1433 };
}

const user = (process.env.SQLSERVER_USER || 'sa').trim();
const password = String(process.env.SQLSERVER_PASSWORD ?? '').trim();
const database = (process.env.SQLSERVER_DATABASE || 'JewelryDB').trim();

const config = {
  server,
  ...portOption,
  user,
  password,
  database,
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== 'false',
    connectTimeout: parseInt(process.env.SQLSERVER_CONNECT_TIMEOUT || '30000', 10),
  },
};

function printLoginHelp(loginName) {
  console.error(
    [
      'Login failed (SQL authentication). The server is reachable; SQL Server rejected this user/password.',
      `  • Login name in .env: "${loginName}" (must match a SQL login in SSMS → Security → Logins exactly).`,
      '  • Server authentication mode: in SSMS right-click the server → Properties → Security → select',
      '    "SQL Server and Windows Authentication mode" → OK, then restart the SQL Server service (services.msc).',
      '  • In SSMS → Security → Logins → your login → Properties:',
      '    – General: confirm you are setting the password for this same login (not a Windows login only).',
      '    – Status: Permission to connect = Grant; Login = Enabled.',
      '    – Uncheck "User must change password at next login" (otherwise many apps cannot sign in).',
      '  • User Mapping: tick database JewelryDB (or your DB) and assign a role (e.g. db_owner for dev).',
      '  • If the password has # " or spaces, wrap it in double quotes in .env, e.g. SQLSERVER_PASSWORD="your pass".',
      '  • Test in SSMS with Authentication = "SQL Server Authentication" (not Windows) using the same name and password.',
    ].join('\n')
  );
}

function printSocketHelp() {
  console.error(
    [
      'Could not open a TCP connection to SQL Server. Check:',
      '  • SQL Server service is running (services.msc → SQL Server …).',
      '  • TCP/IP is enabled: Configuration Manager → Protocols for your instance → TCP/IP = Enabled → restart SQL service.',
      '  • IP Addresses → IPAll: TCP Port = 1433 (or your port). If localhost fails, try SQLSERVER_HOST=127.0.0.1',
      '    (some setups disable IPv6 ::1 while IPAll still defines the port).',
      '  • For .\\SQLEXPRESS, set SQLSERVER_HOST=.\\SQLEXPRESS and clear SQLSERVER_PORT or use the dynamic port from IPAll.',
    ].join('\n')
  );
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    const where = [config.server, portOption.port && `port ${portOption.port}`].filter(Boolean).join(' ');
    console.log(`Connected to SQL Server (${where}, database: ${config.database})`);
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Error:', err);
    const code = err?.code || err?.originalError?.code;
    if (code === 'ELOGIN') {
      printLoginHelp(user);
    } else {
      printSocketHelp();
    }
    throw err;
  });

poolPromise.catch(() => {});

export { sql, poolPromise };
