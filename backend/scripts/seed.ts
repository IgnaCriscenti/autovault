// Carga datos de prueba: los 2 usuarios para la correccion (admin y comun) y un catalogo de vehiculos.
// Uso:  npm run seed            -> crea lo que falte (no duplica)
//       npm run seed -- --reset -> borra los vehiculos y los vuelve a cargar
import "dotenv/config";
import "../src/config/dns.js";
import mongoose from "mongoose";
import { auth } from "../src/lib/auth.js";
import { connectMongoDB, disconnectMongoDB } from "../src/config/db.js";
import Vehicle, { IVehicle } from "../src/models/Vehicle.js";

// Credenciales PUBLICAS de prueba (van en el README para la correccion). No son secretos.
const TEST_USERS = [
  { name: "Admin AutoVault", email: "admin@autovault.com", password: "Admin1234!", role: "admin" },
  { name: "Usuario AutoVault", email: "user@autovault.com", password: "User1234!", role: "user" },
] as const;

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// ownedBy: que usuario de prueba lo publico (por defecto la concesionaria, o sea el admin).
type SeedVehicle = Omit<IVehicle, "available" | "listedAt" | "owner"> & {
  available?: boolean;
  listedAt?: Date;
  ownedBy?: "admin" | "user";
};

const VEHICLES: SeedVehicle[] = [
  { brand: "Toyota", model: "Corolla XEI", year: 2022, price: 25000, mileage: 35000, fuelType: "gasoline", transmission: "automatic", bodyType: "sedan", color: "Gris plata", description: "Unico dueño, service oficial al dia.", listedAt: daysAgo(2) },
  { brand: "Volkswagen", model: "Amarok V6 Highline", year: 2021, price: 38000, mileage: 60000, fuelType: "diesel", transmission: "automatic", bodyType: "pickup", color: "Negro", description: "Motor V6 3.0, 4x4 permanente.", listedAt: daysAgo(5) },
  { brand: "Ford", model: "Ranger XLT", year: 2023, price: 42000, mileage: 15000, fuelType: "diesel", transmission: "manual", bodyType: "pickup", color: "Azul", description: "Nueva generacion, doble cabina.", listedAt: daysAgo(1) },
  { brand: "Peugeot", model: "208 Allure", year: 2023, price: 18500, mileage: 12000, fuelType: "gasoline", transmission: "manual", bodyType: "hatchback", color: "Rojo", description: "Pantalla tactil, camara de retroceso.", listedAt: daysAgo(8) },
  { brand: "Fiat", model: "Cronos Drive 1.3", year: 2022, price: 15000, mileage: 40000, fuelType: "gasoline", transmission: "manual", bodyType: "sedan", color: "Blanco", description: "Ideal primer auto, baul amplio.", listedAt: daysAgo(12) },
  { brand: "Toyota", model: "Hilux SRV", year: 2020, price: 36000, mileage: 85000, fuelType: "diesel", transmission: "automatic", bodyType: "pickup", color: "Blanco", description: "4x4, cubre caja y enganche.", listedAt: daysAgo(15) },
  { brand: "Jeep", model: "Compass Longitude", year: 2022, price: 32000, mileage: 30000, fuelType: "gasoline", transmission: "automatic", bodyType: "suv", color: "Gris oscuro", description: "Techo panoramico, tapizado de cuero.", listedAt: daysAgo(4) },
  { brand: "Chevrolet", model: "Onix LT", year: 2021, price: 14000, mileage: 50000, fuelType: "gasoline", transmission: "manual", bodyType: "hatchback", color: "Negro", description: "Economico y con bajo consumo.", listedAt: daysAgo(20), ownedBy: "user" },
  { brand: "Renault", model: "Kangoo Express", year: 2019, price: 13000, mileage: 110000, fuelType: "diesel", transmission: "manual", bodyType: "van", color: "Blanco", description: "Utilitario con puerta lateral.", listedAt: daysAgo(30), ownedBy: "user" },
  { brand: "Toyota", model: "Corolla Cross Hybrid", year: 2024, price: 34000, mileage: 5000, fuelType: "hybrid", transmission: "automatic", bodyType: "suv", color: "Blanco perla", description: "Hibrido autorecargable, consumo urbano muy bajo.", listedAt: daysAgo(3) },
  { brand: "Volkswagen", model: "Taos Highline", year: 2023, price: 33000, mileage: 20000, fuelType: "gasoline", transmission: "automatic", bodyType: "suv", color: "Azul", description: "Motor 1.4 TSI, asistente de manejo.", listedAt: daysAgo(6) },
  { brand: "BYD", model: "Dolphin", year: 2025, price: 30000, mileage: 0, fuelType: "electric", transmission: "automatic", bodyType: "hatchback", color: "Verde agua", description: "0 km, 100% electrico, autonomia ~400 km.", listedAt: daysAgo(0) },
  { brand: "Ford", model: "Mustang GT", year: 2018, price: 55000, mileage: 40000, fuelType: "gasoline", transmission: "automatic", bodyType: "coupe", color: "Rojo", description: "V8 5.0, un clasico moderno.", listedAt: daysAgo(10) },
  { brand: "Honda", model: "Civic EXS", year: 2017, price: 17000, mileage: 90000, fuelType: "gasoline", transmission: "manual", bodyType: "sedan", color: "Gris", description: "Vendido.", available: false, listedAt: daysAgo(45) },
];

type OwnerIds = Record<"admin" | "user", string>;

// Crea los usuarios de prueba si no existen y devuelve sus ids (para asignar los dueños de los vehiculos).
async function seedUsers(): Promise<OwnerIds> {
  const users = mongoose.connection.collection("user");
  const ids: Partial<OwnerIds> = {};

  for (const { name, email, password, role } of TEST_USERS) {
    if (!(await users.findOne({ email }))) {
      // Se crea por la API de Better Auth para que hashee la contraseña y cree la cuenta "credential".
      await auth.api.signUpEmail({ body: { name, email, password } });
      console.log(`[seed] usuario creado: ${email}`);
    }
    // Todo usuario nuevo nace con rol "user": el admin se promueve directo en la base.
    await users.updateOne({ email }, { $set: { role } });
    const user = await users.findOne({ email });
    ids[role] = user!._id.toString(); // Better Auth expone el _id de Mongo como `user.id`
  }

  return ids as OwnerIds;
}

async function seedVehicles(reset: boolean, owners: OwnerIds): Promise<void> {
  if (reset) {
    const { deletedCount } = await Vehicle.deleteMany({});
    console.log(`[seed] vehiculos borrados: ${deletedCount}`);
  }

  if ((await Vehicle.countDocuments()) === 0) {
    await Vehicle.insertMany(VEHICLES.map(({ ownedBy = "admin", ...v }) => ({ ...v, owner: owners[ownedBy] })));
    console.log(`[seed] vehiculos creados: ${VEHICLES.length}`);
    return;
  }

  console.log("[seed] ya hay vehiculos cargados (usar --reset para recargarlos)");

  // Migracion: los vehiculos creados antes de agregar "owner" pasan a tener dueño.
  for (const { brand, model, ownedBy = "admin" } of VEHICLES) {
    await Vehicle.updateOne({ brand, model, owner: { $exists: false } }, { $set: { owner: owners[ownedBy] } });
  }
  const { modifiedCount } = await Vehicle.updateMany({ owner: { $exists: false } }, { $set: { owner: owners.admin } });
  console.log(`[seed] vehiculos sin dueño asignados (resto al admin): ${modifiedCount}`);
}

async function main(): Promise<void> {
  await connectMongoDB();
  const owners = await seedUsers();
  await seedVehicles(process.argv.includes("--reset"), owners);
  await disconnectMongoDB();
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("[seed] error:", error);
    process.exit(1);
  });
