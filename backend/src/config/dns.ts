// Opcional: algunos equipos (VPN, antivirus, DNS locales) rechazan las consultas SRV que necesita
// una URI "mongodb+srv://". Con DNS_SERVERS=8.8.8.8,1.1.1.1 Node usa esos servidores DNS.
// Se importa antes que cualquier conexion. En Render no hace falta definirla.
import dns from "node:dns";

const servers = process.env.DNS_SERVERS?.split(",").map((s) => s.trim()).filter(Boolean);

if (servers?.length) {
  dns.setServers(servers);
  console.log(`[dns] usando servidores DNS: ${servers.join(", ")}`);
}
