import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Lock,
  Minus,
  Pencil,
  Plus,
  Search,
  Settings,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react"
import {
  initialProducts,
  money,
  roles,
  stockStatus,
  total,
  type Employee,
  type Movement,
  type Order,
  type Product,
} from "./model"

import { useDemoData } from "./DemoContext"
import { AuditPanel } from "./ManagementPanels"

function StateTag({ children }: { children: ReactNode }) {
  const value = String(children)
  return (
    <span
      className={`status ${
        ["Stock disponible", "Activo", "Listo", "Entregado"].includes(value)
          ? "success"
          : value === "Stock bajo"
            ? "warning"
            : ["Agotado", "Anulado"].includes(value)
              ? "danger"
              : "neutral"
      }`}
    >
      <i />
      {children}
    </span>
  )
}
function Action({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  secondary?: boolean
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn ${secondary ? "btn-outline" : "btn-primary"}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
interface ModalState {
  kind: string
  id?: number
  direction?: "entry" | "exit"
  name?: string
}
export default function StoreOptions({
  active,
  role,
  branchScope,
}: {
  active: string
  role: string
  branchScope: string
}) {
  const d = useDemoData()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [state, setState] = useState("Todos")
  const [branch, setBranch] = useState("Todos")
  const [modal, setModal] = useState<ModalState | null>(null)
  const [notice, setNotice] = useState("")
  const [userState, setUserState] = useState("Todos")
  const scopedProducts = d.productsFor(branchScope)
  const [history, setHistory] = useState(false)
  const [catalogTab, setCatalogTab] = useState("Productos")
  useEffect(() => {
    setSearch("")
    setCategory("Todos")
    setState("Todos")
    setBranch("Todos")
    setHistory(active === "Movimientos de tienda")
  }, [active, role])
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(""), 3500)
    return () => clearTimeout(t)
  }, [notice])
  useEffect(() => {
    if (!modal) return
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null)
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [modal])
  const product = d.products.find((p) => p.id === modal?.id)
  const employee = d.employees.find((e) => e.id === modal?.id)
  const sede = d.branches.find((b) => b.id === modal?.id)
  const order = d.orders.find((o) => o.id === modal?.id)
  const low = scopedProducts.filter((p) => stockStatus(p) === "Stock bajo")
  const out = scopedProducts.filter((p) => !p.stockActual)
  const filtered = scopedProducts.filter(
    (p) =>
      `${p.name} PRD-${String(p.id).padStart(3, "0")}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "Todos" || p.category === category) &&
      (state === "Todos" || stockStatus(p) === state),
  )
  const searchInput = (placeholder = "Buscar producto o código...") => (
    <div className="search-box">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
  const exportData = () => {
    const csv = history
      ? [
          "Fecha,Producto,Tipo,Cantidad,Observación",
          ...d.movements
            .filter((m) => m.branch === branchScope)
            .filter((m) =>
              (m.product + m.note).toLowerCase().includes(search.toLowerCase()),
            )
            .map(
              (m) =>
                `"${new Date(m.time).toLocaleString("es-PE")}","${m.product}",${m.type},${m.qty},"${m.note.replace(/"/g, '""')}"`,
            ),
        ].join("\n")
      : [
          "Producto,Stock actual,Stock mínimo,Estado",
          ...filtered.map(
            (p) =>
              `"${p.name}",${p.stockActual},${p.stockMinimo},${stockStatus(p)}`,
          ),
        ].join("\n")
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "stock-tienda.csv"
    a.click()
    URL.revokeObjectURL(url)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    const s = (k: string) => String(f.get(k) || "")
    const n = (k: string) => Number(f.get(k))
    switch (modal?.kind) {
      case "movement":
        if (
          !n("qty") ||
          (s("type") === "INGRESO_TIENDA" && n("qty") < 0) ||
          !d.adjust(
            n("product"),
            n("qty"),
            s("type") as Movement["type"],
            s("note"),
            branchScope,
          )
        ) {
          setNotice(
            "La cantidad debe ser entera y el saldo no puede ser negativo.",
          )
          return
        }
        setNotice("Movimiento registrado. Stock actualizado.")
        break
      case "product": {
        const p: Product = {
          id: product?.id || Math.max(0, ...d.products.map((p) => p.id)) + 1,
          name: s("name"),
          description: s("description"),
          category: s("category"),
          price: n("price"),
          stockActual: product?.stockActual || 0,
          stockMinimo: product?.stockMinimo ?? 5,
          active: product?.active ?? true,
          available: product?.available ?? true,
          image: product?.image || initialProducts[0].image,
        }
        d.setProducts((ps) =>
          product ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p],
        )
        setNotice("Producto guardado.")
        break
      }
      case "category":
        if (
          d.categories.some(
            (c) =>
              c !== modal.name &&
              c.toLowerCase() === s("name").trim().toLowerCase(),
          )
        ) {
          setNotice("Esta categoría ya existe.")
          return
        }
        if (modal.name) {
          d.setCategories((cs) =>
            cs.map((c) => (c === modal.name ? s("name").trim() : c)),
          )
          d.setProducts((ps) =>
            ps.map((p) =>
              p.category === modal.name
                ? { ...p, category: s("name").trim() }
                : p,
            ),
          )
          if (category === modal.name) setCategory(s("name").trim())
        } else d.setCategories((cs) => [...cs, s("name").trim()])
        d.log(
          `Categoría ${s("name").trim()} guardada`,
          "Todas las sedes",
          "Dueño",
        )
        setNotice("Categoría guardada.")
        break
      case "user": {
        if (
          d.employees.some(
            (e) =>
              e.id !== employee?.id &&
              e.email.toLowerCase() === s("email").trim().toLowerCase(),
          )
        ) {
          setNotice("Este correo ya pertenece a otro usuario.")
          return
        }
        const e: Employee = {
          id: employee?.id || Date.now(),
          name: s("name"),
          email: s("email"),
          role: s("role") as Employee["role"],
          branch: s("branch"),
          shift: s("shift"),
          active: s("active") === "Activo",
        }
        if (
          employee &&
          d.orders.some(
            (o) =>
              o.rider === employee.name &&
              o.status !== "Anulado" &&
              ["ASIGNADO", "EN_RUTA"].includes(o.delivery),
          ) &&
          (!e.active ||
            e.role !== "repartidor" ||
            e.branch !== employee.branch ||
            e.name !== employee.name)
        ) {
          setNotice(
            "Este repartidor tiene entregas pendientes. Complétalas antes de cambiar su acceso, nombre o sede.",
          )
          return
        }
        d.setEmployees((es) =>
          employee ? es.map((x) => (x.id === e.id ? e : x)) : [...es, e],
        )
        d.log(
          `Usuario ${e.name}: rol ${roles[e.role]}, sede ${e.branch}`,
          e.branch,
        )
        setNotice("Usuario guardado.")
        break
      }
      case "reset":
        d.setEmployees((es) =>
          es.map((e) => (e.id === modal.id ? { ...e, reset: true } : e)),
        )
        d.log(
          `Contraseña restablecida para ${employee?.name}`,
          employee?.branch,
        )
        setNotice(
          "Clave temporal demo: Bros2025! · Cambio requerido al ingresar.",
        )
        break
      case "delete":
        if (
          employee &&
          d.orders.some(
            (o) =>
              o.rider === employee.name &&
              ["ASIGNADO", "EN_RUTA"].includes(o.delivery) &&
              o.status !== "Anulado",
          )
        ) {
          setNotice(
            "Este repartidor tiene entregas pendientes. Completa o reasigna sus entregas antes de eliminarlo.",
          )
          return
        }
        d.setEmployees((es) => es.filter((e) => e.id !== modal.id))
        d.log(`Usuario ${employee?.name} eliminado`, employee?.branch)
        setNotice("Usuario eliminado.")
        break
      case "branch": {
        if (!sede) return
        if (
          d
            .tablesFor(sede.name)
            .some((t) => t.id > n("tableCount") && t.status !== "Libre")
        ) {
          setNotice("Libera las mesas antes de reducir su cantidad.")
          return
        }
        const b = {
          ...sede,
          address: s("address"),
          phone: s("phone"),
          hours: s("hours"),
          tableCount: n("tableCount"),
          active: s("active") === "Activo",
        }
        d.setBranches((bs) => bs.map((x) => (x.id === b.id ? b : x)))
        d.log(`Sede ${b.name} actualizada · ${b.tableCount} mesas`, b.name)
        setNotice("Sede guardada.")
        break
      }
      case "cancel":
        if (!order || !d.cancelOrder(order.id, s("note"))) {
          setNotice(
            "No se puede anular esta entrega. Revisa el motivo y su estado.",
          )
          return
        }
        setNotice("Anulación autorizada. Stock restituido.")
        break
    }
    setModal(null)
  }
  let content: ReactNode
  if (active === "Dashboard" && role === "superadmin") {
    content = (
      <>
        <div className="metric-grid">
          {[
            {
              label: "Usuarios registrados",
              value: d.employees.length,
              note: "8 roles del sistema",
              icon: Users,
            },
            {
              label: "Usuarios activos",
              value: d.employees.filter((e) => e.active).length,
              note: "Accesos habilitados",
              icon: Lock,
            },
            {
              label: "Sedes operativas",
              value: d.branches.filter((b) => b.active).length,
              note: "Locales conectados",
              icon: Store,
            },
            {
              label: "Servicios",
              value: "4 / 4",
              note: "Entorno demo operativo",
              icon: Settings,
            },
          ].map((m) => (
            <article className="metric-card" key={m.label}>
              <div className="metric-icon">
                <m.icon size={20} />
              </div>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
              <small>{m.note}</small>
            </article>
          ))}
        </div>
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Seguridad y servicios</h3>
              <p>Configuración técnica del sistema</p>
            </div>
          </div>
          <div className="movement-list option-padding">
            {[
              "Aplicación web",
              "Control de accesos",
              "Monitor KDS",
              "Comprobantes demo",
            ].map((s) => (
              <span key={s}>
                <b>{s}</b>Operativo · Simulación local
              </span>
            ))}
          </div>
        </article>
      </>
    )
  } else if (
    active === "Inventario" ||
    active === "Movimientos de tienda" ||
    (active === "Dashboard" && role === "admin")
  ) {
    const showHistory = history
    content = (
      <>
        <div className="stock-alerts">
          <article>
            <AlertTriangle />
            <div>
              <b>STOCK BAJO</b>
              <span>{low.length} productos necesitan atención.</span>
            </div>
            <button
              onClick={() => {
                setState("Stock bajo")
                setHistory(false)
              }}
            >
              Ver productos
            </button>
          </article>
          <article className="out">
            <X />
            <div>
              <b>AGOTADO</b>
              <span>{out.length} productos no disponibles para vender.</span>
            </div>
            <button
              onClick={() => {
                setState("Agotado")
                setHistory(false)
              }}
            >
              Ver agotados
            </button>
          </article>
        </div>
        <div className="inventory-summary">
          <div>
            <Boxes />
            <span>
              <b>{d.products.length}</b> productos de venta
            </span>
          </div>
          <div>
            <CheckCircle2 />
            <span>
              <b>
                {
                  scopedProducts.filter((p) => p.stockActual > p.stockMinimo)
                    .length
                }
              </b>{" "}
              con stock disponible
            </span>
          </div>
          <div>
            <Store />
            <span>
              <b>{branchScope}</b> stock directo en tienda
            </span>
          </div>
        </div>
        <article className="panel table-panel module-panel">
          <div className="filters">
            {searchInput()}
            {!showHistory && (
              <>
                <select
                  aria-label="Categoría"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Todos">Todas las categorías</option>
                  {d.categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  aria-label="Estado de stock"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="Todos">Todos los estados</option>
                  <option>Stock disponible</option>
                  <option>Stock bajo</option>
                  <option>Agotado</option>
                </select>
              </>
            )}
            <Action secondary onClick={() => setHistory(!history)}>
              <Clock3 size={16} />
              {showHistory ? "Ver productos" : "Ver movimientos"}
            </Action>
            <Action secondary onClick={exportData}>
              Exportar
            </Action>
            <Action
              secondary
              onClick={() => setModal({ kind: "movement", direction: "exit" })}
            >
              <Minus size={16} /> Registrar salida/ajuste
            </Action>
            <Action
              onClick={() => setModal({ kind: "movement", direction: "entry" })}
            >
              <Plus size={16} /> Registrar entrada
            </Action>
          </div>
          <div className="table-wrap">
            <table>
              {showHistory ? (
                <>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Observación</th>
                      <th>Sede</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.movements
                      .filter((m) => m.branch === branchScope)
                      .filter((m) =>
                        (m.product + m.note)
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((m) => (
                        <tr key={m.id}>
                          <td>{new Date(m.time).toLocaleString("es-PE")}</td>
                          <td>{m.product}</td>
                          <td>{m.type}</td>
                          <td>
                            <b>
                              {m.qty > 0 ? "+" : ""}
                              {m.qty}
                            </b>
                          </td>
                          <td>{m.note}</td>
                          <td>{m.branch}</td>
                        </tr>
                      ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Sede</th>
                      <th>Stock actual</th>
                      <th>Stock mínimo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <b>PRD-{String(p.id).padStart(3, "0")}</b>
                        </td>
                        <td>
                          <b>{p.name}</b>
                        </td>
                        <td>{p.category}</td>
                        <td>{branchScope}</td>
                        <td>
                          <b>{p.stockActual}</b> unid.
                        </td>
                        <td>{p.stockMinimo} unid.</td>
                        <td>
                          <StateTag>{stockStatus(p)}</StateTag>
                        </td>
                        <td>
                          <button
                            role="switch"
                            aria-label={`Disponible ${p.name}`}
                            aria-checked={
                              p.available && p.active && p.stockActual > 0
                            }
                            disabled={!p.stockActual || !p.active}
                            className={`option-switch ${
                              p.available && p.active && p.stockActual > 0
                                ? "on"
                                : ""
                            }`}
                            onClick={() =>
                              d.setAvailable(p.id, !p.available, branchScope)
                            }
                          >
                            <span />
                          </button>
                          <div className="qty-control">
                            <button
                              aria-label={`Restar ${p.name}`}
                              disabled={!p.stockActual}
                              onClick={() =>
                                d.adjust(
                                  p.id,
                                  -1,
                                  "AJUSTE_ENCARGADO",
                                  "Ajuste rápido",
                                  branchScope,
                                )
                              }
                            >
                              <Minus />
                            </button>
                            <span>{p.stockActual}</span>
                            <button
                              aria-label={`Sumar ${p.name}`}
                              onClick={() =>
                                d.adjust(
                                  p.id,
                                  1,
                                  "AJUSTE_ENCARGADO",
                                  "Ajuste rápido",
                                  branchScope,
                                )
                              }
                            >
                              <Plus />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
            {!filtered.length && !showHistory && (
              <p className="option-empty">
                No hay productos con estos filtros.
              </p>
            )}
          </div>
        </article>
      </>
    )
  } else if (active === "Usuarios" || active === "Personal del local") {
    const personnel = active === "Personal del local"
    const list = d.employees.filter(
      (e) =>
        (e.name + e.email).toLowerCase().includes(search.toLowerCase()) &&
        (state === "Todos" || e.role === state) &&
        (userState === "Todos" || (userState === "Activo") === e.active) &&
        (branch === "Todos" || e.branch === branch) &&
        (!personnel ||
          (e.branch === branchScope &&
            ["mesero", "cajero", "cocinero", "repartidor"].includes(e.role))),
    )
    content = (
      <article className="panel table-panel module-panel">
        <div className="filters">
          {searchInput("Buscar nombre o correo...")}
          {!personnel && (
            <>
              <select
                aria-label="Filtrar rol"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="Todos">Todos los roles</option>
                {Object.entries(roles).map(([k, v]) => (
                  <option value={k} key={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar sede"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="Todos">Todas las sedes</option>
                {d.branches.map((b) => (
                  <option key={b.id}>{b.name}</option>
                ))}
              </select>
              <select
                aria-label="Filtrar estado de usuario"
                value={userState}
                onChange={(e) => setUserState(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <Action onClick={() => setModal({ kind: "user" })}>
                <Plus size={16} /> Crear usuario
              </Action>
            </>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Rol</th>
                <th>Sede</th>
                <th>Turno</th>
                <th>Estado</th>
                {!personnel && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>
                    <b>{e.name}</b>
                    <small className="option-code">{e.email}</small>
                  </td>
                  <td>{roles[e.role]}</td>
                  <td>{e.branch}</td>
                  <td>
                    <select
                      className="option-select"
                      aria-label={`Turno ${e.name}`}
                      value={e.shift}
                      onChange={(ev) =>
                        d.setEmployees((es) =>
                          es.map((x) =>
                            x.id === e.id
                              ? { ...x, shift: ev.target.value }
                              : x,
                          ),
                        )
                      }
                    >
                      {["Mañana", "Tarde"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {personnel ? (
                      <StateTag>{e.active ? "Activo" : "Inactivo"}</StateTag>
                    ) : (
                      <button
                        role="switch"
                        aria-label={`Estado ${e.name}`}
                        aria-checked={e.active}
                        className={`option-switch ${e.active ? "on" : ""}`}
                        onClick={() => {
                          if (
                            e.active &&
                            d.orders.some(
                              (o) =>
                                o.rider === e.name &&
                                o.status !== "Anulado" &&
                                ["ASIGNADO", "EN_RUTA"].includes(o.delivery),
                            )
                          ) {
                            setNotice(
                              "Completa las entregas pendientes antes de desactivar a este repartidor.",
                            )
                            return
                          }
                          d.setEmployees((es) =>
                            es.map((x) =>
                              x.id === e.id ? { ...x, active: !x.active } : x,
                            ),
                          )
                          d.log(
                            `Usuario ${e.name}: ${
                              e.active ? "Inactivo" : "Activo"
                            }`,
                            e.branch,
                          )
                        }}
                      >
                        <span />
                      </button>
                    )}
                  </td>
                  {!personnel && (
                    <td>
                      <button
                        className="icon-btn"
                        title="Editar usuario"
                        onClick={() => setModal({ kind: "user", id: e.id })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Resetear contraseña"
                        onClick={() => setModal({ kind: "reset", id: e.id })}
                      >
                        <Lock size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Eliminar usuario"
                        onClick={() => setModal({ kind: "delete", id: e.id })}
                      >
                        <Trash2 size={16} />
                      </button>
                      {e.reset && (
                        <small className="option-code">
                          Cambio de clave pendiente
                        </small>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && (
            <p className="option-empty">No se encontraron empleados.</p>
          )}
        </div>
      </article>
    )
  } else if (active === "Productos" || active === "Categorías") {
    content = (
      <article className="panel table-panel module-panel">
        <div
          className="report-tabs option-padding"
          role="tablist"
          aria-label="Catálogo maestro"
        >
          {["Productos", "Categorías"].map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={catalogTab === tab}
              className={catalogTab === tab ? "active" : ""}
              onClick={() => {
                setCatalogTab(tab)
                setSearch("")
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="filters">
          {searchInput(
            catalogTab === "Categorías"
              ? "Buscar categoría..."
              : "Buscar producto o código...",
          )}
          {catalogTab === "Productos" && (
            <select
              aria-label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Todos">Todas las categorías</option>
              {d.categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
          <Action secondary onClick={() => setModal({ kind: "category" })}>
            <Plus size={16} /> Nueva categoría
          </Action>
          <Action onClick={() => setModal({ kind: "product" })}>
            <Plus size={16} /> Nuevo producto
          </Action>
        </div>
        <div className="table-wrap">
          <table>
            {catalogTab === "Categorías" ? (
              <>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Productos en carta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {d.categories
                    .filter((c) =>
                      c.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((c) => (
                      <tr key={c}>
                        <td>
                          <b>{c}</b>
                        </td>
                        <td>
                          {d.products.filter((p) => p.category === c).length}
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            aria-label={`Editar categoría ${c}`}
                            onClick={() =>
                              setModal({ kind: "category", name: c })
                            }
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio oficial</th>
                    <th>Estado global</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <b>{p.name}</b>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <b>{money(p.price)}</b>
                      </td>
                      <td>
                        <button
                          role="switch"
                          aria-label={`Activar ${p.name}`}
                          aria-checked={p.active}
                          className={`option-switch ${p.active ? "on" : ""}`}
                          onClick={() =>
                            d.setProducts((ps) =>
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
                          aria-label={`Editar ${p.name}`}
                          onClick={() =>
                            setModal({ kind: "product", id: p.id })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </article>
    )
  } else if (active === "Sedes") {
    content = (
      <article className="panel table-panel module-panel">
        <div className="filters">
          {searchInput("Buscar sede...")}
          <span className="option-code">
            3 sedes oficiales · La Victoria es la Sede Principal
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sede</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Horario</th>
                <th>Mesas</th>
                <th>Estado operativo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {d.branches
                .filter((b) =>
                  (b.name + b.address)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b>
                        {b.name}
                        {b.name === "La Victoria" ? " (Sede Principal)" : ""}
                      </b>
                    </td>
                    <td>{b.address}</td>
                    <td>{b.phone}</td>
                    <td>{b.hours}</td>
                    <td>{b.tableCount}</td>
                    <td>
                      <StateTag>{b.active ? "Activo" : "Inactivo"}</StateTag>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={`Editar sede ${b.name}`}
                        onClick={() => setModal({ kind: "branch", id: b.id })}
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
    )
  } else if (active === "Parámetros técnicos") {
    content = (
      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Series de comprobantes</h3>
              <p>Configuración de la emisión demo</p>
            </div>
          </div>
          <form
            className="option-technical"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              d.setSeries({
                boleta: String(f.get("boleta")),
                factura: String(f.get("factura")),
              })
              d.log("Series de comprobantes actualizadas")
              setNotice("Series guardadas para los siguientes comprobantes.")
            }}
          >
            <label>
              Serie de boletas
              <input
                name="boleta"
                defaultValue={d.series.boleta}
                required
                pattern="B[0-9]{3}"
              />
            </label>
            <label>
              Serie de facturas
              <input
                name="factura"
                defaultValue={d.series.factura}
                required
                pattern="F[0-9]{3}"
              />
            </label>
            <Action type="submit">Guardar parámetros</Action>
          </form>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Estado de servicios</h3>
              <p>Servicios simulados en esta sesión</p>
            </div>
          </div>
          <div className="movement-list option-padding">
            {["Aplicación", "Accesos", "Cocina KDS", "Emisión demo"].map(
              (s) => (
                <span key={s}>
                  <b>{s}</b>Operativo
                </span>
              ),
            )}
          </div>
        </article>
      </div>
    )
  } else if (active === "Monitor operativo" || active === "Pedidos") {
    content = (
      <article className="panel table-panel module-panel">
        <div className="filters">
          {searchInput("Buscar pedido o cliente...")}
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            {["Pendiente", "Preparando", "Listo", "Entregado", "Anulado"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
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
              {d.orders
                .filter(
                  (o) =>
                    o.branch === branchScope &&
                    `${o.id} ${o.customer}`
                      .toLowerCase()
                      .includes(search.toLowerCase()) &&
                    (state === "Todos" || o.status === state),
                )
                .map((o) => (
                  <tr key={o.id}>
                    <td>
                      <b>#{o.id}</b>
                    </td>
                    <td>{o.table ? `Mesa ${o.table}` : o.customer}</td>
                    <td>{o.channel}</td>
                    <td>
                      <StateTag>{o.status}</StateTag>
                      {role === "admin" &&
                        o.status !== "Anulado" &&
                        o.delivery !== "ENTREGADO" && (
                          <select
                            className="option-select"
                            aria-label={`Estado del pedido #${o.id}`}
                            value={o.status}
                            onChange={(e) => {
                              d.updateOrder(o.id, {
                                status: e.target.value as Order["status"],
                                served: false,
                              })
                              d.log(
                                `Pedido #${o.id}: ${e.target.value}`,
                                o.branch,
                                "Gerente",
                              )
                            }}
                          >
                            <option>Pendiente</option>
                            <option>Preparando</option>
                            <option>Listo</option>
                            {o.channel !== "Delivery Web" && (
                              <option>Entregado</option>
                            )}
                          </select>
                        )}
                      {o.reason && (
                        <small className="option-code">{o.reason}</small>
                      )}
                    </td>
                    <td>{money(total(o))}</td>
                    <td>
                      <Action
                        secondary
                        disabled={
                          o.status === "Anulado" || o.delivery === "ENTREGADO"
                        }
                        onClick={() =>
                          setModal({
                            kind: role === "admin" ? "cancel" : "detail",
                            id: o.id,
                          })
                        }
                      >
                        {role === "admin"
                          ? "Autorizar anulación"
                          : "Ver detalle"}
                      </Action>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    )
  } else if (active === "Cierres de caja") {
    content = (
      <article className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Auditoría de cierres de caja</h3>
            <p>Histórico demo de recaudación por cajero y método</p>
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
                  "Yape / Plin",
                  "Tarjeta",
                  "Total",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["20/06/2025", "Lucía Vega", "La Victoria", 1480, 1120, 860],
                ["19/06/2025", "Ana López", "Ferreñafe", 980, 850, 640],
              ].map((r, i) => (
                <tr key={i}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{money(Number(r[3]))}</td>
                  <td>{money(Number(r[4]))}</td>
                  <td>{money(Number(r[5]))}</td>
                  <td>
                    <b>{money(Number(r[3]) + Number(r[4]) + Number(r[5]))}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    )
  } else {
    content = null
  }
  const titles: Record<string, string> = {
    movement:
      modal?.direction === "exit"
        ? "Registrar salida/ajuste"
        : "Registrar entrada",
    product: product ? "Editar producto" : "Nuevo producto",
    category: modal?.name ? "Editar categoría" : "Nueva categoría",
    user: employee ? "Editar usuario" : "Crear usuario",
    reset: "Resetear contraseña",
    delete: "Eliminar usuario",
    branch: sede ? "Editar sede" : "Nueva sede",
    cancel: "Autorizar anulación",
    detail: `Pedido #${order?.id}`,
  }
  return (
    <>
      {content}
      {(active === "Parámetros técnicos" ||
        (active === "Dashboard" && role === "superadmin")) && <AuditPanel />}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="form-modal admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={titles[modal.kind]}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Cerrar"
              onClick={() => setModal(null)}
            >
              <X />
            </button>
            <span className="kicker">BROS CHICKEN · DEMO</span>
            <h2>{titles[modal.kind]}</h2>
            <form onSubmit={submit}>
              {modal.kind === "movement" && (
                <>
                  <label>
                    Producto
                    <select name="product">
                      {scopedProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.stockActual} unid.
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tipo de movimiento
                    <select
                      name="type"
                      defaultValue={
                        modal.direction === "exit"
                          ? "AJUSTE_ENCARGADO"
                          : "INGRESO_TIENDA"
                      }
                    >
                      <option value="INGRESO_TIENDA">Ingreso a tienda</option>
                      <option value="AJUSTE_ENCARGADO">
                        Ajuste del encargado
                      </option>
                    </select>
                  </label>
                  <label>
                    Cantidad (negativa para descontar en un ajuste)
                    <input
                      name="qty"
                      type="number"
                      required
                      step="1"
                      defaultValue={modal.direction === "exit" ? "-1" : "10"}
                    />
                  </label>
                  <label>
                    Observación
                    <textarea name="note" required minLength={4} />
                  </label>
                </>
              )}
              {modal.kind === "product" && (
                <>
                  <label>
                    Nombre
                    <input name="name" defaultValue={product?.name} required />
                  </label>
                  <label>
                    Descripción
                    <textarea
                      name="description"
                      defaultValue={product?.description}
                      required
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Categoría
                      <select name="category" defaultValue={product?.category}>
                        {d.categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Precio oficial (S/)
                      <input
                        type="number"
                        name="price"
                        min=".1"
                        step=".01"
                        defaultValue={product?.price || 25}
                        required
                      />
                    </label>
                  </div>
                </>
              )}
              {modal.kind === "category" && (
                <label>
                  Nombre de categoría
                  <input
                    name="name"
                    defaultValue={modal.name}
                    required
                    minLength={3}
                  />
                </label>
              )}
              {modal.kind === "user" && (
                <>
                  <label>
                    Nombre completo
                    <input name="name" required defaultValue={employee?.name} />
                  </label>
                  <label>
                    Correo electrónico
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={employee?.email}
                    />
                  </label>
                  <label>
                    Rol
                    <select
                      name="role"
                      defaultValue={employee?.role || "mesero"}
                    >
                      {Object.entries(roles).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Estado del usuario
                    <select
                      name="active"
                      defaultValue={
                        employee?.active === false ? "Inactivo" : "Activo"
                      }
                    >
                      <option>Activo</option>
                      <option>Inactivo</option>
                    </select>
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Sede
                      <select name="branch" defaultValue={employee?.branch}>
                        {d.branches.map((b) => (
                          <option key={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Turno
                      <select
                        name="shift"
                        defaultValue={employee?.shift || "Tarde"}
                      >
                        <option>Mañana</option>
                        <option>Tarde</option>
                      </select>
                    </label>
                  </div>
                </>
              )}
              {["reset", "delete"].includes(modal.kind) && (
                <p className="modal-copy">
                  Confirma{" "}
                  {modal.kind === "reset"
                    ? "el restablecimiento de la contraseña demo"
                    : "la eliminación del usuario"}{" "}
                  de {employee?.name}.
                </p>
              )}
              {modal.kind === "branch" && (
                <>
                  <label>
                    Nombre
                    <input
                      name="name"
                      defaultValue={sede?.name}
                      readOnly
                      required
                    />
                  </label>
                  <label>
                    Dirección
                    <input
                      name="address"
                      defaultValue={sede?.address}
                      required
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={sede?.phone}
                      required
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Horario
                      <input name="hours" defaultValue={sede?.hours} required />
                    </label>
                    <label>
                      Cantidad de mesas
                      <input
                        name="tableCount"
                        type="number"
                        min="1"
                        max="40"
                        required
                        defaultValue={sede?.tableCount}
                      />
                    </label>
                  </div>
                  <label>
                    Estado
                    <select
                      name="active"
                      defaultValue={
                        sede?.active === false ? "Inactivo" : "Activo"
                      }
                    >
                      <option>Activo</option>
                      <option>Inactivo</option>
                    </select>
                  </label>
                </>
              )}
              {modal.kind === "cancel" && (
                <>
                  <p className="modal-copy">
                    Pedido #{order?.id}. Se restituirá el stock de los
                    productos.
                  </p>
                  <label>
                    Motivo justificado
                    <textarea name="note" minLength={8} required />
                  </label>
                </>
              )}
              {modal.kind === "detail" && order && (
                <div className="movement-list">
                  {order.items.map((l, i) => (
                    <span key={i}>
                      <b>
                        {l.qty}× {l.name}
                      </b>
                      {l.note || "Sin observaciones"} · {money(l.price * l.qty)}
                    </span>
                  ))}
                  <span>
                    <b>Total</b>
                    {money(total(order))}
                  </span>
                </div>
              )}
              <div className="option-form-actions">
                <Action secondary onClick={() => setModal(null)}>
                  {modal.kind === "detail" ? "Cerrar" : "Cancelar"}
                </Action>
                {modal.kind !== "detail" && (
                  <Action type="submit">
                    {modal.kind === "movement"
                      ? modal.direction === "exit"
                        ? "Registrar salida/ajuste"
                        : "Registrar entrada"
                      : "Guardar y confirmar"}
                  </Action>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
      {notice && (
        <div className="app-toast" role="status">
          <CheckCircle2 />
          {notice}
        </div>
      )}
    </>
  )
}
