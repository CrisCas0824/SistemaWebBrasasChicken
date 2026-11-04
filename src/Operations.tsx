import { useEffect, useState, type FormEvent } from "react"
import {
  ArrowRight,
  Banknote,
  Bike,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Eye,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react"
import brosLogo from "./assets/bros-chicken-logo.png"
import { useDemoData } from "./demo-state"
import Action, { DemoModal, Empty, StateTag, useNotice } from "./demo-ui"
import {
  money,
  total,
  type Line,
  type Order,
  type Payment,
  type Product,
} from "./model"

interface PickerProps {
  add: (p: Product) => void
  lines?: Line[]
}
function ProductPicker({ add, lines = [] }: PickerProps) {
  const d = useDemoData()
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  return (
    <>
      <div className="filters">
        <div className="search-box">
          <Search size={15} />
          <input
            aria-label="Buscar en carta"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en carta..."
          />
        </div>
        <select
          aria-label="Categoría de la comanda"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Todos</option>
          {d.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="option-product-picker">
        {d
          .getProducts()
          .filter(
            (p) =>
              p.active &&
              (category === "Todos" || p.category === category) &&
              p.name.toLowerCase().includes(query.toLowerCase()),
          )
          .map((p) => (
            <button
              key={p.id}
              disabled={!p.available || !p.stockActual || (lines.find(l => l.productId === p.id)?.qty || 0) >= p.stockActual}
              onClick={() => add(p)}
            >
              <img src={p.image} alt="" />
              <b>{p.name}</b>
              <span>{money(d.priceFor(p))}</span>
              <small>Stock: {p.stockActual} unid.</small>
              <Plus size={15} />
            </button>
          ))}
      </div>
    </>
  )
}
function CartEditor({
  lines,
  setLines,
}: {
  lines: Line[]
  setLines: (lines: Line[]) => void
}) {
  const d = useDemoData()
  return (
    <div className="attention-order">
      {lines.map((l, i) => (
        <div key={l.productId} className="option-comanda-line">
          <div className="attention-row">
            <span>
              <b>{l.name}</b>
              <small>{money(l.price)} c/u</small>
            </span>
            <div className="qty-control">
              <button
                aria-label={`Reducir ${l.name}`}
                onClick={() =>
                  setLines(
                    lines
                      .map((x, j) => (i === j ? { ...x, qty: x.qty - 1 } : x))
                      .filter((x) => x.qty > 0),
                  )
                }
              >
                <Minus />
              </button>
              <span>{l.qty}</span>
              <button
                aria-label={`Aumentar ${l.name}`}
                disabled={
                  l.qty >=
                  (d.getProducts().find((p) => p.id === l.productId)
                    ?.stockActual || 0)
                }
                onClick={() =>
                  setLines(
                    lines.map((x, j) =>
                      i === j ? { ...x, qty: x.qty + 1 } : x,
                    ),
                  )
                }
              >
                <Plus />
              </button>
            </div>
            <strong>{money(l.qty * l.price)}</strong>
          </div>
          <input
            aria-label={`Observación ${l.name}`}
            placeholder="Parte pecho, sin ají, papas crocantes..."
            value={l.note}
            onChange={(e) =>
              setLines(
                lines.map((x, j) =>
                  i === j ? { ...x, note: e.target.value } : x,
                ),
              )
            }
          />
        </div>
      ))}
    </div>
  )
}
function addLine(lines: Line[], p: Product, price: number): Line[] {
  const found = lines.find((l) => l.productId === p.id)
  if (found && found.qty >= p.stockActual) return lines
  return found
    ? lines.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + 1 } : l))
    : [...lines, { productId: p.id, name: p.name, price, qty: 1, note: "" }]
}
export function DiningRoom() {
  const d = useDemoData()
  const { notify, feedback } = useNotice()
  const [selected, setSelected] = useState<number[]>([5, 6])
  const [modal, setModal] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const [target, setTarget] = useState<number | null>(null)
  const localTables = d.tables[d.branch] || []
  const activeIds =
    selected.length === 1 &&
    localTables.find((t) => t.id === selected[0])?.group.length
      ? localTables.find((t) => t.id === selected[0])!.group
      : selected
  const existing = d.tableOrders(activeIds)
  const runningTotal = existing.reduce((s, o) => s + total(o), 0)
  const draftTotal = lines.reduce((s, l) => s + l.qty * l.price, 0)
  useEffect(() => {
    setSelected([1])
    setLines([])
    setModal("")
  }, [d.branch])
  const toggle = (id: number) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )
    setLines([])
  }
  const send = () => {
    if (!activeIds.length) {
      notify("Selecciona una mesa antes de enviar.")
      return
    }
    const r = d.createOrder({
      channel: "Salón",
      items: lines,
      branch: d.branch,
      tables: activeIds,
      customer: `Mesa ${activeIds.join(" + ")}`,
      method: "Efectivo",
    })
    notify(r.message)
    if (r.ok) setLines([])
  }
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (modal === "open" || modal === "reserve") {
      if (!activeIds.length) {
        notify("Selecciona al menos una mesa.")
        return
      }
      if (
        activeIds.some(
          (id) =>
            d.tableStatus(id) !== "Libre" && d.tableStatus(id) !== "Reservada",
        )
      ) {
        notify("Selecciona mesas libres o reservadas para esta acción.")
        return
      }
      d.setTables((ts) => ({
        ...ts,
        [d.branch]: ts[d.branch].map((t) =>
          activeIds.includes(t.id)
            ? {
                ...t,
                status: modal === "reserve" ? "Reservada" : "Ocupada",
                guests: Number(f.get("guests")),
                waiter: String(f.get("waiter")),
              }
            : t,
        ),
      }))
      notify(
        modal === "reserve"
          ? "Reserva registrada en las mesas seleccionadas."
          : "Atención abierta y mesero asignado.",
      )
    } else if (modal === "merge") {
      if (selected.length < 2) {
        notify("Selecciona al menos dos mesas.")
        return
      }
      d.setTables((ts) => ({
        ...ts,
        [d.branch]: ts[d.branch].map((t) =>
          selected.includes(t.id) ? { ...t, group: [...selected] } : t,
        ),
      }))
      notify(`Mesas ${selected.join(" + ")} fusionadas temporalmente.`)
    } else if (modal === "move") {
      const r = d.moveTables(activeIds, target || 0)
      notify(r.message)
      if (!r.ok) return
      setSelected([target!])
    } else if (modal === "bill") {
      const r = d.requestBill(activeIds)
      notify(r.message)
      if (!r.ok) return
    }
    setModal("")
  }
  const split = () => {
    existing
      .filter((o) => (o.tables?.length || 0) > 1)
      .forEach((o) =>
        d.updateOrder(o.id, { tables: [o.tables![0]], table: o.tables![0] }),
      )
    d.setTables((ts) => ({
      ...ts,
      [d.branch]: ts[d.branch].map((t) =>
        activeIds.includes(t.id) ? { ...t, group: [] } : t,
      ),
    }))
    setSelected(activeIds.length ? [activeIds[0]] : [])
    notify("Fusión finalizada. Las comandas se conservan en su mesa de origen.")
  }
  return (
    <>
      <div className="ops-summary">
        <div>
          <h1>Mesas del salón</h1>
          <p>
            {localTables.length} mesas configuradas · {d.branch} · selecciona
            varias para fusionar.
          </p>
        </div>
        <div className="service-stats">
          <span>
            <b>
              {
                localTables.filter((t) => d.tableStatus(t.id) === "Libre")
                  .length
              }
            </b>{" "}
            libres
          </span>
          <span>
            <b>
              {
                localTables.filter((t) => d.tableStatus(t.id) === "Ocupada")
                  .length
              }
            </b>{" "}
            ocupadas
          </span>
          <span>
            <b>
              {
                localTables.filter(
                  (t) => d.tableStatus(t.id) === "Cuenta solicitada",
                ).length
              }
            </b>{" "}
            cuentas
          </span>
        </div>
      </div>
      <div className="waiter-dashboard">
        <span>
          <b>
            {localTables.filter((t) => d.tableStatus(t.id) !== "Libre").length}
          </b>{" "}
          Mesas en atención
        </span>
        <span>
          <b>
            {
              d.orders.filter(
                (o) => o.branch === d.branch && o.status === "Pendiente",
              ).length
            }
          </b>{" "}
          Pedidos pendientes
        </span>
        <span>
          <b>
            {
              d.orders.filter(
                (o) =>
                  o.branch === d.branch && o.status === "Listo" && !o.served,
              ).length
            }
          </b>{" "}
          Listos en cocina
        </span>
        <span>
          <b>
            {
              d.orders.filter(
                (o) =>
                  o.branch === d.branch &&
                  o.bill &&
                  !o.paid &&
                  o.status !== "Anulado",
              ).length
            }
          </b>{" "}
          Cuentas solicitadas
        </span>
      </div>
      <div className="table-legend">
        <span>
          <i className="free" /> Libre
        </span>
        <span>
          <i className="busy" /> Ocupada
        </span>
        <span>
          <i className="reserved" /> Reservada
        </span>
        <span>
          <i className="bill" /> Cuenta solicitada
        </span>
      </div>
      <div className="salon-layout">
        <section>
          <div className="tables-grid detailed">
            {localTables.map((t) => {
              const status = d.tableStatus(t.id),
                os = d.tableOrders([t.id])
              return (
                <button
                  key={t.id}
                  className={`${
                    status === "Libre"
                      ? "free"
                      : status === "Ocupada"
                        ? "busy"
                        : status === "Reservada"
                          ? "reserved"
                          : "bill"
                  } ${activeIds.includes(t.id) ? "selected" : ""}`}
                  onClick={() => toggle(t.id)}
                >
                  <div>
                    <Utensils />
                    <StateTag>{status}</StateTag>
                  </div>
                  <b>Mesa {String(t.id).padStart(2, "0")}</b>
                  <small>
                    {t.capacity} personas · {t.waiter}
                  </small>
                  {t.group.length > 1 && (
                    <small>Unida: {t.group.join(" + ")}</small>
                  )}
                  {os.length > 0 && (
                    <>
                      <span>{os.length} comanda(s)</span>
                      <strong>
                        {money(os.reduce((s, o) => s + total(o), 0))}
                      </strong>
                    </>
                  )}
                </button>
              )
            })}
          </div>
          <div className="table-quick-actions">
            <Action
              secondary
              disabled={!selected.length}
              onClick={() => setModal("open")}
            >
              <Plus /> Abrir mesa
            </Action>
            <Action
              secondary
              disabled={selected.length < 2}
              onClick={() => setModal("merge")}
            >
              <Utensils /> Fusionar seleccionadas
            </Action>
            <Action
              secondary
              disabled={!selected.length}
              onClick={() => setModal("reserve")}
            >
              <Clock3 /> Nueva reserva
            </Action>
          </div>
        </section>
        <aside className="table-attention">
          <div className="attention-head">
            <div>
              <span>ATENCIÓN ACTIVA</span>
              <h2>
                {activeIds.length
                  ? `Mesa ${activeIds.join(" + Mesa ")}`
                  : "Selecciona una mesa"}
              </h2>
              <p>Carlos Ruiz · {d.branch}</p>
            </div>
            {activeIds.length > 0 && (
              <StateTag>{d.tableStatus(activeIds[0])}</StateTag>
            )}
          </div>
          <div className="attention-actions">
            <button
              disabled={!activeIds.length}
              onClick={() => {
                setTarget(null)
                setModal("move")
              }}
            >
              Cambiar mesa
            </button>
            <button
              disabled={selected.length < 2}
              onClick={() => setModal("merge")}
            >
              Fusionar
            </button>
            <button
              disabled={
                !activeIds.some(
                  (id) =>
                    (localTables.find((t) => t.id === id)?.group.length || 0) >
                    1,
                )
              }
              onClick={split}
            >
              Separar
            </button>
          </div>
          {existing.map((o) => (
            <div className="option-existing-order" key={o.id}>
              <div>
                <b>#{o.id}</b>
                <StateTag>{o.status}</StateTag>
              </div>
              {o.items.map((l, i) => (
                <p key={i}>
                  {l.qty}× {l.name}
                  <small>{l.note}</small>
                </p>
              ))}
              {o.status === "Listo" && !o.served && (
                <Action
                  secondary
                  onClick={() => {
                    d.updateOrder(o.id, {
                      served: true,
                      status: o.paid ? "Entregado" : "Listo",
                    })
                    notify("Pedido servido en mesa.")
                  }}
                >
                  Marcar servido
                </Action>
              )}
            </div>
          ))}
          <CartEditor lines={lines} setLines={setLines} />
          <button
            className="add-product"
            disabled={!activeIds.length}
            onClick={() => setModal("products")}
          >
            <Plus /> Agregar productos
          </button>
          <div className="attention-total">
            <span>
              Comandas enviadas <b>{money(runningTotal)}</b>
            </span>
            <span>
              Nueva comanda <b>{money(draftTotal)}</b>
            </span>
            <span>
              Total acumulado{" "}
              <strong>{money(runningTotal + draftTotal)}</strong>
            </span>
          </div>
          <div className="attention-footer">
            <Action
              secondary
              disabled={!lines.length || !activeIds.length}
              onClick={send}
            >
              <ChefHat /> Enviar a cocina
            </Action>
            <Action
              disabled={!existing.length}
              onClick={() => setModal("bill")}
            >
              <ReceiptText /> Solicitar cuenta
            </Action>
          </div>
          <p className="modal-copy">
            Las anulaciones se autorizan desde Pedidos en el perfil Gerente.
          </p>
        </aside>
      </div>
      {modal && (
        <DemoModal
          title={
            modal === "products"
              ? "Carta para la comanda"
              : modal === "open"
                ? "Abrir mesa"
                : modal === "reserve"
                  ? "Nueva reserva"
                  : modal === "merge"
                    ? "Fusionar mesas"
                    : modal === "move"
                      ? "Cambiar mesa"
                      : "Solicitar cuenta"
          }
          close={() => setModal("")}
          className={modal === "products" ? "option-wide-modal" : ""}
        >
          {modal === "products" ? (
            <>
              <ProductPicker
                lines={lines}
                add={(p) => setLines((ls) => addLine(ls, p, d.priceFor(p)))}
              />
              <div className="option-form-actions">
                <Action onClick={() => setModal("")}>
                  Volver a la comanda ({lines.reduce((s, l) => s + l.qty, 0)})
                </Action>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              {["open", "reserve"].includes(modal) && (
                <>
                  <label>
                    Cantidad de personas
                    <input
                      name="guests"
                      type="number"
                      min="1"
                      max="30"
                      defaultValue="4"
                      required
                    />
                  </label>
                  <label>
                    Mesero asignado
                    <select name="waiter" required>
                      {d.employees
                        .filter(
                          (e) =>
                            e.role === "mesero" &&
                            e.active &&
                            e.branch === d.branch,
                        )
                        .map((e) => (
                          <option key={e.id}>{e.name}</option>
                        ))}
                    </select>
                  </label>
                </>
              )}
              {modal === "merge" && (
                <div className="modal-table-options">
                  {localTables.map((t) => (
                    <button
                      type="button"
                      className={selected.includes(t.id) ? "selected" : ""}
                      key={t.id}
                      onClick={() =>
                        setSelected((s) =>
                          s.includes(t.id)
                            ? s.filter((id) => id !== t.id)
                            : [...s, t.id],
                        )
                      }
                    >
                      Mesa {t.id}
                    </button>
                  ))}
                </div>
              )}
              {modal === "move" && (
                <div className="modal-table-options">
                  {localTables
                    .filter(
                      (t) =>
                        d.tableStatus(t.id) === "Libre" &&
                        !activeIds.includes(t.id),
                    )
                    .map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        className={target === t.id ? "selected" : ""}
                        onClick={() => setTarget(t.id)}
                      >
                        Mesa {t.id}
                      </button>
                    ))}
                </div>
              )}
              {modal === "bill" && (
                <p className="modal-copy">
                  Se enviarán {existing.length} comandas por{" "}
                  {money(runningTotal)} a la cola de caja.
                </p>
              )}
              <div className="option-form-actions">
                <Action secondary onClick={() => setModal("")}>
                  Cancelar
                </Action>
                <Action type="submit">Confirmar acción</Action>
              </div>
            </form>
          )}
        </DemoModal>
      )}
      {feedback}
    </>
  )
}

export function KitchenBody({ onCashier }: { onCashier: () => void }) {
  const d = useDemoData()
  const { notify, feedback } = useNotice()
  const [zone, setZone] = useState("Todas")
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const zoneFor = (id: number) => {
    const c = d.products.find((p) => p.id === id)?.category
    return c === "Pollos a la Brasa"
      ? "Horno Brasa"
      : c === "Broaster y Mostritos"
        ? "Freidoras"
        : "Wok"
  }
  const cards = d.orders
    .filter(
      (o) =>
        o.branch === d.branch &&
        ["Pendiente", "Preparando", "Listo"].includes(o.status) &&
        !o.served &&
        !o.delivery &&
        (zone === "Todas" ||
          o.items.some((l) => zoneFor(l.productId) === zone)),
    )
    .sort((a, b) => a.created - b.created)
  const advance = (o: Order) => {
    if (o.status === "Pendiente") d.updateOrder(o.id, { status: "Preparando" })
    else if (o.status === "Preparando") d.updateOrder(o.id, { status: "Listo" })
    else if (o.channel === "Salón")
      d.updateOrder(o.id, {
        served: true,
        status: o.paid ? "Entregado" : "Listo",
      })
    else {
      onCashier()
      return
    }
    notify(`Pedido #${o.id} actualizado.`)
  }
  return (
    <>
      <div className="ops-summary">
        <div>
          <h1>KDS multizona</h1>
          <p>FIFO · {d.branch} · pedidos ordenados por hora de ingreso</p>
        </div>
        <div className="service-stats">
          <span>
            <b>{cards.length}</b> activos
          </span>
          <span>
            <b>{new Date(now).toLocaleTimeString("es-PE")}</b> en vivo
          </span>
        </div>
      </div>
      <div className="zone-filters">
        {["Todas", "Horno Brasa", "Freidoras", "Wok"].map((z) => (
          <button
            key={z}
            className={zone === z ? "active" : ""}
            onClick={() => setZone(z)}
          >
            {z}
          </button>
        ))}
      </div>
      <div className="kanban">
        {(["Pendiente", "Preparando", "Listo"] as const).map((status, i) => {
          const list = cards.filter((o) => o.status === status)
          return (
            <section className="kanban-col" key={status}>
              <div className={`kanban-head ${["red", "plain", "black"][i]}`}>
                <div>
                  <i />
                  {["NUEVOS", "EN PREPARACIÓN", "LISTOS"][i]}
                </div>
                <span>{list.length}</span>
              </div>
              <div className="kanban-list">
                {list.map((o) => (
                  <article className="order-card" key={o.id}>
                    <div className="order-card-head">
                      <strong>#{o.id}</strong>
                      <span className={now - o.created > 900000 ? "late" : ""}>
                        <Clock3 size={14} />
                        {Math.floor((now - o.created) / 60000)}:
                        {String(
                          Math.floor((now - o.created) / 1000) % 60,
                        ).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="order-type">
                      <span>
                        {o.channel === "Salón"
                          ? `Mesa ${(o.tables || [o.table]).join(" + ")}`
                          : o.channel === "Recojo"
                            ? "Para llevar"
                            : "Delivery Web"}
                      </span>
                      <small>{zoneFor(o.items[0].productId)}</small>
                    </div>
                    <ul>
                      {o.items.map((l, index) => (
                        <li key={index}>
                          <b>{l.qty}×</b> {l.name}
                          {l.note && (
                            <p>
                              <b>Nota:</b> {l.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => advance(o)}>
                      {status === "Pendiente"
                        ? "Iniciar preparación"
                        : status === "Preparando"
                          ? "Marcar como listo"
                          : o.channel === "Salón"
                            ? "Marcar servido"
                            : "Ir a despacho / caja"}
                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
                {!list.length && <Empty>Sin pedidos en esta etapa</Empty>}
              </div>
            </section>
          )
        })}
      </div>
      {feedback}
    </>
  )
}

export function CashWorkspace({ embedded = false }: { embedded?: boolean }) {
  const d = useDemoData()
  const { notify, feedback } = useNotice()
  const [tab, setTab] = useState("Mesas")
  const [selectedTable, setSelectedTable] = useState(4)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modal, setModal] = useState("")
  const [method, setMethod] = useState("Efectivo")
  const [receiptType, setReceiptType] = useState("Boleta")
  const [cash, setCash] = useState("")
  const [receipt, setReceipt] = useState<Payment | null>(null)
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [draft, setDraft] = useState<Line[]>([])
  const [channel, setChannel] = useState("Para llevar")
  const session = d.cashSessions[d.branch]
  const ps = d.shiftPayments()
  const sum = (m?: string) =>
    ps.filter((p) => !m || p.method === m).reduce((s, p) => s + p.amount, 0)
  const queue = d.orders.filter(
    (o) =>
      o.branch === d.branch &&
      !o.paid &&
      o.status !== "Anulado" &&
      o.channel !== "Delivery Web",
  )
  const selected =
    d.orders.find((o) => o.id === selectedId && o.branch === d.branch) ||
    d.tableOrders([selectedTable]).find((o) => !o.paid)
  const dispatches = d.orders.filter(
    (o) =>
      o.branch === d.branch &&
      o.channel === "Delivery Web" &&
      o.status === "Listo" &&
      !o.delivery,
  )
  const settlements = d.orders.filter(
    (o) =>
      o.branch === d.branch &&
      o.delivery === "ENTREGADO" &&
      o.method === "Efectivo" &&
      !o.settled &&
      o.status !== "Anulado",
  )
  const riders = d.employees.filter(
    (e) =>
      e.role === "repartidor" &&
      e.active &&
      e.branch === d.branch &&
      !d.orders.some(
        (o) =>
          o.rider === e.name &&
          o.delivery &&
          o.delivery !== "ENTREGADO" &&
          o.status !== "Anulado",
      ),
  )
  const openPayment = (o: Order) => {
    setSelectedId(o.id)
    setCash("")
    setMethod("Efectivo")
    setModal("payment")
  }
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (modal === "payment" && selected) {
      const r = d.charge(
        selected.id,
        method,
        receiptType,
        String(f.get("document") || ""),
        Number(cash),
      )
      notify(r.message)
      if (!r.ok) return
      setReceipt(r.payment!)
      setModal("receipt")
      return
    }
    if (modal === "open" || modal === "close") {
      const r =
        modal === "open"
          ? d.openCash(Number(f.get("amount")))
          : d.closeCash(Number(f.get("amount")))
      notify(r.message)
      if (!r.ok) return
    }
    if (modal === "new") {
      const r = d.createOrder({
        channel: channel === "Salón" ? "Salón" : "Recojo",
        branch: d.branch,
        items: draft,
        tables: channel === "Salón" ? [Number(f.get("table"))] : undefined,
        customer: String(f.get("customer") || "Ventanilla"),
        method: "Efectivo",
      })
      notify(r.message)
      if (!r.ok) return
      setDraft([])
      setSelectedId(r.order!.id)
      setTab("Comandas")
    }
    setModal("")
  }
  const orderDetails = (o: Order) => (
    <>
      <div className="builder-head">
        <div>
          <span>PEDIDO #{o.id}</span>
          <h2>
            {o.channel === "Salón"
              ? `Mesa ${(o.tables || [o.table]).join(" + ")}`
              : o.customer}
          </h2>
        </div>
        <StateTag>{o.status}</StateTag>
      </div>
      <div className="builder-items">
        {o.items.map((l, i) => (
          <article key={i}>
            <img
              src={d.products.find((p) => p.id === l.productId)?.image}
              alt=""
            />
            <div>
              <b>
                {l.qty}× {l.name}
              </b>
              <small>{l.note || "Sin observaciones"}</small>
            </div>
            <strong>{money(l.qty * l.price)}</strong>
          </article>
        ))}
      </div>
      <div className="builder-total">
        <span>
          Subtotal <b>{money(total(o) / 1.18)}</b>
        </span>
        <span>
          IGV (18%) <b>{money(total(o) - total(o) / 1.18)}</b>
        </span>
        <span>
          Total <strong>{money(total(o))}</strong>
        </span>
      </div>
      <Action
        className="full"
        disabled={!session.open || o.paid}
        onClick={() => openPayment(o)}
      >
        <Banknote /> Cobrar y emitir comprobante
      </Action>
    </>
  )
  return (
    <>
      <div className="cashier-strip">
        <span>
          <i className={session.open ? "open" : ""} />
          <small>CAJA 01 · {d.branch}</small>
          <b>
            {session.open ? "Abierta" : "Cerrada"} · {money(session.opening)}{" "}
            inicial
          </b>
        </span>
        <span>
          <small>VENTAS DEL TURNO</small>
          <b>{money(sum())}</b>
        </span>
        <span>
          <small>EFECTIVO</small>
          <b>{money(sum("Efectivo"))}</b>
        </span>
        <span>
          <small>YAPE / PLIN</small>
          <b>{money(sum("Yape") + sum("Plin"))}</b>
        </span>
        <span>
          <small>TARJETA</small>
          <b>{money(sum("Tarjeta"))}</b>
        </span>
        <Action
          secondary
          onClick={() => setModal(session.open ? "close" : "open")}
        >
          {session.open ? "Cerrar caja" : "Abrir caja"}
        </Action>
      </div>
      <div className="report-tabs option-operation-tabs">
        {[
          "Mesas",
          "Comandas",
          "Despacho delivery",
          "Liquidaciones",
          "Comprobantes",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Comandas"
              ? ` (${queue.length})`
              : t === "Despacho delivery"
                ? ` (${dispatches.length})`
                : ""}
          </button>
        ))}
      </div>
      {tab === "Mesas" && (
        <div className="waiter-main">
          <section className="table-map">
            <div className="ops-summary">
              <div>
                <h1>Plano de mesas</h1>
                <p>Selecciona una mesa para revisar su cuenta.</p>
              </div>
              {!embedded && (
                <Action
                  onClick={() => {
                    setDraft([])
                    setModal("new")
                  }}
                >
                  <Plus size={16} /> Nueva comanda
                </Action>
              )}
            </div>
            <div className="table-legend">
              <span>
                <i className="free" /> Libre
              </span>
              <span>
                <i className="busy" /> Ocupada
              </span>
              <span>
                <i className="bill" /> Cuenta solicitada
              </span>
            </div>
            <div className="tables-grid">
              {d.tables[d.branch].map((t) => {
                const state = d.tableStatus(t.id)
                return (
                  <button
                    key={t.id}
                    className={`${
                      state === "Libre"
                        ? "free"
                        : state === "Cuenta solicitada"
                          ? "bill"
                          : "busy"
                    } ${selectedTable === t.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedTable(t.id)
                      setSelectedId(null)
                    }}
                  >
                    <Utensils />
                    <b>Mesa {String(t.id).padStart(2, "0")}</b>
                    <small>{state}</small>
                  </button>
                )
              })}
            </div>
          </section>
          <aside className="order-builder">
            {selected ? (
              orderDetails(selected)
            ) : (
              <>
                <div className="builder-head">
                  <div>
                    <span>CUENTA DE MESA</span>
                    <h2>Mesa {selectedTable}</h2>
                  </div>
                </div>
                <Empty>No hay cobros pendientes en esta mesa.</Empty>
              </>
            )}
          </aside>
        </div>
      )}
      {tab === "Comandas" && (
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h3>Cola de cobro</h3>
              <p>Salón y para llevar · {d.branch}</p>
            </div>
            {!embedded && (
              <Action
                onClick={() => {
                  setDraft([])
                  setModal("new")
                }}
              >
                <Plus /> Nueva comanda
              </Action>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente / mesa</th>
                  <th>Canal</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <b>#{o.id}</b>
                    </td>
                    <td>
                      {o.table
                        ? `Mesa ${(o.tables || [o.table]).join(" + ")}`
                        : o.customer}
                    </td>
                    <td>
                      {o.channel === "Recojo" ? "Para llevar" : o.channel}
                    </td>
                    <td>
                      <StateTag>{o.status}</StateTag>
                      {o.bill && (
                        <small className="option-code">Cuenta solicitada</small>
                      )}
                    </td>
                    <td>{money(total(o))}</td>
                    <td>
                      <Action
                        disabled={!session.open}
                        onClick={() => openPayment(o)}
                      >
                        Cobrar
                      </Action>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!queue.length && <Empty>Sin cobros pendientes.</Empty>}
          </div>
        </section>
      )}
      {tab === "Despacho delivery" && (
        <>
          <div className="ops-summary">
            <div>
              <h1>Despacho de delivery</h1>
              <p>
                {riders.length} repartidores libres en {d.branch}
              </p>
            </div>
          </div>
          <div className="dispatch-board">
            {dispatches.map((o) => (
              <article className="dispatch-card" key={o.id}>
                <div className="dispatch-head">
                  <strong>#{o.id}</strong>
                  <StateTag>Listo</StateTag>
                </div>
                <h3>{o.customer}</h3>
                <p>
                  <MapPin />
                  {o.address}
                </p>
                <p>
                  <Phone />
                  {o.phone}
                </p>
                <div className="dispatch-meta">
                  <span>
                    Pago<b>{o.paid ? "Pagado" : o.method}</b>
                  </span>
                  <span>
                    Total<b>{money(total(o))}</b>
                  </span>
                </div>
                <label className="option-form-label">
                  Repartidor libre
                  <select
                    aria-label={`Repartidor pedido ${o.id}`}
                    value={assignments[o.id] || riders[0]?.name || ""}
                    onChange={(e) =>
                      setAssignments((a) => ({ ...a, [o.id]: e.target.value }))
                    }
                  >
                    {!riders.length && (
                      <option value="">No hay repartidores libres</option>
                    )}
                    {riders.map((e) => (
                      <option key={e.id}>{e.name}</option>
                    ))}
                  </select>
                </label>
                <Action
                  className="full"
                  disabled={!riders.length}
                  onClick={() =>
                    notify(
                      d.assign(o.id, assignments[o.id] || riders[0]?.name || "")
                        .message,
                    )
                  }
                >
                  <Bike /> Asignar despacho
                </Action>
              </article>
            ))}
          </div>
          {!dispatches.length && (
            <Empty>
              Los pedidos web aparecerán cuando cocina los marque listos.
            </Empty>
          )}
        </>
      )}
      {tab === "Liquidaciones" && (
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h3>Liquidación de repartidores</h3>
              <p>Solo efectivo cobrado y entregado, pendiente de rendición.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Repartidor</th>
                  <th>Cliente</th>
                  <th>Efectivo por rendir</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.rider}</td>
                    <td>{o.customer}</td>
                    <td>
                      <b>{money(total(o))}</b>
                    </td>
                    <td>
                      <Action
                        disabled={!session.open}
                        onClick={() => notify(d.settle(o.id).message)}
                      >
                        Liquidar cobro
                      </Action>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!settlements.length && (
              <Empty>No hay efectivo pendiente de liquidar.</Empty>
            )}
          </div>
        </section>
      )}
      {tab === "Comprobantes" && (
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h3>Comprobantes del turno</h3>
              <p>Documentos simulados, sin validez tributaria.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Pedido</th>
                  <th>Documento</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ps.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.receipt}</b>
                    </td>
                    <td>#{p.orderId}</td>
                    <td>{p.document || "—"}</td>
                    <td>{p.method}</td>
                    <td>{money(p.amount)}</td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={`Ver ${p.receipt}`}
                        onClick={() => {
                          setReceipt(p)
                          setModal("receipt")
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!ps.length && (
              <Empty>Los cobros se registran aquí al confirmar el pago.</Empty>
            )}
          </div>
        </section>
      )}
      {modal && (
        <DemoModal
          title={
            modal === "payment"
              ? `Cobrar pedido #${selected?.id}`
              : modal === "receipt"
                ? "Comprobante de pago"
                : modal === "open"
                  ? "Apertura de caja"
                  : modal === "close"
                    ? "Cierre y arqueo de caja"
                    : "Nueva comanda"
          }
          close={() => setModal("")}
          className={modal === "new" ? "option-wide-modal" : "pos-modal"}
        >
          {["payment", "receipt"].includes(modal) && (
            <div className="option-receipt-logo">
              <div className="brand">
                <img src={brosLogo} alt="BROS Chicken" />
              </div>
              <small>RUC 20601234567 · {d.branch.toUpperCase()}</small>
            </div>
          )}
          {modal === "receipt" && receipt ? (
            <>
              <div className="movement-list">
                <span>
                  <b>{receipt.receipt}</b>Pedido #{receipt.orderId} ·{" "}
                  {receipt.method}
                </span>
                <span>
                  <b>{receipt.document || "Consumidor final"}</b>
                  {new Date(receipt.time).toLocaleString("es-PE")}
                </span>
                <span>
                  <b>Subtotal</b>
                  {money(receipt.amount / 1.18)}
                </span>
                <span>
                  <b>IGV 18%</b>
                  {money(receipt.amount - receipt.amount / 1.18)}
                </span>
                <span>
                  <b>Total pagado</b>
                  {money(receipt.amount)}
                </span>
              </div>
              <p className="modal-copy">
                Documento demo sin validez tributaria. No se procesa dinero
                real.
              </p>
              <div className="option-form-actions">
                <Action onClick={() => setModal("")}>Cerrar</Action>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              {modal === "payment" && selected && (
                <>
                  <h3>{money(total(selected))}</h3>
                  <div className="admin-form-row">
                    <label>
                      Comprobante
                      <select
                        value={receiptType}
                        onChange={(e) => setReceiptType(e.target.value)}
                      >
                        <option>Boleta</option>
                        <option>Factura</option>
                      </select>
                    </label>
                    <label>
                      {receiptType === "Factura" ? "RUC" : "DNI (opcional)"}
                      <input
                        key={receiptType}
                        name="document"
                        required={receiptType === "Factura"}
                        pattern={
                          receiptType === "Factura" ? "[0-9]{11}" : "[0-9]{8}"
                        }
                        placeholder={
                          receiptType === "Factura" ? "11 dígitos" : "8 dígitos"
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Método de pago
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      {["Efectivo", "Yape", "Plin", "Tarjeta"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  {method === "Efectivo" && (
                    <div className="admin-form-row">
                      <label>
                        Efectivo recibido
                        <input
                          type="number"
                          min={total(selected)}
                          step=".01"
                          required
                          value={cash}
                          onChange={(e) => setCash(e.target.value)}
                        />
                      </label>
                      <label>
                        Vuelto
                        <input
                          aria-label="Vuelto"
                          readOnly
                          value={money(
                            Math.max(0, Number(cash) - total(selected)),
                          )}
                        />
                      </label>
                    </div>
                  )}
                  <div className="movement-list">
                    <span>
                      <b>Subtotal</b>
                      {money(total(selected) / 1.18)}
                    </span>
                    <span>
                      <b>IGV 18%</b>
                      {money(total(selected) - total(selected) / 1.18)}
                    </span>
                    <span>
                      <b>Total</b>
                      {money(total(selected))}
                    </span>
                  </div>
                </>
              )}
              {["open", "close"].includes(modal) && (
                <>
                  {modal === "close" && (
                    <div className="movement-list">
                      <span>
                        <b>Fondo inicial</b>
                        {money(session.opening)}
                      </span>
                      <span>
                        <b>Efectivo cobrado</b>
                        {money(sum("Efectivo"))}
                      </span>
                      <span>
                        <b>Yape / Plin / Tarjeta</b>
                        {money(sum("Yape") + sum("Plin") + sum("Tarjeta"))}
                      </span>
                      <span>
                        <b>Efectivo esperado</b>
                        {money(session.opening + sum("Efectivo"))}
                      </span>
                    </div>
                  )}
                  <label>
                    {modal === "open"
                      ? "Fondo inicial (S/)"
                      : "Efectivo contado (S/)"}
                    <input
                      name="amount"
                      type="number"
                      required
                      min="0"
                      step=".01"
                      defaultValue={modal === "open" ? 300 : undefined}
                    />
                  </label>
                </>
              )}
              {modal === "new" && (
                <>
                  <div className="admin-form-row">
                    <label>
                      Modalidad
                      <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                      >
                        <option>Para llevar</option>
                        <option>Salón</option>
                      </select>
                    </label>
                    {channel === "Salón" ? (
                      <label>
                        Mesa
                        <select name="table" defaultValue={selectedTable}>
                          {d.tables[d.branch].map((t) => (
                            <option key={t.id} value={t.id}>
                              Mesa {t.id}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label>
                        Cliente
                        <input
                          name="customer"
                          required
                          placeholder="Nombre del cliente"
                        />
                      </label>
                    )}
                  </div>
                  <ProductPicker
                    lines={draft}
                    add={(p) => setDraft((ls) => addLine(ls, p, d.priceFor(p)))}
                  />
                  <CartEditor lines={draft} setLines={setDraft} />
                  <p className="modal-copy">
                    Total de comanda:{" "}
                    {money(draft.reduce((s, l) => s + l.qty * l.price, 0))}
                  </p>
                </>
              )}
              <div className="option-form-actions">
                <Action secondary onClick={() => setModal("")}>
                  Cancelar
                </Action>
                <Action
                  type="submit"
                  disabled={modal === "new" && !draft.length}
                >
                  {modal === "payment"
                    ? "Confirmar cobro"
                    : modal === "open"
                      ? "Confirmar apertura"
                      : modal === "close"
                        ? "Cerrar turno"
                        : "Enviar a cocina"}
                </Action>
              </div>
            </form>
          )}
        </DemoModal>
      )}
      {feedback}
    </>
  )
}

export function DeliveryBody() {
  const d = useDemoData()
  const { notify, feedback } = useNotice()
  const [rider, setRider] = useState("José Ramírez")
  const riders = d.employees.filter(
    (e) => e.role === "repartidor" && e.active && e.branch === d.branch,
  )
  const current = riders.some((e) => e.name === rider)
    ? rider
    : riders[0]?.name || ""
  const list = d.orders.filter(
    (o) =>
      o.branch === d.branch &&
      o.rider === current &&
      o.delivery &&
      o.status !== "Anulado",
  )
  const bag = list
    .filter(
      (o) =>
        o.delivery === "ENTREGADO" && o.method === "Efectivo" && !o.settled,
    )
    .reduce((s, o) => s + total(o), 0)
  return (
    <>
      <div className="ops-summary">
        <div>
          <h1>Mis entregas asignadas</h1>
          <p>Direcciones, cobros y avance de ruta en una sola vista.</p>
        </div>
        <label className="option-form-label">
          Repartidor demo
          <select
            aria-label="Repartidor demo"
            value={current}
            onChange={(e) => setRider(e.target.value)}
          >
            {riders.map((e) => (
              <option key={e.id}>{e.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="delivery-kpis">
        <article>
          <Bike />
          <span>
            <b>{list.filter((o) => o.delivery === "ASIGNADO").length}</b>{" "}
            entregas asignadas
          </span>
        </article>
        <article>
          <Truck />
          <span>
            <b>{list.filter((o) => o.delivery === "EN_RUTA").length}</b> en
            camino
          </span>
        </article>
        <article>
          <Banknote />
          <span>
            <b>{money(bag)}</b> por liquidar en caja
          </span>
        </article>
      </div>
      <section className="dispatch-board">
        {list.map((o) => (
          <article
            key={o.id}
            className={`dispatch-card ${
              o.delivery === "EN_RUTA"
                ? "en-camino"
                : o.delivery === "ENTREGADO"
                  ? "por-liquidar"
                  : ""
            }`}
          >
            <div className="dispatch-head">
              <strong>#{o.id}</strong>
              <StateTag>
                {o.delivery === "ASIGNADO"
                  ? "Asignado"
                  : o.delivery === "EN_RUTA"
                    ? "En camino"
                    : "Entregado"}
              </StateTag>
            </div>
            <h3>{o.customer}</h3>
            <p>
              <MapPin />
              {o.address}
            </p>
            <p>
              <b>Referencia:</b> {o.reference || "Sin referencia adicional"}
            </p>
            <a className="option-call" href={`tel:${o.phone}`}>
              <Phone size={15} />
              Llamar al {o.phone}
            </a>
            <div className="dispatch-meta">
              <span>
                Pago<b>{o.paid ? "Ya está pagado" : "Cobro contra entrega"}</b>
                <small>{o.method}</small>
              </span>
              <span>
                Total<b>{money(total(o))}</b>
              </span>
            </div>
            {o.departure && (
              <p>Salida: {new Date(o.departure).toLocaleTimeString("es-PE")}</p>
            )}
            {o.arrival && (
              <p>Entrega: {new Date(o.arrival).toLocaleTimeString("es-PE")}</p>
            )}
            {o.delivery !== "ENTREGADO" ? (
              <Action
                className="full"
                onClick={() => {
                  d.updateOrder(
                    o.id,
                    o.delivery === "ASIGNADO"
                      ? { delivery: "EN_RUTA", departure: Date.now() }
                      : {
                          delivery: "ENTREGADO",
                          status: "Entregado",
                          arrival: Date.now(),
                        },
                  )
                  notify(
                    o.delivery === "ASIGNADO"
                      ? "Ruta iniciada."
                      : "Entrega registrada. El cliente ya puede verla.",
                  )
                }}
              >
                {o.delivery === "ASIGNADO" ? (
                  <>
                    <Bike /> Iniciar ruta
                  </>
                ) : (
                  <>
                    <CheckCircle2 /> Registrar entrega
                  </>
                )}
              </Action>
            ) : (
              <div className="delivery-done">
                <CheckCircle2 />
                {o.method === "Efectivo" && !o.settled
                  ? "Efectivo pendiente de rendir en caja"
                  : "Entrega completada"}
              </div>
            )}
          </article>
        ))}
      </section>
      {!list.length && (
        <Empty>
          No tienes entregas asignadas. Caja asigna los pedidos listos a un
          repartidor libre.
        </Empty>
      )}
      {feedback}
    </>
  )
}
