import { useState, type FormEvent } from "react"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Eye,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Utensils,
  WalletCards,
  X,
} from "lucide-react"
import { useDemoData } from "./DemoContext"
import { money, stockStatus, total, type Promotion } from "./model"

function dateValue(time = Date.now()) {
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function Metric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Store
  label: string
  value: string | number
  note: string
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}
export function AuditPanel() {
  const d = useDemoData()
  const [query, setQuery] = useState("")
  const entries = d.audit.filter(
    (a) =>
      /Acceso|Usuario|Sede|Serie|Contraseña|Servicios|Sesión/i.test(a.action) &&
      (a.action + a.user + a.branch)
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  return (
    <article className="panel table-panel">
      <div className="panel-head">
        <div>
          <h3>Configuración de mesas y registro de accesos</h3>
          <p>Auditoría técnica · Sesión demo</p>
        </div>
      </div>
      <div className="table-config-summary option-padding">
        {d.branches.map((b) => (
          <span key={b.id}>
            <b>{b.tableCount}</b> mesas · {b.name}
            {b.name === "La Victoria" ? " (Sede Principal)" : ""}
          </span>
        ))}
      </div>
      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            aria-label="Buscar auditoría"
            placeholder="Buscar acceso o configuración..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Usuario</th>
              <th>Sede</th>
              <th>Evento técnico</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.time).toLocaleString("es-PE")}</td>
                <td>{a.user}</td>
                <td>{a.branch}</td>
                <td>{a.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length && (
          <p className="option-empty">No hay accesos con estos filtros.</p>
        )}
      </div>
    </article>
  )
}
export function ExecutiveDashboard({ branch }: { branch: string }) {
  const d = useDemoData()
  const [period, setPeriod] = useState("Últimos 7 días")
  const [start, setStart] = useState(dateValue(Date.now() - 6 * 86400000))
  const [end, setEnd] = useState(dateValue())
  const from = new Date(`${start}T00:00:00`).getTime()
  const to = new Date(`${end}T23:59:59.999`).getTime()
  const source = d.payments.filter(
    (p) => branch === "Todas las sedes" || p.branch === branch,
  )
  const ps = source.filter((p) => p.time >= from && p.time <= to)
  const revenue = ps.reduce((s, p) => s + p.amount, 0)
  const duration = Math.max(86400000, to - from + 1)
  const previous = source
    .filter((p) => p.time >= from - duration && p.time < from)
    .reduce((s, p) => s + p.amount, 0)
  const growth = previous ? ((revenue - previous) / previous) * 100 : 0
  const count = ps.filter((p) => p.amount > 0).length
  const slots = Array.from({ length: 7 }, (_, i) => {
    const lo = from + (duration * i) / 7
    const hi = from + (duration * (i + 1)) / 7
    return {
      value: ps
        .filter((p) => p.time >= lo && p.time < hi)
        .reduce((s, p) => s + p.amount, 0),
      label: new Date(lo).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
      }),
    }
  })
  const max = Math.max(1, ...slots.map((s) => s.value))
  const scopedOrders = d.orders.filter(
    (o) =>
      o.status !== "Anulado" &&
      (branch === "Todas las sedes" || o.branch === branch),
  )
  const states = ["Pendiente", "Preparando", "Listo", "Entregado"]
  const stateCounts = states.map(
    (s) => scopedOrders.filter((o) => o.status === s).length,
  )
  const palette = ["#E50914", "#999999", "#111111", "#DDDDDD"]
  let offset = 0
  const ranking = d.products
    .map((p) => ({
      ...p,
      qty: scopedOrders.reduce(
        (sum, o) =>
          sum +
          o.items
            .filter((l) => l.productId === p.id)
            .reduce((s, l) => s + l.qty, 0),
        0,
      ),
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
  const changePeriod = (value: string) => {
    setPeriod(value)
    if (value !== "Personalizado") {
      setEnd(dateValue())
      setStart(
        dateValue(
          Date.now() -
            (value === "Hoy" ? 0 : value === "Últimos 7 días" ? 6 : 20) *
              86400000,
        ),
      )
    }
  }
  return (
    <>
      <div className="filters management-period">
        <select
          aria-label="Período ejecutivo"
          value={period}
          onChange={(e) => changePeriod(e.target.value)}
        >
          <option>Hoy</option>
          <option>Últimos 7 días</option>
          <option>Últimos 21 días</option>
          <option>Personalizado</option>
        </select>
        <label>
          Desde{" "}
          <input
            aria-label="Fecha inicial"
            type="date"
            value={start}
            max={end}
            onChange={(e) => {
              setStart(e.target.value)
              setPeriod("Personalizado")
            }}
          />
        </label>
        <label>
          Hasta{" "}
          <input
            aria-label="Fecha final"
            type="date"
            value={end}
            min={start}
            onChange={(e) => {
              setEnd(e.target.value)
              setPeriod("Personalizado")
            }}
          />
        </label>
        <small>Histórico de muestra + actividad de la sesión</small>
      </div>
      <div className="metric-grid">
        <Metric
          icon={WalletCards}
          label="Ingresos totales"
          value={money(revenue)}
          note={branch}
        />
        <Metric
          icon={BarChart3}
          label="Crecimiento global"
          value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
          note="Frente al período anterior equivalente"
        />
        <Metric
          icon={ShoppingBag}
          label="Operaciones de venta"
          value={count}
          note="Cobros efectivos, sin anulaciones"
        />
        <Metric
          icon={Eye}
          label="Ticket promedio"
          value={money(count ? revenue / count : 0)}
          note="Ingreso neto / operaciones"
        />
      </div>
      <div className="dashboard-grid">
        <article className="panel sales-chart">
          <div className="panel-head">
            <div>
              <h3>Evolución de ingresos</h3>
              <p>
                {start} — {end} · {branch}
              </p>
            </div>
          </div>
          <div className="chart">
            <div className="y-axis">
              {[1, 0.75, 0.5, 0.25, 0].map((v) => (
                <span key={v}>{money(max * v)}</span>
              ))}
            </div>
            <div className="bars">
              {slots.map((s, i) => (
                <div className="bar-col" key={i}>
                  <div
                    className="bar"
                    style={{ height: `${Math.max(1, (s.value / max) * 90)}%` }}
                  >
                    <span>{money(s.value)}</span>
                  </div>
                  <small>{s.label}</small>
                </div>
              ))}
            </div>
          </div>
        </article>
        <article className="panel order-summary">
          <div className="panel-head">
            <div>
              <h3>Pedidos por estado</h3>
              <p>Operación actual de {branch}</p>
            </div>
          </div>
          <div className="donut">
            <svg viewBox="0 0 42 42" aria-label="Pedidos por estado">
              <circle
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                stroke="#EEEEEE"
                strokeWidth="7"
              />
              {stateCounts.map((n, i) => {
                const amount = scopedOrders.length
                  ? (n / scopedOrders.length) * 100
                  : 0
                const el = (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    stroke={palette[i]}
                    strokeWidth="7"
                    strokeDasharray={`${amount} ${100 - amount}`}
                    strokeDashoffset={25 - offset}
                  />
                )
                offset += amount
                return el
              })}
            </svg>
            <div>
              <strong>{scopedOrders.length}</strong>
              <span>pedidos</span>
            </div>
          </div>
          <div className="legend">
            {states.map((s, i) => (
              <span key={s}>
                <i style={{ background: palette[i] }} />
                {s}
                <b>{stateCounts[i]}</b>
              </span>
            ))}
          </div>
        </article>
      </div>
      <div className="insight-grid">
        <article className="panel insight-card">
          <div className="panel-head">
            <div>
              <h3>Ventas entre sedes</h3>
              <p>Comparativa en el período seleccionado</p>
            </div>
          </div>
          <div className="rank-list">
            {d.branches
              .filter((b) => branch === "Todas las sedes" || branch === b.name)
              .map((b) => (
                <span key={b.id}>
                  <b>{b.name}</b>
                  <em>
                    {money(
                      ps
                        .filter((p) => p.branch === b.name)
                        .reduce((s, p) => s + p.amount, 0),
                    )}
                  </em>
                </span>
              ))}
          </div>
        </article>
        <article className="panel insight-card">
          <div className="panel-head">
            <div>
              <h3>Los 5 más vendidos</h3>
              <p>Comandas de la sesión</p>
            </div>
          </div>
          <div className="rank-list">
            {ranking.map((p, i) => (
              <span key={p.id}>
                <b>
                  {i + 1}. {p.name}
                </b>
                <em>{p.qty} unid.</em>
              </span>
            ))}
          </div>
        </article>
        <article className="panel insight-card">
          <div className="panel-head">
            <div>
              <h3>Métodos de pago</h3>
              <p>Recaudación neta</p>
            </div>
          </div>
          <div className="rank-list">
            {["Efectivo", "Yape", "Plin", "Tarjeta"].map((m) => (
              <span key={m}>
                <b>{m}</b>
                <em>
                  {money(
                    ps
                      .filter((p) => p.method === m)
                      .reduce((s, p) => s + p.amount, 0),
                  )}
                </em>
              </span>
            ))}
          </div>
        </article>
      </div>
    </>
  )
}
export function OperationalDashboard({
  branch,
  navigate,
}: {
  branch: string
  navigate: (view: string) => void
}) {
  const d = useDemoData()
  const ps = d.payments.filter(
    (p) => p.branch === branch && dateValue(p.time) === dateValue(),
  )
  const os = d.orders.filter(
    (o) => o.branch === branch && !["Anulado", "Entregado"].includes(o.status),
  )
  const tables = d.tablesFor(branch)
  const alerts = d
    .productsFor(branch)
    .filter((p) => p.stockActual <= p.stockMinimo)
  return (
    <>
      <div className="metric-grid">
        <Metric
          icon={WalletCards}
          label={`Ventas del día · ${branch}`}
          value={money(ps.reduce((s, p) => s + p.amount, 0))}
          note="Todos los canales de la sucursal"
        />
        <Metric
          icon={ShoppingBag}
          label="Pedidos activos"
          value={os.length}
          note="Salón, Para llevar y Delivery"
        />
        <Metric
          icon={Utensils}
          label="Mesas ocupadas"
          value={`${tables.filter((t) => ["Ocupada", "Cuenta solicitada"].includes(t.status)).length} / ${tables.length}`}
          note={`${tables.filter((t) => t.status === "Cuenta solicitada").length} cuentas solicitadas`}
        />
        <Metric
          icon={Boxes}
          label="Alertas de stock"
          value={alerts.length}
          note={`${alerts.filter((p) => !p.stockActual).length} agotados · Productos de venta`}
        />
      </div>
      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Operación en tiempo real</h3>
              <p>Solo la sede asignada: {branch}</p>
            </div>
            <button onClick={() => navigate("Pedidos")}>
              Ver pedidos <ArrowRight size={15} />
            </button>
          </div>
          <div className="rank-list option-padding">
            {os.slice(0, 6).map((o) => (
              <span key={o.id}>
                <b>
                  #{o.id} · {o.table ? `Mesa ${o.table}` : o.channel}
                </b>
                <em>
                  {o.status} · {money(total(o))}
                </em>
              </span>
            ))}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Disponibilidad en tienda</h3>
              <p>Productos con saldo bajo o agotado</p>
            </div>
            <button onClick={() => navigate("Inventario en Tienda")}>
              Ver inventario <ArrowRight size={15} />
            </button>
          </div>
          <div className="rank-list option-padding">
            {alerts.map((p) => (
              <span key={p.id}>
                <b>{p.name}</b>
                <em>
                  {p.stockActual} unid. · {stockStatus(p)}
                </em>
              </span>
            ))}
          </div>
        </article>
      </div>
      <div className="insight-grid">
        {["mesero", "repartidor", "cocinero"].map((role) => (
          <article className="panel insight-card" key={role}>
            <div className="panel-head">
              <div>
                <h3>
                  {role === "mesero"
                    ? "Atención de salón"
                    : role === "repartidor"
                      ? "Desempeño de reparto"
                      : "Equipo de cocina"}
                </h3>
                <p>Personal de {branch}</p>
              </div>
            </div>
            <div className="rank-list">
              {d.employees
                .filter((e) => e.branch === branch && e.role === role)
                .map((e) => (
                  <span key={e.id}>
                    <b>{e.name}</b>
                    <em>
                      {e.shift} ·{" "}
                      {role === "repartidor"
                        ? `${d.orders.filter((o) => o.rider === e.name && o.delivery === "ENTREGADO").length} entregas`
                        : e.active
                          ? "Activo"
                          : "Inactivo"}
                    </em>
                  </span>
                ))}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
export function FinancialReports({
  branch,
  operational = false,
}: {
  branch: string
  operational?: boolean
}) {
  const d = useDemoData()
  const [start, setStart] = useState(dateValue(Date.now() - 6 * 86400000))
  const [end, setEnd] = useState(dateValue())
  const [method, setMethod] = useState("Todos")
  const [notice, setNotice] = useState("")
  const ps = d.payments
    .filter(
      (p) =>
        (branch === "Todas las sedes" || p.branch === branch) &&
        dateValue(p.time) >= start &&
        dateValue(p.time) <= end &&
        (method === "Todos" || p.method === method),
    )
    .sort((a, b) => b.time - a.time)
  const closures = d.closures.filter(
    (c) =>
      (branch === "Todas las sedes" || c.branch === branch) &&
      dateValue(c.time) >= start &&
      dateValue(c.time) <= end,
  )
  return (
    <>
      <div className="filters management-period">
        <label>
          Desde{" "}
          <input
            aria-label="Reporte desde"
            type="date"
            value={start}
            max={end}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          Hasta{" "}
          <input
            aria-label="Reporte hasta"
            type="date"
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <select
          aria-label="Método del reporte"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="Todos">Todos los métodos</option>
          {["Efectivo", "Yape", "Plin", "Tarjeta"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="metric-grid">
        {["Efectivo", "Yape", "Plin", "Tarjeta"].map((m) => (
          <Metric
            key={m}
            icon={WalletCards}
            label={m}
            value={money(
              ps
                .filter((p) => p.method === m)
                .reduce((s, p) => s + p.amount, 0),
            )}
            note={branch}
          />
        ))}
      </div>
      {operational && (
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Supervisión de caja y liquidaciones</h3>
              <p>
                Caja 01 · {d.cashSessions[branch]?.open ? "Abierta" : "Cerrada"}{" "}
                · Fondo {money(d.cashSessions[branch]?.opening || 0)}
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Repartidor</th>
                  <th>Importe</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {d.orders
                  .filter(
                    (o) =>
                      o.branch === branch &&
                      o.delivery === "ENTREGADO" &&
                      o.method === "Efectivo" &&
                      !o.settled,
                  )
                  .map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.rider}</td>
                      <td>{money(total(o))}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          disabled={!d.cashSessions[branch]?.open}
                          onClick={() => {
                            if (d.settleDelivery(o.id))
                              setNotice(`Cobro #${o.id} liquidado.`)
                          }}
                        >
                          Liquidar cobro
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {notice && (
            <p className="option-empty" role="status">
              {notice}
            </p>
          )}
        </article>
      )}
      <article className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Ventas por fecha y sede</h3>
            <p>
              {ps.length} movimientos · Total neto{" "}
              {money(ps.reduce((s, p) => s + p.amount, 0))}
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "Fecha",
                  "Sede",
                  "Comprobante",
                  "Pedido",
                  "Método",
                  "Importe",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ps.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.time).toLocaleString("es-PE")}</td>
                  <td>{p.branch}</td>
                  <td>{p.receipt}</td>
                  <td>
                    {p.orderIds.length
                      ? p.orderIds.map((id) => `#${id}`).join(", ")
                      : "Histórico demo"}
                  </td>
                  <td>{p.method}</td>
                  <td>
                    <b>{money(p.amount)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!ps.length && (
            <p className="option-empty">No hay ventas con estos filtros.</p>
          )}
        </div>
      </article>
      <article className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Resumen de cierres de caja</h3>
            <p>Cierres reales de la sesión y registros históricos demo</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "Fecha",
                  "Cajero",
                  "Sede",
                  "Efectivo",
                  "Yape",
                  "Plin",
                  "Tarjeta",
                  "Diferencia",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closures.map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.time).toLocaleString("es-PE")}</td>
                  <td>{c.cashier}</td>
                  <td>{c.branch}</td>
                  <td>{money(c.cash)}</td>
                  <td>{money(c.yape)}</td>
                  <td>{money(c.plin)}</td>
                  <td>{money(c.card)}</td>
                  <td>{money(c.difference)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!closures.length && (
            <p className="option-empty">No hay cierres para este período.</p>
          )}
        </div>
      </article>
    </>
  )
}
export function Promotions() {
  const d = useDemoData()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [notice, setNotice] = useState("")
  const promotion = d.promotions.find((p) => p.id === editing)
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const p: Promotion = {
      id: promotion?.id || Date.now(),
      name: String(f.get("name")).trim(),
      productId: Number(f.get("product")),
      discount: Number(f.get("discount")),
      start: String(f.get("start")),
      end: String(f.get("end")),
      active: promotion?.active ?? true,
    }
    if (p.start > p.end) {
      setNotice("La fecha final debe ser igual o posterior al inicio.")
      return
    }
    d.setPromotions((ps) =>
      promotion ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p],
    )
    d.log(`Campaña ${p.name} guardada`, "Todas las sedes", "Dueño")
    setEditing(null)
    setNotice("Promoción guardada. Se aplica en la carta durante su vigencia.")
  }
  return (
    <>
      <article className="panel table-panel module-panel">
        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Buscar campaña o combo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing("new")
              setNotice("")
            }}
          >
            <Plus size={16} /> Nueva promoción
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaña / combo</th>
                <th>Producto</th>
                <th>Descuento</th>
                <th>Vigencia</th>
                <th>Activa</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {d.promotions
                .filter((p) =>
                  p.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.name}</b>
                    </td>
                    <td>
                      {d.products.find((x) => x.id === p.productId)?.name}
                    </td>
                    <td>
                      <span className="promotion-badge">−{p.discount}%</span>
                    </td>
                    <td>
                      {p.start} — {p.end}
                    </td>
                    <td>
                      <button
                        className={`option-switch ${p.active ? "on" : ""}`}
                        role="switch"
                        aria-label={`Activar campaña ${p.name}`}
                        aria-checked={p.active}
                        onClick={() =>
                          d.setPromotions((ps) =>
                            ps.map((x) =>
                              x.id === p.id ? { ...x, active: !x.active } : x,
                            ),
                          )
                        }
                      >
                        <span />
                      </button>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={`Editar campaña ${p.name}`}
                        onClick={() => {
                          setEditing(p.id)
                          setNotice("")
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
      {notice && (
        <p className="option-empty" role="status">
          {notice}
        </p>
      )}
      {editing !== null && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <section
            className="form-modal admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Promoción"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Cerrar promoción"
              onClick={() => setEditing(null)}
            >
              <X />
            </button>
            <span className="kicker">CAMPAÑAS Y COMBOS</span>
            <h2>{promotion ? "Editar promoción" : "Nueva promoción"}</h2>
            <form onSubmit={submit}>
              <label>
                Nombre de campaña o combo
                <input
                  name="name"
                  defaultValue={promotion?.name}
                  required
                  minLength={3}
                />
              </label>
              <label>
                Producto terminado / combo
                <select name="product" defaultValue={promotion?.productId}>
                  {d.products
                    .filter((p) => p.active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Descuento (%)
                <input
                  name="discount"
                  type="number"
                  min="1"
                  max="90"
                  defaultValue={promotion?.discount || 10}
                  required
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Desde
                  <input
                    name="start"
                    type="date"
                    defaultValue={promotion?.start || dateValue()}
                    required
                  />
                </label>
                <label>
                  Hasta
                  <input
                    name="end"
                    type="date"
                    defaultValue={
                      promotion?.end || dateValue(Date.now() + 7 * 86400000)
                    }
                    required
                  />
                </label>
              </div>
              {notice && <p className="modal-copy">{notice}</p>}
              <div className="option-form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit">
                  Guardar promoción
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
export function TableOverview({ branch }: { branch: string }) {
  const d = useDemoData()
  const [selected, setSelected] = useState<number | null>(null)
  const tables = d.tablesFor(branch)
  return (
    <>
      <div className="table-legend">
        {["Libre", "Ocupada", "Reservada", "Cuenta solicitada"].map((s, i) => (
          <span key={s}>
            <i className={["free", "busy", "reserved", "bill"][i]} />
            {s}
          </span>
        ))}
      </div>
      <div className="tables-grid detailed">
        {tables.map((t) => (
          <button
            key={t.id}
            className={`${
              t.status === "Libre"
                ? "free"
                : t.status === "Ocupada"
                  ? "busy"
                  : t.status === "Reservada"
                    ? "reserved"
                    : "bill"
            } ${selected === t.id ? "selected" : ""}`}
            onClick={() => setSelected(t.id)}
          >
            <div>
              <Utensils />
              <span className="status neutral">{t.status}</span>
            </div>
            <b>Mesa {String(t.id).padStart(2, "0")}</b>
            <small>
              {t.capacity} personas · {t.waiter}
            </small>
            <span>
              {t.guests} comensales · {t.minutes} min
            </span>
            <strong>{money(t.total)}</strong>
          </button>
        ))}
      </div>
      {selected && (
        <article className="panel option-padding">
          <div className="panel-head">
            <div>
              <h3>
                Mesa {selected} · {branch}
              </h3>
              <p>{tables.find((t) => t.id === selected)?.status}</p>
            </div>
          </div>
          <div className="rank-list">
            {d.orders
              .filter(
                (o) =>
                  o.branch === branch &&
                  !o.paid &&
                  o.status !== "Anulado" &&
                  (o.table === selected || o.tableGroup?.includes(selected)),
              )
              .map((o) => (
                <span key={o.id}>
                  <b>
                    #{o.id} · {o.status}
                  </b>
                  <em>{money(total(o))}</em>
                </span>
              ))}
          </div>
          <button
            className="btn btn-outline"
            disabled={
              !d.orders.some(
                (o) =>
                  o.branch === branch &&
                  !o.paid &&
                  o.status !== "Anulado" &&
                  (o.table === selected || o.tableGroup?.includes(selected)),
              )
            }
            onClick={() => {
              d.requestBill(branch, [selected])
            }}
          >
            Solicitar cuenta
          </button>
        </article>
      )}
    </>
  )
}
