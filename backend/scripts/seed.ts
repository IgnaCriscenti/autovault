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

// Modelo 3D publico de Sketchfab + su miniatura como foto del auto.
const sf = (uid: string, thumbnail: string) => ({
  sketchfabModelId: uid,
  imageUrl: `https://media.sketchfab.com/models/${uid}/thumbnails/${thumbnail}`,
});

const VEHICLES: SeedVehicle[] = [
  { brand: "Toyota", model: "Corolla XEI", year: 2022, price: 25000, mileage: 35000, fuelType: "gasoline", transmission: "automatic", bodyType: "sedan", color: "Gris plata", description: "Único dueño, service oficial al día.", listedAt: daysAgo(2), ...sf("6d7d34ee42734d1ab28a6b1f1c5fc4fc", "78e088c86f2247fc997bff157213c3b1/ee47c3fafeb04ad78bc76828a57d8b6e.jpeg") },
  { brand: "Volkswagen", model: "Amarok V6 Highline", year: 2021, price: 38000, mileage: 60000, fuelType: "diesel", transmission: "automatic", bodyType: "pickup", color: "Azul", description: "Motor V6 3.0, 4x4 permanente.", listedAt: daysAgo(5), ...sf("3272be01e2f946c4bda1c1b5ed73d3a4", "e18cf7a86d604be7a6bef9e731f73f7f/67022c34a5f34f04816fbd82c1706bf2.jpeg") },
  { brand: "Ford", model: "Ranger XLT", year: 2023, price: 42000, mileage: 15000, fuelType: "diesel", transmission: "manual", bodyType: "pickup", color: "Azul", description: "Nueva generación, doble cabina.", listedAt: daysAgo(1), ...sf("e93ac097ee9a46a4a9decca9aceed03c", "310e229f7b724049ad2cde0b9ee54911/29084b77be9547a5a1641b839981333f.jpeg") },
  { brand: "Peugeot", model: "208 Allure", year: 2023, price: 18500, mileage: 12000, fuelType: "gasoline", transmission: "manual", bodyType: "hatchback", color: "Blanco", description: "Pantalla táctil, cámara de retroceso.", listedAt: daysAgo(8), ...sf("c3a458884cf7434fa99b2172c96061a4", "87e6a8a196324e83a01af25e21ff8c8e/5740999b9b2b4ca0b6c7539be7cd318b.jpeg") },
  // Sin modelo 3D a proposito: muestra como se ve un auto que solo tiene ficha.
  { brand: "Fiat", model: "Cronos Drive 1.3", year: 2022, price: 15000, mileage: 40000, fuelType: "gasoline", transmission: "manual", bodyType: "sedan", color: "Blanco", description: "Ideal primer auto, baúl amplio.", listedAt: daysAgo(12) },
  { brand: "Toyota", model: "Hilux SRV", year: 2020, price: 36000, mileage: 85000, fuelType: "diesel", transmission: "automatic", bodyType: "pickup", color: "Rojo", description: "4x4, cubre caja y enganche.", listedAt: daysAgo(15), ...sf("82bd37c5065040098fb0b86e07fcb959", "c13466e5d2d2406a9f39184a61996496/e260c964318340fd9d279619f1f1c613.jpeg") },
  { brand: "Jeep", model: "Compass Longitude", year: 2022, price: 32000, mileage: 30000, fuelType: "gasoline", transmission: "automatic", bodyType: "suv", color: "Verde", description: "Techo panorámico, tapizado de cuero.", listedAt: daysAgo(4), ...sf("e4087350c4d84d8391de09b405c96488", "185f87f993234d08bda1dcdde1fa8d02/eba0cb5969ff47349477900039618634.jpeg") },
  { brand: "Chevrolet", model: "Onix LT", year: 2021, price: 14000, mileage: 50000, fuelType: "gasoline", transmission: "manual", bodyType: "hatchback", color: "Blanco", description: "Económico y con bajo consumo.", listedAt: daysAgo(20), ownedBy: "user", ...sf("bfd798c2695847b28ab681d42abc7056", "0931011ac7f64eb8bfc4f3c32bacb8c9/1a77cd6ce54e487ca315e45aeb68e04f.jpeg") },
  { brand: "Renault", model: "Kangoo Express", year: 2019, price: 13000, mileage: 110000, fuelType: "diesel", transmission: "manual", bodyType: "van", color: "Gris plata", description: "Utilitario con puerta lateral.", listedAt: daysAgo(30), ownedBy: "user", ...sf("d96aa1b41936459a83bb2d023bf90d84", "c9cfef9ff41a4cf882d3dec3dcbc3866/d8ca6de4579c4dab8ffcddf1e2247a5a.jpeg") },
  { brand: "Toyota", model: "Corolla Cross Hybrid", year: 2024, price: 34000, mileage: 5000, fuelType: "hybrid", transmission: "automatic", bodyType: "suv", color: "Gris plata", description: "Híbrido autorrecargable, consumo urbano muy bajo.", listedAt: daysAgo(3), ...sf("6412b1bba68848af88169be2c75e10a6", "eddd564349c346cd8b9ccb8e5939119b/8d68b20f57aa4763b62ce29189b449a4.jpeg") },
  { brand: "Volkswagen", model: "Taos Highline", year: 2023, price: 33000, mileage: 20000, fuelType: "gasoline", transmission: "automatic", bodyType: "suv", color: "Verde", description: "Motor 1.4 TSI, asistente de manejo.", listedAt: daysAgo(6), ...sf("dfabca7a1cfb4f58916ad5c5237cff28", "c48a2ea3edda46578e937cfdc65f34fd/22c1f03655a34de1add57fffbf5ad91f.jpeg") },
  { brand: "BYD", model: "Dolphin", year: 2025, price: 30000, mileage: 0, fuelType: "electric", transmission: "automatic", bodyType: "hatchback", color: "Azul", description: "0 km, 100% eléctrico, autonomía ~400 km.", listedAt: daysAgo(0), ...sf("e8f3cf54c0e545b1b290d7a55ca77fca", "796c79037d194984bd1a32332f00d46d/d186ca56515e4d87981a7eaab4802acd.jpeg") },
  { brand: "Ford", model: "Mustang GT", year: 2018, price: 55000, mileage: 40000, fuelType: "gasoline", transmission: "automatic", bodyType: "coupe", color: "Naranja", description: "V8 5.0, un clásico moderno.", listedAt: daysAgo(10), ...sf("75509e00007b462b9b77cb02759c2478", "5bb44401d2264382a80f65d98a352296/a184821ac6e14882b0e3111ead8817b9.jpeg") },
  { brand: "Honda", model: "Civic EXS", year: 2017, price: 17000, mileage: 90000, fuelType: "gasoline", transmission: "manual", bodyType: "sedan", color: "Rojo", description: "Vendido.", available: false, listedAt: daysAgo(45), ...sf("c7ee1c618e1a44edbcf4be71d49df255", "0c39bfa53c4641c6afb917a07778ef90/00e5711162614eb9bf3f6a65602cefde.jpeg") },
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

  // Migracion: modelo 3D, foto y color a los vehiculos del seed que todavia no tienen modelo 3D.
  let with3d = 0;
  for (const { brand, model, sketchfabModelId, imageUrl, color } of VEHICLES) {
    if (!sketchfabModelId) continue;
    const { modifiedCount: n } = await Vehicle.updateOne(
      { brand, model, sketchfabModelId: { $exists: false } },
      { $set: { sketchfabModelId, imageUrl, color } }
    );
    with3d += n;
  }
  console.log(`[seed] vehiculos con modelo 3D agregado: ${with3d}`);

  // Migracion: las primeras versiones del seed tenian las descripciones sin tildes.
  // Solo se corrigen si la descripcion sigue siendo exactamente la vieja (no pisa ediciones).
  let fixed = 0;
  for (const [model, oldDescription] of Object.entries(OLD_DESCRIPTIONS)) {
    const seed = VEHICLES.find((v) => v.model === model);
    if (!seed?.description) continue;
    const { modifiedCount: n } = await Vehicle.updateOne(
      { model, description: oldDescription },
      { $set: { description: seed.description } }
    );
    fixed += n;
  }
  console.log(`[seed] descripciones corregidas: ${fixed}`);
}

const OLD_DESCRIPTIONS: Record<string, string> = {
  "Corolla XEI": "Unico dueño, service oficial al dia.",
  "Ranger XLT": "Nueva generacion, doble cabina.",
  "208 Allure": "Pantalla tactil, camara de retroceso.",
  "Cronos Drive 1.3": "Ideal primer auto, baul amplio.",
  "Compass Longitude": "Techo panoramico, tapizado de cuero.",
  "Onix LT": "Economico y con bajo consumo.",
  "Corolla Cross Hybrid": "Hibrido autorecargable, consumo urbano muy bajo.",
  Dolphin: "0 km, 100% electrico, autonomia ~400 km.",
  "Mustang GT": "V8 5.0, un clasico moderno.",
};

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
