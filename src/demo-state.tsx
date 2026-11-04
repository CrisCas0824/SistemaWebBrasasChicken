import {
  createContext,
  useContext,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import {
  categories as initialCategories,
  initialBranches,
  initialEmployees,
  initialOrders,
  initialProducts,
  total,
  type Audit,
  type ClientAddress,
  type Closure,
  type Employee,
  type Line,
  type Movement,
  type Order,
  type Payment,
  type Product,
  type Stock,
  type TableRecord,
} from "./model"

interface Promotion {
  id: number
  title: string
  description: string
  productId: number
  discount: number
  active: boolean
}
interface Series {
  boleta: string
  factura: string
}
interface CashSession {
  open: boolean
  opening: number
  started: number
}
interface OrderInput {
  channel: Order["channel"]
  items: Line[]
  branch: string
  tables?: number[]
  customer?: string
  address?: string
  reference?: string
  phone?: string
  method?: string
  clientOrder?: boolean
}
interface Result {
  ok: boolean
  message: string
  order?: Order
  payment?: Payment
}
interface Profile {
  name: string
  phone: string
  email: string
}
interface DemoData {
  products: Product[]
  setProducts: Dispatch<SetStateAction<Product[]>>
  getProducts: (branch?: string) => Product[]
  priceFor: (product: Product) => number
  setAvailability: (id: number, available: boolean, branch?: string) => void
  categories: string[]
  setCategories: Dispatch<SetStateAction<string[]>>
  employees: Employee[]
  setEmployees: Dispatch<SetStateAction<Employee[]>>
  branches: typeof initialBranches
  setBranches: Dispatch<SetStateAction<typeof initialBranches>>
  branch: string
  setBranch: (branch: string) => void
  movements: Movement[]
  adjust: (
    id: number,
    qty: number,
    type: Movement["type"],
    note: string,
    branch?: string,
  ) => boolean
  orders: Order[]
  updateOrder: (id: number, update: Partial<Order>) => void
  createOrder: (input: OrderInput) => Result
  cancelOrder: (id: number, reason: string) => Result
  tables: Record<string, TableRecord[]>
  setTables: Dispatch<SetStateAction<Record<string, TableRecord[]>>>
  tableOrders: (ids: number[], branch?: string) => Order[]
  moveTables: (ids: number[], target: number) => Result
  requestBill: (ids: number[]) => Result
  tableStatus: (id: number, branch?: string) => TableRecord["status"]
  payments: Payment[]
  closures: Closure[]
  cashSessions: Record<string, CashSession>
  openCash: (amount: number) => Result
  closeCash: (amount: number) => Result
  shiftPayments: (branch?: string) => Payment[]
  charge: (
    id: number,
    method: string,
    receipt: string,
    document: string,
    cash: number,
  ) => Result
  assign: (id: number, rider: string) => Result
  settle: (id: number) => Result
  series: Series
  setSeries: Dispatch<SetStateAction<Series>>
  promotions: Promotion[]
  setPromotions: Dispatch<SetStateAction<Promotion[]>>
  audit: Audit[]
  recordAudit: (event: string, actor?: string, branch?: string) => void
  cart: Line[]
  setCart: Dispatch<SetStateAction<Line[]>>
  addresses: ClientAddress[]
  setAddresses: Dispatch<SetStateAction<ClientAddress[]>>
  lastOrderId: number | null
  setLastOrderId: Dispatch<SetStateAction<number | null>>
  profile: Profile
  setProfile: Dispatch<SetStateAction<Profile>>
}
const Context = createContext<DemoData | null>(null)
function seedOrders(): Order[] {
  const live = initialOrders.map((o) => ({
    ...o,
    clientOrder: o.customer === "Lucía Mendoza",
    tables: o.table ? [o.table] : undefined,
    waiter: o.table ? "Carlos Ruiz" : undefined,
  }))
  const history: Order[] = []
  for (let day = 0; day < 7; day++)
    for (let b = 0; b < 3; b++)
      for (let j = 0; j < 3; j++) {
        const p = initialProducts[(day + b + j) % 9]
        const time = new Date()
        time.setDate(time.getDate() - day)
        time.setHours(
          day === 0
            ? Math.max(0, new Date().getHours() - 3 + j)
            : j === 0
              ? 12
              : 18 + j,
          10,
          0,
          0,
        )
        history.push({
          ...initialOrders[0],
          id: 800 + history.length,
          branch: initialBranches[b].name,
          customer: ["Rosa García", "Luis Rojas", "Ana Flores"][j],
          channel: (["Salón", "Delivery Web", "Recojo"] as const)[j],
          items: [
            {
              productId: p.id,
              name: p.name,
              price: p.price,
              qty: 1 + b + j,
              note: "",
            },
          ],
          status: "Entregado",
          created: time.getTime(),
          paid: true,
          bill: false,
          table: undefined,
          method: ["Efectivo", "Yape", "Tarjeta"][(day + j) % 3],
          shipping: j === 1 ? 5 : 0,
          settled: true,
          delivery: j === 1 ? "ENTREGADO" : "",
        })
      }
  return [...history, ...live]
}
export function DemoProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [employees, setEmployees] = useState<Employee[]>(() => [
    ...initialEmployees.map((e) => ({
      ...e,
      shift: e.shift === "Completo" ? "Tarde" : e.shift,
    })),
    ...initialBranches.slice(1).flatMap((b, i) =>
      (["mesero", "cajero", "cocinero", "repartidor"] as const).map(
        (role, j) => ({
          id: 100 + i * 4 + j,
          name: [
            ["Ana López", "Mario Peña", "Pedro Rojas", "Luis Vásquez"],
            ["Diego Salas", "Rosa Díaz", "Juan Pérez", "Ángel Torres"],
          ][i][j],
          email: `equipo${i}${j}@broschicken.pe`,
          role,
          branch: b.name,
          shift: "Tarde",
          active: true,
        }),
      ),
    ),
  ])
  const [branches, setBranches] = useState(initialBranches)
  const [branch, rawSetBranch] = useState("La Victoria")
  const [orders, setOrders] = useState(seedOrders)
  const [stocks, setStocks] = useState<Record<string, Record<number, Stock>>>(
    () =>
      Object.fromEntries(
        initialBranches.map((b, index) => [
          b.name,
          Object.fromEntries(
            initialProducts.map((p) => [
              p.id,
              {
                stockActual:
                  index === 0
                    ? p.stockActual
                    : Math.max(0, p.stockActual - index * 3),
                stockMinimo: p.stockMinimo,
                available: true,
              },
            ]),
          ),
        ]),
      ),
  )
  const [movements, setMovements] = useState<Movement[]>(
    initialBranches.map((b, i) => ({
      id: i + 1,
      product: "1 Pollo a la Brasa",
      qty: 30,
      type: "INGRESO_TIENDA",
      note: "Apertura del turno",
      time: Date.now() - 3600000,
      branch: b.name,
    })),
  )
  const [tables, setTables] = useState<Record<string, TableRecord[]>>(() =>
    Object.fromEntries(
      initialBranches.map((b) => [
        b.name,
        Array.from({ length: b.tableCount }, (_, i) => ({
          id: i + 1,
          capacity: (i + 1) % 4 === 0 ? 6 : 4,
          status: i === 2 ? "Reservada" : "Libre",
          waiter: i === 2 ? "Ana López" : "—",
          guests: 0,
          group: [],
        })),
      ]),
    ),
  )
  const [series, setSeries] = useState({ boleta: "B001", factura: "F001" })
  const sequence = useRef(1)
  const orderSequence = useRef(1053)
  const [payments, setPayments] = useState<Payment[]>([])
  const [closures, setClosures] = useState<Closure[]>(
    initialBranches.map((b, i) => ({
      id: i + 1,
      time: Date.now() - 86400000,
      cashier: ["Lucía Vega", "Ana López", "Mario Peña"][i],
      branch: b.name,
      cash: 1480 - i * 160,
      yape: 1120,
      plin: 180,
      card: 860,
      opening: 300,
      counted: 1780 - i * 160,
      difference: 0,
    })),
  )
  const [cashSessions, setCashSessions] = useState<Record<string, CashSession>>(
    () =>
      Object.fromEntries(
        initialBranches.map((b) => [
          b.name,
          {
            open: true,
            opening: 300,
            started: new Date().setHours(0, 0, 0, 0),
          },
        ]),
      ),
  )
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      title: "Combo familiar",
      description: "Descuento especial en tu pollo para compartir.",
      productId: 1,
      discount: 10,
      active: false,
    },
  ])
  const [audit, setAudit] = useState<Audit[]>([
    {
      id: 1,
      time: Date.now() - 60000,
      actor: "Sistema demo",
      event: "Servicios iniciados correctamente",
      branch: "Todas las sedes",
    },
  ])
  const [cart, setCart] = useState<Line[]>([])
  const [addresses, setAddresses] = useState<ClientAddress[]>([
    {
      id: 1,
      alias: "Casa",
      address: "Av. Los Incas 425, La Victoria",
      reference: "Frente al parque, puerta blanca",
      primary: true,
    },
    {
      id: 2,
      alias: "Trabajo",
      address: "Calle Grau 245, Ferreñafe",
      reference: "Segundo piso, oficina 4",
      primary: false,
    },
  ])
  const [lastOrderId, setLastOrderId] = useState<number | null>(null)
  const [profile, setProfile] = useState({
    name: "Lucía Mendoza",
    phone: "987541220",
    email: "lucia@email.com",
  })
  const recordAudit = (
    event: string,
    actor = "Andrea Mendoza",
    sede = branch,
  ) => {
    const row = {
      id: Date.now() + Math.random(),
      time: Date.now(),
      actor,
      event,
      branch: sede,
    }
    setAudit((rows) => [row, ...rows])
  }
  const setBranch = (name: string) => {
    if (branches.some((b) => b.name === name)) rawSetBranch(name)
  }
  const getProducts = (sede = branch) =>
    products.map((p) => ({
      ...p,
      ...(stocks[sede]?.[p.id] || {
        stockActual: 0,
        stockMinimo: 5,
        available: true,
      }),
    }))
  const priceFor = (p: Product) => {
    const discount = Math.max(
      0,
      ...promotions
        .filter((c) => c.active && c.productId === p.id)
        .map((c) => c.discount),
    )
    return Math.round(p.price * (1 - discount / 100) * 100) / 100
  }
  const setAvailability = (id: number, available: boolean, sede = branch) => {
    const p = getProducts(sede).find((p) => p.id === id)
    if (!p) return
    setStocks((ss) => ({
      ...ss,
      [sede]: {
        ...ss[sede],
        [id]: {
          stockActual: p.stockActual,
          stockMinimo: p.stockMinimo,
          available,
        },
      },
    }))
  }
  const adjust: DemoData["adjust"] = (id, qty, type, note, sede = branch) => {
    const p = getProducts(sede).find((p) => p.id === id)
    if (
      !p ||
      !Number.isInteger(qty) ||
      !qty ||
      p.stockActual + qty < 0 ||
      !branches.some((b) => b.name === sede)
    )
      return false
    setStocks((ss) => ({
      ...ss,
      [sede]: {
        ...ss[sede],
        [id]: {
          stockActual: (ss[sede]?.[id]?.stockActual || 0) + qty,
          stockMinimo: p.stockMinimo,
          available: p.available,
        },
      },
    }))
    const row = {
      id: Date.now() + Math.random(),
      product: p.name,
      qty,
      type,
      note,
      time: Date.now(),
      branch: sede,
    }
    setMovements((ms) => [row, ...ms])
    return true
  }
  // Availability is scoped to a local; activation and price remain global.
  const updateOrder = (id: number, update: Partial<Order>) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...update } : o)))
    if (update.status === "Entregado" || update.status === "Anulado") {
      const source = orders.find((o) => o.id === id)
      if (source?.channel === "Salón") {
        const ids = source.tables || (source.table ? [source.table] : [])
        setTables((ts) => ({
          ...ts,
          [source.branch]: ts[source.branch].map((t) =>
            ids.includes(t.id) &&
            !orders.some(
              (o) =>
                o.id !== id &&
                o.branch === source.branch &&
                !["Entregado", "Anulado"].includes(o.status) &&
                (o.tables || (o.table ? [o.table] : [])).includes(t.id),
            )
              ? { ...t, status: "Libre", guests: 0, waiter: "—", group: [] }
              : t,
          ),
        }))
      }
    }
    recordAudit(
      `Pedido #${id}: ${update.status || update.delivery || "actualizado"}`,
    )
  }
  const createOrder = (input: OrderInput): Result => {
    const localProducts = getProducts(input.branch)
    if (
      input.channel === "Salón" &&
      (!input.tables?.length ||
        input.tables.some(
          (id) => !tables[input.branch]?.some((t) => t.id === id),
        ))
    ) {
      return {
        ok: false,
        message: "Selecciona una mesa configurada en esta sede.",
      }
    }
    if (!branches.find((b) => b.name === input.branch)?.active)
      return { ok: false, message: "La sede no está operativa." }
    if (
      !input.items.length ||
      input.items.some((l) => {
        const p = localProducts.find((p) => p.id === l.productId)
        return (
          !p ||
          !p.active ||
          !p.available ||
          !Number.isInteger(l.qty) ||
          l.qty < 1 ||
          p.stockActual < l.qty
        )
      })
    )
      return {
        ok: false,
        message: "La disponibilidad cambió. Revisa el stock de tu pedido.",
      }
    const id = orderSequence.current++
    const items = input.items.map((l) => ({
      ...l,
      price: priceFor(localProducts.find((p) => p.id === l.productId)!),
    }))
    const o: Order = {
      id,
      branch: input.branch,
      channel: input.channel,
      tables: input.tables,
      table: input.tables?.[0],
      waiter: input.channel === "Salón" ? "Carlos Ruiz" : undefined,
      customer: input.customer || profile.name,
      items,
      status: "Pendiente",
      created: Date.now(),
      paid:
        input.channel !== "Salón" &&
        (input.method || "Efectivo") !== "Efectivo",
      bill: input.channel === "Recojo",
      method: input.method || "Efectivo",
      address: input.address || "",
      reference: input.reference || "",
      phone: input.phone || profile.phone,
      rider: "",
      delivery: "",
      shipping: input.channel === "Delivery Web" ? 5 : 0,
      settled: false,
    }
    items.forEach((l) =>
      adjust(l.productId, -l.qty, "VENTA", `Pedido #${id}`, input.branch),
    )
    o.clientOrder = input.clientOrder || false
    setOrders((os) => [...os, o])
    if (o.paid) {
      const receipt = `${series.boleta}-${String(sequence.current++).padStart(6, "0")}`
      const p = {
        id: Date.now(),
        orderId: id,
        amount: total(o),
        method: o.method,
        receipt,
        document: "Pago web simulado",
        branch: o.branch,
        time: Date.now(),
      }
      setPayments((ps) => [...ps, p])
    }
    if (input.tables?.length)
      setTables((ts) => ({
        ...ts,
        [input.branch]: ts[input.branch].map((t) =>
          input.tables!.includes(t.id)
            ? {
                ...t,
                status: "Ocupada",
                guests: t.guests || 4,
                waiter: "Carlos Ruiz",
              }
            : t,
        ),
      }))
    recordAudit(
      `Pedido #${id} registrado por ${o.channel}`,
      input.channel === "Salón" ? "Carlos Ruiz" : profile.name,
      o.branch,
    )
    return { ok: true, message: `Pedido #${id} enviado a cocina.`, order: o }
  }
  const tableOrders = (ids: number[], sede = branch) =>
    orders.filter(
      (o) =>
        o.branch === sede &&
        o.channel === "Salón" &&
        !["Entregado", "Anulado"].includes(o.status) &&
        (o.tables || (o.table ? [o.table] : [])).some((id) => ids.includes(id)),
    )
  const tableStatus = (id: number, sede = branch): TableRecord["status"] => {
    const os = tableOrders([id], sede)
    return os.some((o) => o.bill && !o.paid)
      ? "Cuenta solicitada"
      : os.length
        ? "Ocupada"
        : tables[sede]?.find((t) => t.id === id)?.status || "Libre"
  }
  const requestBill = (ids: number[]): Result => {
    const os = tableOrders(ids)
    if (!os.length)
      return {
        ok: false,
        message: "Envía una comanda antes de solicitar la cuenta.",
      }
    setOrders((all) =>
      all.map((o) =>
        os.some((x) => x.id === o.id) ? { ...o, bill: true } : o,
      ),
    )
    return { ok: true, message: "Pre-cuenta enviada a caja." }
  }
  const moveTables = (ids: number[], target: number): Result => {
    if (ids.includes(target) || tableStatus(target) !== "Libre")
      return { ok: false, message: "Selecciona una mesa libre distinta." }
    const os = tableOrders(ids)
    setOrders((all) =>
      all.map((o) =>
        os.some((x) => x.id === o.id)
          ? { ...o, table: target, tables: [target] }
          : o,
      ),
    )
    setTables((ts) => ({
      ...ts,
      [branch]: ts[branch].map((t) =>
        ids.includes(t.id)
          ? { ...t, status: "Libre", guests: 0, waiter: "—", group: [] }
          : t.id === target
            ? {
                ...t,
                status: "Ocupada",
                guests: 4,
                waiter: "Carlos Ruiz",
                group: [],
              }
            : t,
      ),
    }))
    return { ok: true, message: `Atención trasladada a Mesa ${target}.` }
  }
  const cancelOrder = (id: number, reason: string): Result => {
    const o = orders.find((o) => o.id === id)
    if (!o || o.status === "Anulado" || reason.trim().length < 8)
      return {
        ok: false,
        message: "Ingresa un motivo justificado de al menos 8 caracteres.",
      }
    o.items.forEach((l) =>
      adjust(
        l.productId,
        l.qty,
        "AJUSTE_ENCARGADO",
        `Anulación #${id}: ${reason}`,
        o.branch,
      ),
    )
    updateOrder(id, { status: "Anulado", reason, delivery: "" })
    setPayments((ps) =>
      ps.map((p) => (p.orderId === id ? { ...p, voided: true } : p)),
    )
    recordAudit(`Anulación autorizada #${id}: ${reason}`, "Gerente", o.branch)
    return {
      ok: true,
      message: "Pedido anulado y stock restituido en su sede.",
    }
  }
  const shiftPayments = (sede = branch) =>
    payments.filter(
      (p) =>
        !p.voided && p.branch === sede && p.time >= cashSessions[sede].started,
    )
  const openCash = (amount: number): Result => {
    if (cashSessions[branch].open || !Number.isFinite(amount) || amount < 0)
      return {
        ok: false,
        message: "La caja ya está abierta o el fondo es inválido.",
      }
    setCashSessions((cs) => ({
      ...cs,
      [branch]: { open: true, opening: amount, started: Date.now() },
    }))
    recordAudit(`Apertura de caja: S/ ${amount.toFixed(2)}`, "Lucía Vega")
    return { ok: true, message: "Caja abierta correctamente." }
  }
  const closeCash = (amount: number): Result => {
    if (!cashSessions[branch].open || !Number.isFinite(amount) || amount < 0)
      return {
        ok: false,
        message: "La caja está cerrada o el conteo es inválido.",
      }
    const ps = shiftPayments()
    const sum = (m: string) =>
      ps.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0)
    const session = cashSessions[branch]
    const c: Closure = {
      id: Date.now(),
      time: Date.now(),
      cashier: "Lucía Vega",
      branch,
      cash: sum("Efectivo"),
      yape: sum("Yape"),
      plin: sum("Plin"),
      card: sum("Tarjeta"),
      opening: session.opening,
      counted: amount,
      difference: amount - session.opening - sum("Efectivo"),
    }
    setClosures((cs) => [c, ...cs])
    setCashSessions((cs) => ({
      ...cs,
      [branch]: { ...cs[branch], open: false },
    }))
    recordAudit(
      `Cierre de caja. Diferencia: S/ ${c.difference.toFixed(2)}`,
      "Lucía Vega",
    )
    return {
      ok: true,
      message: `Turno cerrado. Diferencia: S/ ${c.difference.toFixed(2)}.`,
    }
  }
  const charge: DemoData["charge"] = (
    id,
    method,
    receiptType,
    document,
    cash,
  ) => {
    const o = orders.find((o) => o.id === id && o.branch === branch)
    if (!cashSessions[branch].open)
      return { ok: false, message: "Abre la caja antes de cobrar." }
    if (!o || o.paid || o.status === "Anulado")
      return { ok: false, message: "El pedido no está disponible para cobro." }
    if (
      receiptType === "Factura"
        ? !/^\d{11}$/.test(document)
        : document !== "" && !/^\d{8}$/.test(document)
    )
      return {
        ok: false,
        message:
          receiptType === "Factura"
            ? "Ingresa un RUC de 11 dígitos."
            : "El DNI debe tener 8 dígitos.",
      }
    if (method === "Efectivo" && (!Number.isFinite(cash) || cash < total(o)))
      return { ok: false, message: "El efectivo recibido no cubre el total." }
    const receipt = `${
      receiptType === "Factura" ? series.factura : series.boleta
    }-${String(sequence.current++).padStart(6, "0")}`
    const p: Payment = {
      id: Date.now(),
      orderId: id,
      amount: total(o),
      method,
      receipt,
      document,
      branch,
      time: Date.now(),
    }
    setPayments((ps) => [...ps, p])
    updateOrder(id, {
      paid: true,
      method,
      status:
        (o.channel === "Salón" && o.served) ||
        (o.channel === "Recojo" && o.status === "Listo")
          ? "Entregado"
          : o.status,
    })
    recordAudit(`Cobro #${id}: ${receipt}`, "Lucía Vega")
    return {
      ok: true,
      message: `Pago registrado. Comprobante demo ${receipt}.`,
      payment: p,
    }
  }
  const assign = (id: number, rider: string): Result => {
    const o = orders.find((o) => o.id === id)
    const e = employees.find(
      (e) =>
        e.name === rider &&
        e.role === "repartidor" &&
        e.active &&
        e.branch === o?.branch,
    )
    if (
      !o ||
      o.status !== "Listo" ||
      o.delivery ||
      !e ||
      orders.some(
        (x) =>
          x.rider === rider &&
          x.delivery &&
          x.delivery !== "ENTREGADO" &&
          x.status !== "Anulado",
      )
    )
      return {
        ok: false,
        message: "Selecciona un repartidor libre de esta sede.",
      }
    updateOrder(id, { rider, delivery: "ASIGNADO" })
    return { ok: true, message: `Pedido #${id} asignado a ${rider}.` }
  }
  const settle = (id: number): Result => {
    const o = orders.find((o) => o.id === id)
    if (
      !o ||
      !cashSessions[branch].open ||
      o.branch !== branch ||
      o.delivery !== "ENTREGADO" ||
      o.method !== "Efectivo" ||
      o.settled
    )
      return {
        ok: false,
        message: "Este cobro no puede liquidarse o la caja está cerrada.",
      }
    setOrders((os) =>
      os.map((x) => (x.id === id ? { ...x, paid: true, settled: true } : x)),
    )
    const p = {
      id: Date.now(),
      orderId: id,
      amount: total(o),
      method: "Efectivo",
      receipt: `LIQ-${id}`,
      document: o.rider,
      branch,
      time: Date.now(),
    }
    setPayments((ps) => [...ps, p])
    recordAudit(`Liquidación de ${o.rider}, pedido #${id}`, "Lucía Vega")
    return { ok: true, message: "Efectivo liquidado e ingresado a la caja." }
  }
  return (
    <Context.Provider
      value={{
        products,
        setProducts,
        getProducts,
        priceFor,
        setAvailability,
        categories,
        setCategories,
        employees,
        setEmployees,
        branches,
        setBranches,
        branch,
        setBranch,
        movements,
        adjust,
        orders,
        updateOrder,
        createOrder,
        cancelOrder,
        tables,
        setTables,
        tableOrders,
        tableStatus,
        moveTables,
        requestBill,
        payments,
        closures,
        cashSessions,
        openCash,
        closeCash,
        shiftPayments,
        charge,
        assign,
        settle,
        series,
        setSeries,
        promotions,
        setPromotions,
        audit,
        recordAudit,
        cart,
        setCart,
        addresses,
        setAddresses,
        lastOrderId,
        setLastOrderId,
        profile,
        setProfile,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useDemoData() {
  const value = useContext(Context)
  if (!value) throw new Error("DemoProvider is required")
  return value
}
