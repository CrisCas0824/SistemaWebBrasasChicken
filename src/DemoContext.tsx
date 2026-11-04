import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  categories as initialCategories,
  initialBranches,
  initialEmployees,
  initialOrders,
  initialProducts,
  total,
  type AuditEntry,
  type CashClosure,
  type CashSession,
  type DiningTable,
  type Line,
  type Movement,
  type Order,
  type PaymentMethod,
  type PaymentRecord,
  type Promotion,
} from "./model"

export interface PlaceOrderInput {
  branch: string
  channel: Order["channel"]
  items: Line[]
  customer: string
  table?: number
  tableGroup?: number[]
  address?: string
  reference?: string
  phone?: string
  method?: PaymentMethod
  client?: boolean
}
export interface AddressItem {
  id: number
  alias: string
  address: string
  reference: string
  primary: boolean
}
const day = 86400000
const today = () => new Date().toLocaleDateString("en-CA")
const seedOrders = () =>
  initialBranches
    .flatMap((b, bi) =>
      initialOrders.map((o) => ({
        ...o,
        id: o.id + bi * 100,
        branch: b.name,
        table: o.table === 4 ? 5 : o.table,
        customerId: o.customer === "Lucía Mendoza" ? 1 : undefined,
        address: bi === 0 ? o.address : `${b.address} · Puerta principal`,
        paid: false,
        rider: bi === 0 ? o.rider : "",
        delivery: bi === 0 ? o.delivery : "",
        status: bi > 0 && o.status === "Entregado" ? "Listo" : o.status,
      })),
    )
    .concat([
      {
        ...initialOrders[0],
        id: 984,
        customerId: 1,
        table: undefined,
        channel: "Delivery Web",
        customer: "Lucía Mendoza",
        branch: "Ferreñafe",
        status: "Entregado",
        paid: true,
        settled: true,
        delivery: "ENTREGADO",
        rider: "Javier Rojas",
        created: Date.now() - 8 * day,
        items: [
          {
            productId: 1,
            name: initialProducts[0].name,
            price: initialProducts[0].price,
            qty: 1,
            note: "Cremas aparte",
          },
          {
            productId: 4,
            name: initialProducts[3].name,
            price: initialProducts[3].price,
            qty: 1,
            note: "",
          },
        ],
        shipping: 5,
      },
    ])
function seedPayments(): PaymentRecord[] {
  return Array.from({ length: 22 }, (_, di) =>
    initialBranches.flatMap((b, bi) =>
      Array.from({ length: 8 }, (_, i) => ({
        id: -(di * 100 + bi * 10 + i + 1),
        orderIds: [],
        branch: b.name,
        method: (["Efectivo", "Yape", "Plin", "Tarjeta"] as PaymentMethod[])[
          i % 4
        ],
        amount:
          Math.round((120 + (bi + 1) * 27 + ((i * 61 + di * 17) % 360)) * 100) /
          100,
        receipt: `B001-H${di}${bi}${i}`,
        document: "Histórico demo",
        time:
          new Date(new Date().setHours(12 + i, 15, 0, 0)).getTime() - di * day,
        session: 0,
      })),
    ),
  ).flat()
}
function useDemoState() {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [employees, setEmployees] = useState(
    initialEmployees.map((e) => ({
      ...e,
      shift: e.shift === "Completo" ? "Tarde" : e.shift,
    })),
  )
  const [branches, setBranches] = useState(initialBranches)
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [activeBranch, setActiveBranch] = useState("La Victoria")
  const [stocks, setStocks] = useState<Record<string, Record<number, number>>>(
    () =>
      Object.fromEntries(
        initialBranches.map((b, bi) => [
          b.name,
          Object.fromEntries(
            initialProducts.map((p) => [
              p.id,
              p.stockActual === 0 ? 0 : Math.max(1, p.stockActual - bi * 3),
            ]),
          ),
        ]),
      ),
  )
  const [availability, setAvailability] =
    useState<Record<string, Record<number, boolean>>>({})
  const [movements, setMovements] = useState<Movement[]>(
    initialBranches.map((b, i) => ({
      id: i + 1,
      product: "1 Pollo a la Brasa",
      qty: 30,
      type: "INGRESO_TIENDA",
      note: "Apertura del turno en tienda",
      time: Date.now() - 3600000,
      branch: b.name,
    })),
  )
  const [series, setSeries] = useState({ boleta: "B001", factura: "F001" })
  const [payments, setPayments] = useState<PaymentRecord[]>(seedPayments)
  const [cashSessions, setCashSessions] = useState<Record<string, CashSession>>(
    () =>
      Object.fromEntries(
        initialBranches.map((b, i) => [
          b.name,
          { id: i + 1, open: true, opening: 300, opened: Date.now() - 3600000 },
        ]),
      ),
  )
  const [closures, setClosures] = useState<CashClosure[]>(
    initialBranches.map((b, i) => ({
      id: i + 1,
      branch: b.name,
      cashier: "Lucía Vega",
      time: Date.now() - day,
      cash: 1480 - i * 100,
      yape: 850,
      plin: 360,
      card: 720,
      opening: 300,
      counted: 1780 - i * 100,
      difference: 0,
    })),
  )
  const [audit, setAudit] = useState<AuditEntry[]>([
    {
      id: 1,
      time: Date.now(),
      user: "Sistema demo",
      action: "Servicios operativos · Sesión iniciada",
      branch: "La Victoria",
    },
  ])
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      name: "Martes de Mostrito",
      productId: 4,
      discount: 10,
      start: today(),
      end: "2027-12-31",
      active: false,
    },
  ])
  const [tableMeta, setTableMeta] =
    useState<Record<string, Record<number, Partial<DiningTable>>>>(() =>
      Object.fromEntries(
        initialBranches.map((b) => [
          b.name,
          { 3: { status: "Reservada", waiter: "Ana", guests: 4 } },
        ]),
      ),
    )
  const [profile, setProfile] = useState({
    name: "Lucía Mendoza",
    surname: "Salazar",
    dni: "70418522",
    phone: "987541220",
    email: "lucia.mendoza@email.com",
  })
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 1,
      alias: "Casa",
      address: "Av. Los Incas 425, La Victoria",
      reference: "Frente al parque principal, puerta negra",
      primary: true,
    },
    {
      id: 2,
      alias: "Trabajo",
      address: "Calle Grau 245, Ferreñafe",
      reference: "Segundo piso, oficina 4",
      primary: false,
    },
    {
      id: 3,
      alias: "Familia",
      address: "Jr. Bolognesi 318, Lambayeque",
      reference: "A media cuadra del mercado",
      primary: false,
    },
  ])
  const [clientCart, setClientCart] = useState<Line[]>([
    {
      productId: 2,
      name: initialProducts[1].name,
      price: initialProducts[1].price,
      qty: 1,
      note: "",
    },
  ])
  const sequence = useRef(2000)
  const receiptSequence = useRef(0)
  const eventSequence = useRef(Date.now())
  const nextId = () => ++eventSequence.current
  const log = (
    action: string,
    branch = activeBranch,
    user = "Andrea Mendoza",
  ) => {
    const entry = { id: nextId(), time: Date.now(), action, branch, user }
    setAudit((as) => [entry, ...as])
  }
  const managerBranch =
    employees.find((e) => e.role === "encargado" && e.active)?.branch ||
    "La Victoria"
  const productsFor = (branch: string) =>
    products.map((p) => ({
      ...p,
      stockActual: stocks[branch]?.[p.id] ?? 0,
      available: availability[branch]?.[p.id] ?? p.available,
    }))
  const activePromotion = (id: number) =>
    promotions.find(
      (p) =>
        p.productId === id &&
        p.active &&
        p.start <= today() &&
        p.end >= today(),
    )
  const priceFor = (id: number) => {
    const p = products.find((p) => p.id === id)
    const promo = activePromotion(id)
    return (
      Math.round((p?.price || 0) * (1 - (promo?.discount || 0) / 100) * 100) /
      100
    )
  }
  const adjust = (
    id: number,
    qty: number,
    type: Movement["type"],
    note: string,
    branch = activeBranch,
  ) => {
    const p = products.find((p) => p.id === id)
    const current = stocks[branch]?.[id] ?? 0
    if (
      !p ||
      !Number.isInteger(qty) ||
      !qty ||
      current + qty < 0 ||
      (type === "INGRESO_TIENDA" && qty < 0)
    )
      return false
    setStocks((ss) => ({
      ...ss,
      [branch]: { ...ss[branch], [id]: (ss[branch]?.[id] ?? 0) + qty },
    }))
    const movement = {
      id: nextId(),
      product: p.name,
      qty,
      type,
      note,
      time: Date.now(),
      branch,
    }
    setMovements((ms) => [movement, ...ms])
    log(`${type}: ${p.name} (${qty > 0 ? "+" : ""}${qty}) · ${note}`, branch)
    return true
  }
  const setAvailable = (
    id: number,
    available: boolean,
    branch = activeBranch,
  ) =>
    setAvailability((as) => ({
      ...as,
      [branch]: { ...as[branch], [id]: available },
    }))
  const newReceipt = (kind: "Boleta" | "Factura") =>
    `${
      kind === "Boleta" ? series.boleta : series.factura
    }-${String(++receiptSequence.current).padStart(6, "0")}`
  const placeOrder = (input: PlaceOrderInput): number | null => {
    const b = branches.find((b) => b.name === input.branch && b.active)
    if (
      !b ||
      !input.items.length ||
      input.items.some((l) => !Number.isInteger(l.qty) || l.qty <= 0)
    )
      return null
    if (
      input.channel === "Salón" &&
      (!input.table ||
        input.table < 1 ||
        input.table > b.tableCount ||
        input.tableGroup?.some((id) => id < 1 || id > b.tableCount))
    )
      return null
    const needed = input.items.reduce<Record<number, number>>(
      (s, l) => ({ ...s, [l.productId]: (s[l.productId] || 0) + l.qty }),
      {},
    )
    const ps = productsFor(input.branch)
    if (
      Object.entries(needed).some(([id, qty]) => {
        const p = ps.find((p) => p.id === Number(id))
        return (
          !p ||
          !p.active ||
          !p.available ||
          !Number.isInteger(qty) ||
          qty <= 0 ||
          p.stockActual < qty
        )
      })
    )
      return null
    const id = ++sequence.current
    const items = input.items.map((l) => ({
      ...l,
      price: priceFor(l.productId),
      name: products.find((p) => p.id === l.productId)!.name,
    }))
    const paid =
      (input.client || input.channel !== "Salón") &&
      (input.method || "Efectivo") !== "Efectivo"
    const o: Order = {
      id,
      branch: input.branch,
      channel: input.channel,
      customer: input.customer,
      customerId: input.client ? 1 : undefined,
      table: input.table,
      tableGroup: input.tableGroup,
      items,
      created: Date.now(),
      status: "Pendiente",
      bill: input.channel === "Recojo",
      paid,
      method: input.method || "Efectivo",
      address: input.address || "",
      reference: input.reference || "",
      phone: input.phone || "",
      rider: "",
      delivery: "",
      shipping: input.channel === "Delivery Web" ? 5 : 0,
      settled: false,
    }
    setOrders((os) => [...os, o])
    setStocks((ss) => ({
      ...ss,
      [input.branch]: {
        ...ss[input.branch],
        ...Object.fromEntries(
          Object.entries(needed).map(([key, qty]) => [
            key,
            (ss[input.branch]?.[Number(key)] || 0) - qty,
          ]),
        ),
      },
    }))
    const ms: Movement[] = items.map((l) => ({
      id: nextId(),
      product: l.name,
      qty: -l.qty,
      type: "VENTA",
      note: `Pedido #${id}`,
      time: Date.now(),
      branch: input.branch,
    }))
    setMovements((old) => [...ms, ...old])
    if (paid) {
      const p: PaymentRecord = {
        id: nextId(),
        orderIds: [id],
        branch: input.branch,
        method: input.method!,
        amount: total(o),
        receipt: newReceipt("Boleta"),
        document: "Pago web demo",
        time: Date.now(),
        session: cashSessions[input.branch]?.open
          ? cashSessions[input.branch].id
          : 0,
      }
      setPayments((ps) => [...ps, p])
    }
    log(
      `Pedido #${id} registrado · ${input.channel}`,
      input.branch,
      input.customer,
    )
    return id
  }
  const updateOrder = (id: number, patch: Partial<Order>) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  const advanceOrder = (id: number) => {
    const o = orders.find((o) => o.id === id)
    if (!o || o.status === "Anulado") return
    const status =
      o.status === "Pendiente"
        ? "Preparando"
        : o.status === "Preparando"
          ? "Listo"
          : o.status
    updateOrder(id, { status })
    log(`Pedido #${id}: ${status}`, o.branch, "Cocina")
  }
  const cancelOrder = (id: number, reason: string) => {
    const o = orders.find((o) => o.id === id)
    if (
      !o ||
      o.status === "Anulado" ||
      reason.trim().length < 8 ||
      o.delivery === "ENTREGADO"
    )
      return false
    updateOrder(id, { status: "Anulado", reason: reason.trim(), delivery: "" })
    setStocks((ss) => ({
      ...ss,
      [o.branch]: {
        ...ss[o.branch],
        ...Object.fromEntries(
          o.items.map((l) => [
            l.productId,
            (ss[o.branch]?.[l.productId] || 0) + l.qty,
          ]),
        ),
      },
    }))
    const ms: Movement[] = o.items.map((l) => ({
      id: nextId(),
      product: l.name,
      qty: l.qty,
      type: "AJUSTE_ENCARGADO",
      note: `Anulación #${id}: ${reason}`,
      time: Date.now(),
      branch: o.branch,
    }))
    setMovements((old) => [...ms, ...old])
    if (o.paid) {
      const refund: PaymentRecord = {
        id: nextId(),
        orderIds: [id],
        branch: o.branch,
        method: o.method as PaymentMethod,
        amount: -total(o),
        receipt: `ANULACIÓN-${id}`,
        document: reason,
        time: Date.now(),
        session: cashSessions[o.branch]?.open ? cashSessions[o.branch].id : 0,
      }
      setPayments((ps) => [...ps, refund])
    }
    log(`Anulación autorizada #${id}: ${reason}`, o.branch, "Gerente")
    return true
  }
  const sessionPayments = (branch: string) =>
    payments.filter(
      (p) => p.branch === branch && p.session === cashSessions[branch]?.id,
    )
  const cashTotals = (branch: string) => {
    const ps = sessionPayments(branch)
    const sum = (method: PaymentMethod) =>
      ps.filter((p) => p.method === method).reduce((s, p) => s + p.amount, 0)
    return {
      cash: sum("Efectivo"),
      yape: sum("Yape"),
      plin: sum("Plin"),
      card: sum("Tarjeta"),
      total: ps.reduce((s, p) => s + p.amount, 0),
    }
  }
  const openCash = (branch: string, opening: number) => {
    if (cashSessions[branch]?.open || !Number.isFinite(opening) || opening < 0)
      return false
    const id = nextId()
    setCashSessions((cs) => ({
      ...cs,
      [branch]: { id, opening, open: true, opened: Date.now() },
    }))
    log("Apertura de caja", branch, "Cajero")
    return true
  }
  const closeCash = (branch: string, counted: number) => {
    const session = cashSessions[branch]
    if (!session?.open || !Number.isFinite(counted) || counted < 0) return null
    const sums = cashTotals(branch)
    const c: CashClosure = {
      id: nextId(),
      branch,
      cashier: "Lucía Vega",
      time: Date.now(),
      ...sums,
      opening: session.opening,
      counted,
      difference:
        Math.round((counted - session.opening - sums.cash) * 100) / 100 || 0,
    }
    setClosures((cs) => [c, ...cs])
    setCashSessions((cs) => ({
      ...cs,
      [branch]: { ...cs[branch], open: false },
    }))
    log(`Cierre de caja · Diferencia ${c.difference}`, branch, "Cajero")
    return c
  }
  const payOrders = (
    ids: number[],
    method: PaymentMethod,
    receiptType: "Boleta" | "Factura",
    document: string,
    received: number,
  ) => {
    const os = orders.filter(
      (o) => ids.includes(o.id) && !o.paid && o.status !== "Anulado",
    )
    if (
      !os.length ||
      os.some((o) => o.branch !== os[0].branch) ||
      !cashSessions[os[0].branch]?.open
    )
      return null
    if (
      (receiptType === "Factura" && !/^\d{11}$/.test(document)) ||
      (receiptType === "Boleta" && document && !/^\d{8}$/.test(document))
    )
      return null
    const amount = Math.round(os.reduce((s, o) => s + total(o), 0) * 100) / 100
    if (
      method === "Efectivo" &&
      (!Number.isFinite(received) || received < amount)
    )
      return null
    const paidIds = os.map((o) => o.id)
    const p: PaymentRecord = {
      id: nextId(),
      orderIds: paidIds,
      branch: os[0].branch,
      method,
      amount,
      receipt: newReceipt(receiptType),
      document,
      time: Date.now(),
      session: cashSessions[os[0].branch].id,
    }
    setPayments((ps) => [...ps, p])
    setOrders((old) =>
      old.map((o) =>
        paidIds.includes(o.id)
          ? {
              ...o,
              paid: true,
              method,
              status:
                (o.channel === "Recojo" || o.served) && o.status === "Listo"
                  ? "Entregado"
                  : o.status,
            }
          : o,
      ),
    )
    const tableIds = [
      ...new Set(os.flatMap((o) => o.tableGroup || (o.table ? [o.table] : []))),
    ]
    const clearIds = tableIds.filter(
      (id) =>
        !orders.some(
          (o) =>
            o.branch === p.branch &&
            !o.paid &&
            !paidIds.includes(o.id) &&
            o.status !== "Anulado" &&
            (o.table === id || o.tableGroup?.includes(id)),
        ),
    )
    setTableState(p.branch, clearIds, {
      status: "Libre",
      guests: 0,
      waiter: "—",
    })
    log(`Cobro ${p.receipt} · ${method}`, p.branch, "Cajero")
    return p
  }
  const freeRiders = (branch: string) =>
    employees.filter(
      (e) =>
        e.role === "repartidor" &&
        e.active &&
        e.branch === branch &&
        !orders.some(
          (o) =>
            o.rider === e.name &&
            o.status !== "Anulado" &&
            ["ASIGNADO", "EN_RUTA"].includes(o.delivery),
        ),
    )
  const assignRider = (id: number, rider: string) => {
    const o = orders.find((o) => o.id === id)
    if (
      !o ||
      o.status !== "Listo" ||
      o.delivery ||
      !freeRiders(o.branch).some((r) => r.name === rider)
    )
      return false
    updateOrder(id, { rider, delivery: "ASIGNADO" })
    log(`Pedido #${id} asignado a ${rider}`, o.branch, "Cajero")
    return true
  }
  const advanceDelivery = (id: number) => {
    const o = orders.find((o) => o.id === id)
    if (!o || o.status === "Anulado") return
    if (o.delivery === "ASIGNADO")
      updateOrder(id, { delivery: "EN_RUTA", departure: Date.now() })
    if (o.delivery === "EN_RUTA")
      updateOrder(id, {
        delivery: "ENTREGADO",
        status: "Entregado",
        arrival: Date.now(),
      })
    log(
      `Pedido #${id}: ${o.delivery === "ASIGNADO" ? "En camino" : "Entregado"}`,
      o.branch,
      o.rider,
    )
  }
  const settleDelivery = (id: number) => {
    const o = orders.find((o) => o.id === id)
    if (
      !o ||
      o.delivery !== "ENTREGADO" ||
      o.settled ||
      o.method !== "Efectivo" ||
      !cashSessions[o.branch]?.open
    )
      return false
    const p: PaymentRecord = {
      id: nextId(),
      orderIds: [id],
      branch: o.branch,
      method: "Efectivo",
      amount: total(o),
      receipt: newReceipt("Boleta"),
      document: `Liquidación · ${o.rider}`,
      time: Date.now(),
      session: cashSessions[o.branch].id,
    }
    setPayments((ps) => [...ps, p])
    updateOrder(id, { settled: true, paid: true })
    log(`Liquidación delivery #${id}`, o.branch, "Cajero")
    return true
  }
  const tablesFor = (branch: string): DiningTable[] =>
    Array.from(
      { length: branches.find((b) => b.name === branch)?.tableCount || 0 },
      (_, i) => {
        const id = i + 1
        const meta = tableMeta[branch]?.[id]
        const os = orders.filter(
          (o) =>
            o.branch === branch &&
            (!o.paid || (o.channel === "Salón" && !o.served)) &&
            o.status !== "Anulado" &&
            (o.table === id || o.tableGroup?.includes(id)),
        )
        return {
          id,
          capacity: id % 4 === 0 ? 6 : 4,
          status: os.some((o) => o.bill && !o.paid)
            ? "Cuenta solicitada"
            : os.length
              ? "Ocupada"
              : meta?.status || "Libre",
          waiter: os.length ? "Carlos" : meta?.waiter || "—",
          guests: os.length ? meta?.guests || 4 : meta?.guests || 0,
          total: os
            .filter((o) => o.table === id && !o.paid)
            .reduce((s, o) => s + total(o), 0),
          minutes: os.length
            ? Math.floor(
                (Date.now() - Math.min(...os.map((o) => o.created))) / 60000,
              )
            : 0,
        }
      },
    )
  const setTableState = (
    branch: string,
    ids: number[],
    patch: Partial<DiningTable>,
  ) =>
    setTableMeta((ts) => ({
      ...ts,
      [branch]: {
        ...ts[branch],
        ...Object.fromEntries(
          ids.map((id) => [id, { ...ts[branch]?.[id], ...patch }]),
        ),
      },
    }))
  const requestBill = (branch: string, ids: number[]) => {
    setOrders((os) =>
      os.map((o) =>
        o.branch === branch &&
        !o.paid &&
        o.table &&
        (ids.includes(o.table) || o.tableGroup?.some((id) => ids.includes(id)))
          ? { ...o, bill: true }
          : o,
      ),
    )
    log(`Pre-cuenta mesas ${ids.join(" + ")}`, branch, "Mesero")
  }
  const mergeTables = (branch: string, ids: number[]) => {
    if (ids.length < 2) return
    setOrders((os) =>
      os.map((o) =>
        o.branch === branch && !o.paid && o.table && ids.includes(o.table)
          ? { ...o, tableGroup: ids }
          : o,
      ),
    )
    setTableState(branch, ids, {
      status: "Ocupada",
      waiter: "Carlos",
      guests: 4,
    })
    log(`Fusión temporal mesas ${ids.join(" + ")}`, branch, "Mesero")
  }
  const separateTables = (branch: string, ids: number[]) => {
    setOrders((os) =>
      os.map((o) =>
        o.branch === branch && o.tableGroup?.some((id) => ids.includes(id))
          ? { ...o, tableGroup: undefined }
          : o,
      ),
    )
    setTableState(branch, ids, { status: "Libre", guests: 0, waiter: "—" })
    log(`Separación mesas ${ids.join(" + ")}`, branch, "Mesero")
  }
  const moveTables = (branch: string, ids: number[], target: number) => {
    if (tablesFor(branch).find((t) => t.id === target)?.status !== "Libre")
      return false
    setOrders((os) =>
      os.map((o) =>
        o.branch === branch &&
        !o.paid &&
        o.table &&
        (ids.includes(o.table) || o.tableGroup?.some((id) => ids.includes(id)))
          ? { ...o, table: target, tableGroup: undefined }
          : o,
      ),
    )
    setTableState(branch, ids, { status: "Libre", guests: 0, waiter: "—" })
    setTableState(branch, [target], {
      status: "Ocupada",
      waiter: "Carlos",
      guests: ids.length * 4,
    })
    log(`Cambio de mesa ${ids.join("+")} → ${target}`, branch, "Mesero")
    return true
  }
  const serveOrder = (id: number) => {
    const o = orders.find((o) => o.id === id)
    if (!o || o.channel !== "Salón" || o.status !== "Listo" || o.served)
      return false
    updateOrder(id, {
      served: true,
      status: o.paid ? "Entregado" : "Listo",
      arrival: Date.now(),
    })
    const ids = o.tableGroup || (o.table ? [o.table] : [])
    if (o.paid) {
      const clear = ids.filter(
        (id) =>
          !orders.some(
            (other) =>
              other.id !== o.id &&
              other.branch === o.branch &&
              other.status !== "Anulado" &&
              (!other.paid || !other.served) &&
              (other.table === id || other.tableGroup?.includes(id)),
          ),
      )
      setTableState(o.branch, clear, {
        status: "Libre",
        guests: 0,
        waiter: "—",
      })
    }
    log(`Pedido #${id} servido en salón`, o.branch, "Mesero")
    return true
  }
  return {
    products,
    setProducts,
    productsFor,
    categories,
    setCategories,
    employees,
    setEmployees,
    branches,
    setBranches,
    orders,
    setOrders,
    activeBranch,
    setActiveBranch,
    managerBranch,
    stocks,
    movements,
    adjust,
    availability,
    setAvailable,
    series,
    setSeries,
    payments,
    cashSessions,
    cashTotals,
    openCash,
    closeCash,
    closures,
    payOrders,
    promotions,
    setPromotions,
    activePromotion,
    priceFor,
    audit,
    log,
    placeOrder,
    updateOrder,
    advanceOrder,
    serveOrder,
    cancelOrder,
    freeRiders,
    assignRider,
    advanceDelivery,
    settleDelivery,
    tablesFor,
    setTableState,
    requestBill,
    mergeTables,
    separateTables,
    moveTables,
    profile,
    setProfile,
    addresses,
    setAddresses,
    clientCart,
    setClientCart,
  }
}
const DemoContext = createContext<ReturnType<typeof useDemoState> | null>(null)
export function DemoProvider({ children }: { children: ReactNode }) {
  const value = useDemoState()
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
export function useDemoData() {
  const value = useContext(DemoContext)
  if (!value) throw new Error("DemoProvider is required")
  return value
}
