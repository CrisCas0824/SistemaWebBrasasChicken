export type Role = "encargado" | "administrador" | "dueno" | "cajero" | "mesero" | "cocinero" | "repartidor" | "cliente"
export const roles: Record<Role, string> = {
  encargado: "Gerente",
  administrador: "Administrador",
  dueno: "Dueño",
  cajero: "Cajero",
  mesero: "Mesero",
  cocinero: "Cocina",
  repartidor: "Repartidor",
  cliente: "Cliente",
}
export const categories = [
  "Pollos a la Brasa",
  "Broaster y Mostritos",
  "Carta y Chifa",
  "Gaseosas y Bebidas",
]
export type Product = {
  id: number
  name: string
  description: string
  category: string
  price: number
  stockActual: number
  stockMinimo: number
  available: boolean
  active: boolean
  image: string
}
const imagePath = (name: string) =>
  `${import.meta.env.BASE_URL}images/${name}.jpg`
const chicken = imagePath("chicken")
const fried = imagePath("broaster")
const rice = imagePath("chaufa")
const drink = imagePath("soda")
export const initialProducts: Product[] = [
  [
    "1 Pollo a la Brasa",
    69.9,
    42,
    10,
    0,
    chicken,
    "Pollo doradito, papas familiares y ensalada fresca.",
  ],
  [
    "1/2 Pollo a la Brasa",
    38.9,
    28,
    10,
    0,
    chicken,
    "Medio pollo con papas crocantes y ensalada.",
  ],
  [
    "1/4 de Pollo a la Brasa",
    23.9,
    8,
    15,
    0,
    chicken,
    "Un cuarto de pollo con papas y ensalada.",
  ],
  [
    "Mostrito Clásico",
    28.9,
    24,
    8,
    1,
    rice,
    "1/4 de pollo, arroz chaufa y papas crocantes.",
  ],
  [
    "Pollo Broaster 2 piezas",
    24.9,
    18,
    8,
    1,
    fried,
    "Dos piezas crocantes con papas y cremas.",
  ],
  [
    "Lomo Saltado",
    34.9,
    0,
    5,
    2,
    imagePath("saltado"),
    "Lomo salteado al wok, arroz y papas.",
  ],
  [
    "Arroz Chaufa de Pollo",
    22.9,
    32,
    10,
    2,
    rice,
    "Nuestro clásico chaufa de pollo al wok.",
  ],
  [
    "Tallarín Saltado",
    26.9,
    16,
    6,
    2,
    imagePath("noodles"),
    "Tallarines salteados con pollo y verduras.",
  ],
  [
    "Mollejitas a la Parrilla",
    25.9,
    5,
    6,
    2,
    fried,
    "Mollejitas doradas con papas y ensalada.",
  ],
  [
    "Inca Kola 1.5L",
    12,
    6,
    12,
    3,
    imagePath("yellow-soda"),
    "Bien heladita, perfecta para compartir.",
  ],
  ["Coca-Cola 1.5L", 12, 30, 12, 3, drink, "Gaseosa familiar refrigerada."],
  [
    "Gaseosa Personal 500ml",
    5,
    45,
    15,
    3,
    drink,
    "Tu bebida personal, lista para disfrutar.",
  ],
  [
    "Chicha Morada 1L",
    14,
    20,
    8,
    3,
    imagePath("drink"),
    "Chicha de la casa, fresca y natural.",
  ],
].map((p, i) => ({
  id: i + 1,
  name: p[0] as string,
  price: p[1] as number,
  stockActual: p[2] as number,
  stockMinimo: p[3] as number,
  category: categories[(p[4] as number)],
  image: p[5] as string,
  description: p[6] as string,
  active: true,
  available: true,
}))
export type Line = {
  productId: number
  name: string
  price: number
  qty: number
  note: string
}
export type Order = {
  id: number
  channel: "Salón" | "Delivery Web" | "Recojo"
  table?: number
  tables?: number[]
  waiter?: string
  customer: string
  customerId?: number
  clientOrder?: boolean
  items: Line[]
  status: "Pendiente" | "Preparando" | "Listo" | "Entregado" | "Anulado"
  created: number
  paid: boolean
  bill: boolean
  method: string
  address: string
  reference: string
  phone: string
  rider: string
  delivery: "" | "ASIGNADO" | "EN_RUTA" | "ENTREGADO"
  shipping: number
  settled: boolean
  departure?: number
  arrival?: number
  reason?: string
  branch: string
  tableGroup?: number[]
  served?: boolean
  kitchenNotified?: boolean
}
export const money = (n: number) =>
  `S/ ${(Math.abs(n) < 0.005 ? 0 : n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const total = (o: Order) =>
  Math.round(
    (o.items.reduce((s, l) => s + l.price * l.qty, 0) + o.shipping) * 100,
  ) / 100
export const stockStatus = (p: Product) =>
  p.stockActual === 0
    ? "Agotado"
    : p.stockActual <= p.stockMinimo
      ? "Stock bajo"
      : "Stock disponible"
export const initialOrders: Order[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: 1040 + n,
  channel:
    n === 2 || n === 4 || n === 6
      ? "Delivery Web"
      : n === 3
        ? "Recojo"
        : "Salón",
  table: n === 1 ? 4 : n === 5 ? 8 : undefined,
  customer: [
    "Carlos Ruiz",
    "Lucía Mendoza",
    "Pedro Salas",
    "Ana Torres",
    "Diego Flores",
    "Rosa Medina",
  ][n - 1],
  items: [
    {
      productId: n,
      name: initialProducts[n - 1].name,
      price: initialProducts[n - 1].price,
      qty: n === 5 ? 2 : 1,
      note: n === 2 ? "Papas bien doradas. Sin ají." : "",
    },
  ],
  status:
    n === 2 || n === 5
      ? "Preparando"
      : n === 4
        ? "Listo"
        : n === 6
          ? "Entregado"
          : "Pendiente",
  created: Date.now() - n * 180000,
  paid: n === 6,
  bill: n === 1 || n === 5,
  method: "Efectivo",
  address: "Av. Los Incas 425, La Victoria",
  reference: "Frente al parque, puerta blanca",
  phone: "987541220",
  rider: n === 6 ? "Miguel Torres" : "",
  delivery: n === 6 ? "ENTREGADO" : "",
  shipping: n % 2 === 0 ? 6 : 0,
  settled: false,
  branch: "La Victoria",
}))
export type Employee = {
  id: number
  name: string
  email: string
  role: Role
  branch: string
  shift: string
  active: boolean
  reset?: boolean
}
export const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "Andrea Mendoza",
    email: "andrea@broschicken.pe",
    role: "encargado",
    branch: "La Victoria",
    shift: "Completo",
    active: true,
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    email: "carlos@broschicken.pe",
    role: "mesero",
    branch: "La Victoria",
    shift: "Tarde",
    active: true,
  },
  {
    id: 3,
    name: "Lucía Vega",
    email: "lucia@broschicken.pe",
    role: "cajero",
    branch: "La Victoria",
    shift: "Tarde",
    active: true,
  },
  {
    id: 4,
    name: "José Ramírez",
    email: "jose@broschicken.pe",
    role: "repartidor",
    branch: "La Victoria",
    shift: "Tarde",
    active: true,
  },
  {
    id: 5,
    name: "Miguel Torres",
    email: "miguel@broschicken.pe",
    role: "repartidor",
    branch: "La Victoria",
    shift: "Completo",
    active: true,
  },
  {
    id: 6,
    name: "Luis Sánchez",
    email: "luis@broschicken.pe",
    role: "cocinero",
    branch: "La Victoria",
    shift: "Tarde",
    active: true,
  },
  {
    id: 7,
    name: "Javier Rojas",
    email: "javier@broschicken.pe",
    role: "repartidor",
    branch: "Ferreñafe",
    shift: "Tarde",
    active: true,
  },
  {
    id: 8,
    name: "Raúl Soto",
    email: "raul@broschicken.pe",
    role: "repartidor",
    branch: "Lambayeque",
    shift: "Tarde",
    active: true,
  },
  {
    id: 9,
    name: "Ana López",
    email: "ana@broschicken.pe",
    role: "mesero",
    branch: "Ferreñafe",
    shift: "Mañana",
    active: true,
  },
  {
    id: 10,
    name: "Luis Peña",
    email: "luisp@broschicken.pe",
    role: "mesero",
    branch: "Lambayeque",
    shift: "Tarde",
    active: true,
  },
  {
    id: 11,
    name: "María Vega",
    email: "maria@broschicken.pe",
    role: "cajero",
    branch: "Ferreñafe",
    shift: "Tarde",
    active: true,
  },
  {
    id: 12,
    name: "Rosa Salas",
    email: "rosa@broschicken.pe",
    role: "cajero",
    branch: "Lambayeque",
    shift: "Mañana",
    active: true,
  },
  {
    id: 13,
    name: "Pedro Díaz",
    email: "pedro@broschicken.pe",
    role: "cocinero",
    branch: "Ferreñafe",
    shift: "Tarde",
    active: true,
  },
  {
    id: 14,
    name: "Carlos Mera",
    email: "carlosm@broschicken.pe",
    role: "cocinero",
    branch: "Lambayeque",
    shift: "Tarde",
    active: true,
  },
]
export const initialBranches = [
  {
    id: 1,
    name: "La Victoria",
    address: "Av. Los Incas 840, La Victoria",
    phone: "974521806",
    active: true,
    hours: "12:00–23:30",
    tableCount: 12,
  },
  {
    id: 2,
    name: "Ferreñafe",
    address: "Av. Tacna 615, Ferreñafe",
    phone: "979384120",
    active: true,
    hours: "12:00–23:00",
    tableCount: 10,
  },
  {
    id: 3,
    name: "Lambayeque",
    address: "Av. Ramón Castilla 325, Lambayeque",
    phone: "961708432",
    active: true,
    hours: "11:30–23:00",
    tableCount: 8,
  },
]
export type Movement = {
  id: number
  product: string
  type: "INGRESO_TIENDA" | "AJUSTE_ENCARGADO" | "VENTA"
  qty: number
  note: string
  time: number
  branch: string
}

export type PaymentMethod = "Efectivo" | "Yape" | "Plin" | "Tarjeta"
export interface PaymentRecord {
  id: number
  orderIds: number[]
  branch: string
  method: PaymentMethod
  amount: number
  receipt: string
  document: string
  time: number
  session: number
}
export interface CashSession {
  id: number
  open: boolean
  opening: number
  opened: number
}
export interface CashClosure {
  id: number
  branch: string
  cashier: string
  time: number
  cash: number
  yape: number
  plin: number
  card: number
  opening: number
  counted: number
  difference: number
}
export interface Promotion {
  id: number
  name: string
  productId: number
  discount: number
  start: string
  end: string
  active: boolean
}
export interface AuditEntry {
  id: number
  time: number
  user: string
  action: string
  branch: string
}
export interface DiningTable {
  id: number
  capacity: number
  status: "Libre" | "Ocupada" | "Reservada" | "Cuenta solicitada"
  waiter: string
  guests: number
  total: number
  minutes: number
}

// Shapes used by the extracted demo views retained alongside the current shell.
export interface Stock {
  stockActual: number
  stockMinimo: number
  available: boolean
}
export interface ClientAddress {
  id: number
  alias: string
  address: string
  reference: string
  primary: boolean
}
export interface Payment {
  id: number
  orderId: number
  branch: string
  method: string
  amount: number
  receipt: string
  document: string
  time: number
  voided?: boolean
}
export type Closure = CashClosure
export interface Audit {
  id: number
  time: number
  actor: string
  event: string
  branch: string
}
export interface TableRecord {
  id: number
  capacity: number
  status: DiningTable["status"]
  waiter: string
  guests: number
  group: number[]
}
