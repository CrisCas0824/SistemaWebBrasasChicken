import { useEffect, useRef, useState, type FormEvent } from "react"
import brosLogo from "./assets/bros-chicken-logo.png"
import StoreOptions from "./StoreOptions"
import { DemoProvider, useDemoData, type AddressItem } from "./DemoContext"
import {
  ExecutiveDashboard,
  OperationalDashboard,
  FinancialReports,
  Promotions,
  TableOverview,
} from "./ManagementPanels"
import {
  money,
  total,
  type Line,
  type Order,
  type PaymentMethod,
  type PaymentRecord,
  type DiningTable,
} from "./model"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChefHat,
  CreditCard,
  Clock3,
  Eye,
  Flame,
  Grid2X2,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Navigation,
  Package,
  Phone,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  UserRound,
  Users,
  Utensils,
  Banknote,
  Bike,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Warehouse,
  Lock,
  X,
} from "lucide-react"

type Role = "superadmin" | "gerente" | "admin" | "cocina" | "cajero" | "mesero" | "repartidor" | "cliente"
type Screen = "landing" | "login" | "system"

const roleLabels: Record<Role, string> = {
  superadmin: "Administrador",
  gerente: "Dueño",
  admin: "Gerente",
  cocina: "Cocina",
  cajero: "Cajero",
  mesero: "Mesero",
  repartidor: "Repartidor",
  cliente: "Cliente",
}

const hero = `${import.meta.env.BASE_URL}images/original-hero.jpg`
const foodImages = [
  `${import.meta.env.BASE_URL}images/original-hero.jpg`,
  `${import.meta.env.BASE_URL}images/original-half.jpg`,
  `${import.meta.env.BASE_URL}images/original-mostrito.jpg`,
  `${import.meta.env.BASE_URL}images/original-broaster.jpg`,
]

const products = [
  {
    name: "Pollo entero BROS",
    desc: "Papas crocantes, ensalada fresca y cremas",
    price: 68.9,
    image: foodImages[0],
    tag: "Más vendido",
    category: "Pollos a la brasa",
  },
  {
    name: "1/2 pollo a la brasa",
    desc: "Media porción, papas y ensalada de la casa",
    price: 39.9,
    image: foodImages[1],
    tag: "Favorito",
    category: "Pollos a la brasa",
  },
  {
    name: "Mostrito BROS",
    desc: "1/4 de pollo, arroz chaufa, papas y cremas",
    price: 32.9,
    image: foodImages[2],
    tag: "Combo estrella",
    category: "Mostritos",
  },
  {
    name: "Broaster crocante",
    desc: "Tres piezas broaster, papas fritas y salsas",
    price: 29.9,
    image: foodImages[3],
    tag: "Nuevo",
    category: "Línea Broaster",
  },
  {
    name: "Lomo saltado al wok",
    desc: "Lomo, cebolla, tomate, papas y arroz",
    price: 34.9,
    image: foodImages[1],
    tag: "Al wok",
    category: "Wok y salteados",
  },
  {
    name: "Chaufa de pollo",
    desc: "Arroz salteado al wok con pollo y cebolla china",
    price: 24.9,
    image: foodImages[2],
    tag: "Clásico",
    category: "Wok y salteados",
  },
  {
    name: "Papas familiares",
    desc: "Porción familiar de papas fritas crocantes",
    price: 15.9,
    image: foodImages[3],
    tag: "Para compartir",
    category: "Guarniciones y bebidas",
  },
  {
    name: "Chicha morada 1 L",
    desc: "Jarra de chicha morada de la casa",
    price: 12,
    image: foodImages[0],
    tag: "Refrescante",
    category: "Guarniciones y bebidas",
  },
]

const menuCategories = [
  "Todos",
  "Pollos a la brasa",
  "Línea Broaster",
  "Mostritos",
  "Wok y salteados",
  "Guarniciones y bebidas",
]

function useCatalog(branch?: string) {
  const data = useDemoData()
  return data.productsFor(branch || data.activeBranch).map((p) => ({
    ...p,
    price: data.priceFor(p.id),
    desc: p.description,
    tag:
      data.activePromotion(p.id)?.name ||
      (p.stockActual === 0
        ? "Agotado"
        : p.id === 1
          ? "Más vendido"
          : "Favorito"),
  }))
}

const branches = [
  {
    name: "Ferreñafe",
    address: "Av. Tacna 615, Ferreñafe",
    phone: "979 384 120",
    hours: "Lun–Dom · 12:00–23:00",
    status: "Abierto",
  },
  {
    name: "La Victoria",
    address: "Av. Los Incas 840, La Victoria",
    phone: "974 521 806",
    hours: "Lun–Dom · 12:00–23:30",
    status: "Abierto",
  },
  {
    name: "Lambayeque",
    address: "Av. Ramón Castilla 325, Lambayeque",
    phone: "961 708 432",
    hours: "Lun–Dom · 11:30–23:00",
    status: "Abierto",
  },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      <img src={brosLogo} alt="BROS Chicken" />
    </div>
  )
}

function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode
  variant?: "primary" | "dark" | "outline" | "light" | "gold"
  onClick?: () => void
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function Landing({
  onLogin,
  onOrder,
}: {
  onLogin: () => void
  onOrder: () => void
}) {
  const [mobile, setMobile] = useState(false)
  const data = useDemoData()
  const catalog = useCatalog()
  const branches = data.branches.map((b) => ({
    ...b,
    hours: `Lun–Dom · ${b.hours}`,
    status: b.active ? "Abierto" : "Cerrado",
  }))
  const [favorites, setFavorites] = useState<number[]>([])
  const landingProducts = [1, 2, 4, 5, 6, 7, 3, 13]
    .map((id, i) => {
      const p = catalog.find((p) => p.id === id)!
      return { ...p, image: products[i].image }
    })
    .filter((p) => p.active)
  const orderProduct = (id: number) => {
    const p = catalog.find((p) => p.id === id)
    if (!p || !p.available || !p.stockActual) return
    data.setClientCart((ls) => {
      const current = ls.find((l) => l.productId === id)
      if (current && current.qty >= p.stockActual) return ls
      return current
        ? ls.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
        : [
            ...ls,
            { productId: id, name: p.name, price: p.price, qty: 1, note: "" },
          ]
    })
    onOrder()
  }
  return (
    <main className="landing">
      <div className="top-strip">
        <span>
          <Phone size={13} /> Delivery: (01) 680-2025
        </span>
        <span>Abierto hoy · 12:00 a 23:00</span>
      </div>
      <header className="public-header">
        <Brand />
        <nav className={mobile ? "open" : ""}>
          {[
            "Inicio",
            "Menú",
            "Promociones",
            "Nuestras sedes",
            "Nosotros",
            "Contacto",
          ].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              onClick={() => setMobile(false)}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Button variant="outline" onClick={onLogin}>
            <LogIn size={16} /> Iniciar sesión
          </Button>
          <Button onClick={onOrder}>
            <ShoppingBag size={16} /> Haz tu pedido
          </Button>
        </div>
        <button
          className="menu-toggle"
          onClick={() => setMobile(!mobile)}
          aria-label="Abrir menú"
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="inicio">
        <img src={hero} alt="Pollo a la brasa servido con acompañamientos" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="eyebrow">
            <Flame size={16} fill="currentColor" /> Tradición peruana desde 2008
          </div>
          <h1>
            El sabor
            <br />
            que nos une
          </h1>
          <p>
            Disfruta nuestros pollos a la brasa, combos y acompañamientos
            favoritos. Dorado al punto, jugoso por dentro.
          </p>
          <div className="hero-actions">
            <Button onClick={onOrder}>
              Ver menú <ArrowRight size={17} />
            </Button>
            <Button variant="light" onClick={onOrder}>
              Realizar pedido
            </Button>
          </div>
          <div className="hero-proof">
            <div>
              <strong>15+</strong>
              <span>años contigo</span>
            </div>
            <div>
              <strong>3</strong>
              <span>sedes en Lambayeque</span>
            </div>
            <div>
              <strong>4.8</strong>
              <span>valoración clientes</span>
            </div>
          </div>
        </div>
        <div className="hero-ticket">
          <span>HOY</span>
          <strong>Combo familiar</strong>
          <small>Pollo + papas + gaseosa</small>
          <b>S/ 79.90</b>
        </div>
      </section>

      <section className="section products-section" id="menú">
        <div className="section-heading">
          <div>
            <span className="kicker">PARA COMPARTIR</span>
            <h2>Favoritos de la casa</h2>
          </div>
          <p>
            Elige tus BROS de siempre, preparados al momento con ingredientes
            frescos.
          </p>
        </div>
        <div className="category-row">
          {menuCategories.map((c, i) => (
            <button
              key={c}
              className={i === 0 ? "active" : ""}
              onClick={onOrder}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {landingProducts.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <span>{product.tag}</span>
                <button
                  aria-label={`Favorito ${product.name}`}
                  aria-pressed={favorites.includes(product.id)}
                  onClick={() =>
                    setFavorites((ids) =>
                      ids.includes(product.id)
                        ? ids.filter((id) => id !== product.id)
                        : [...ids, product.id],
                    )
                  }
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(product.id) ? "#E50914" : "none"}
                  />
                </button>
              </div>
              <div className="product-body">
                <h3>{product.name}</h3>
                <p>{product.desc}</p>
                <div>
                  <strong>S/ {product.price.toFixed(2)}</strong>
                  <button
                    disabled={!product.available || !product.stockActual}
                    onClick={() => orderProduct(product.id)}
                  >
                    <Plus size={18} /> Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="promo-section" id="promociones">
        <div className="promo-copy">
          <span className="kicker light">PROMO DE FIN DE SEMANA</span>
          <h2>
            Más sabor.
            <br />
            Más familia.
          </h2>
          <p>
            1 pollo a la brasa + papas familiares + ensalada + gaseosa de 1.5 L.
          </p>
          <div className="promo-price">
            <del>S/ 92.00</del>
            <strong>S/ 79.90</strong>
          </div>
          <Button variant="light" onClick={onOrder}>
            Pedir promoción <ArrowRight size={17} />
          </Button>
        </div>
        <div className="promo-image">
          <img src={foodImages[2]} alt="Combo familiar BROS Chicken" />
        </div>
        <div className="promo-seal">
          AHORRA
          <br />
          <strong>S/ 12</strong>
        </div>
      </section>

      <section className="section locations" id="nuestras-sedes">
        <div className="section-heading">
          <div>
            <span className="kicker">SIEMPRE CERCA</span>
            <h2>Nuestras sedes</h2>
          </div>
          <p>
            Tres locales, el mismo sabor. Visítanos o elige tu sede para
            delivery.
          </p>
        </div>
        <div className="location-grid">
          {branches.map((branch, i) => (
            <article className="location-card" key={branch.name}>
              <div className="location-number">0{i + 1}</div>
              <Store size={25} />
              <h3>{branch.name}</h3>
              <Status>{branch.status}</Status>
              <p>
                <MapPin size={16} />
                {branch.address}
              </p>
              <p>
                <Phone size={16} />
                {branch.phone}
              </p>
              <p>
                <Clock3 size={16} />
                {branch.hours}
              </p>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`,
                    "_blank",
                  )
                }
              >
                Ver ubicación <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="story" id="nosotros">
        <div className="story-image">
          <img
            src={foodImages[3]}
            alt="Mesa servida para compartir en BROS Chicken"
          />
        </div>
        <div className="story-copy">
          <span className="kicker">NUESTRA HISTORIA</span>
          <h2>BROS que reúne, sabor que permanece</h2>
          <p>
            Nacimos con una idea simple: preparar un pollo a la brasa honesto,
            sabroso y perfecto para compartir. Hoy, cada plato conserva esa
            misma dedicación.
          </p>
          <div className="story-values">
            <span>
              <Flame /> Cocción perfecta
            </span>
            <span>
              <Check /> Sabor de la casa
            </span>
            <span>
              <Users /> Atención familiar
            </span>
          </div>
        </div>
      </section>

      <footer id="contacto">
        <div>
          <Brand />
          <p>El auténtico sabor peruano para compartir en familia.</p>
        </div>
        <div>
          <strong>Explora</strong>
          <a href="#menú">Nuestro menú</a>
          <a href="#promociones">Promociones</a>
          <a href="#nuestras-sedes">Sedes</a>
        </div>
        <div>
          <strong>Atención</strong>
          <span>(01) 680-2025</span>
          <span>pedidos@broschicken.pe</span>
          <span>Lun–Dom · 12:00–23:00</span>
        </div>
        <div>
          <strong>Síguenos</strong>
          <div className="socials">
            <span>f</span>
            <span>ig</span>
            <span>tk</span>
          </div>
        </div>
        <small>© 2025 BROS Chicken. Todos los derechos reservados.</small>
      </footer>
    </main>
  )
}

function Login({
  onBack,
  onEnter,
}: {
  onBack: () => void
  onEnter: (role: Role) => void
}) {
  const [role, setRole] = useState<Role>("superadmin")
  const [register, setRegister] = useState(false)
  const [message, setMessage] = useState("")
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img src={hero} alt="Pollo a la brasa" />
        <div className="auth-shade" />
        <button className="back-link" onClick={onBack}>
          ← Volver al inicio
        </button>
        <div className="auth-quote">
          <Brand />
          <blockquote>“El sabor de siempre, ahora más cerca de ti.”</blockquote>
          <p>BROS CHICKEN · LAMBAYEQUE</p>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-inner">
          <div className="auth-brand">
            <Brand />
          </div>
          <span className="kicker">
            {register ? "NUEVO CLIENTE" : "BIENVENIDO"}
          </span>
          <h1>{register ? "Crea tu cuenta" : "Inicia sesión"}</h1>
          <p>
            {register
              ? "Regístrate para guardar direcciones y realizar pedidos."
              : "Ingresa a tu cuenta para continuar."}
          </p>
          {!register && (
            <div className="role-picker">
              {([
                "superadmin",
                "gerente",
                "admin",
                "cajero",
                "mesero",
                "cocina",
                "repartidor",
                "cliente",
              ] as Role[]).map((r) => (
                <button
                  className={role === r ? "selected" : ""}
                  onClick={() => setRole(r)}
                  key={r}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
          {register && (
            <>
              <div className="auth-grid">
                <label>
                  DNI
                  <input placeholder="8 dígitos" />
                </label>
                <label>
                  Teléfono
                  <input placeholder="999 999 999" />
                </label>
              </div>
              <div className="auth-grid">
                <label>
                  Nombres
                  <input placeholder="Tus nombres" />
                </label>
                <label>
                  Apellidos
                  <input placeholder="Tus apellidos" />
                </label>
              </div>
            </>
          )}
          <label>
            Correo electrónico
            <input
              type="email"
              defaultValue={register ? "" : `${role}@broschicken.pe`}
              placeholder="correo@ejemplo.com"
            />
          </label>
          <label>
            Contraseña
            <input type="password" defaultValue="bros2025" />
          </label>
          {register && (
            <label>
              Confirmar contraseña
              <input type="password" defaultValue="bros2025" />
            </label>
          )}
          {!register && (
            <div className="auth-options">
              <label>
                <input type="checkbox" defaultChecked /> Recordarme
              </label>
              <button
                onClick={() =>
                  setMessage(
                    "Te enviamos instrucciones para recuperar tu contraseña.",
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          <Button
            className="full"
            onClick={() => (register ? onEnter("cliente") : onEnter(role))}
          >
            {register ? "CREAR CUENTA" : "INICIAR SESIÓN"}{" "}
            <ArrowRight size={17} />
          </Button>
          <div className="divider">
            <span>o</span>
          </div>
          <Button
            variant="outline"
            className="full"
            onClick={() => setRegister(!register)}
          >
            {register ? "Ya tengo una cuenta" : "Crear cuenta de cliente"}
          </Button>
          <p className="auth-help">
            {message ||
              (register
                ? "Todos los campos son obligatorios."
                : "Acceso demo: selecciona un rol para explorar su interfaz.")}
          </p>
        </div>
      </section>
    </main>
  )
}

type AdminRole = Extract<Role, "superadmin" | "gerente" | "admin">
const adminNav: Array<{
  label: string
  icon: typeof Grid2X2
  roles: AdminRole[]
}> = [
  { label: "Dashboard Ejecutivo", icon: Grid2X2, roles: ["gerente"] },
  { label: "Reportes Financieros", icon: BarChart3, roles: ["gerente"] },
  { label: "Productos y Categorías", icon: Package, roles: ["gerente"] },
  { label: "Promociones", icon: Flame, roles: ["gerente"] },
  { label: "Dashboard Operativo", icon: Grid2X2, roles: ["admin"] },
  { label: "Pedidos", icon: ShoppingBag, roles: ["admin"] },
  { label: "Mesas / Salón", icon: Utensils, roles: ["admin"] },
  { label: "Inventario en Tienda", icon: Warehouse, roles: ["admin"] },
  { label: "Caja y Pagos", icon: Banknote, roles: ["admin"] },
  { label: "Personal de Sede", icon: Users, roles: ["admin"] },
  { label: "Dashboard Técnico", icon: Grid2X2, roles: ["superadmin"] },
  { label: "Usuarios y Roles", icon: UserRound, roles: ["superadmin"] },
  { label: "Sedes", icon: Building2, roles: ["superadmin"] },
  { label: "Configuración y Auditoría", icon: Settings, roles: ["superadmin"] },
]
function Status({ children }: { children: React.ReactNode }) {
  const value = String(children).toLowerCase()
  const tone =
    value.includes("entregado") ||
    value.includes("listo") ||
    value.includes("disponible") ||
    value.includes("confirmado") ||
    value.includes("liquidado") ||
    value.includes("pagado") ||
    value === "libre" ||
    value === "activo"
      ? "success"
      : value.includes("prepar") ||
          value.includes("reserv") ||
          value.includes("cuenta") ||
          value.includes("bajo")
        ? "warning"
        : value.includes("agotado") ||
            value.includes("anulado") ||
            value.includes("ocupada")
          ? "danger"
          : "neutral"
  return (
    <span className={`status ${tone}`}>
      <i />
      {children}
    </span>
  )
}
function ModuleContent({
  active,
  role,
  branch,
  navigate,
}: {
  active: string
  role: AdminRole
  branch: string
  navigate: (view: string) => void
}) {
  if (active === "Dashboard Ejecutivo")
    return <ExecutiveDashboard branch={branch} />
  if (active === "Reportes Financieros")
    return <FinancialReports branch={branch} />
  if (active === "Dashboard Operativo")
    return <OperationalDashboard branch={branch} navigate={navigate} />
  if (active === "Promociones") return <Promotions />
  if (active === "Mesas / Salón") return <TableOverview branch={branch} />
  if (active === "Caja y Pagos")
    return <FinancialReports branch={branch} operational />
  const aliases: Record<string, string> = {
    "Dashboard Técnico": "Dashboard",
    "Usuarios y Roles": "Usuarios",
    "Configuración y Auditoría": "Parámetros técnicos",
    "Productos y Categorías": "Productos",
    "Inventario en Tienda": "Inventario",
    "Personal de Sede": "Personal del local",
  }
  return (
    <StoreOptions
      key={`${role}-${active}-${branch}`}
      active={aliases[active] || active}
      role={role}
      branchScope={branch}
    />
  )
}
function Admin({
  onLogout,
  onRole,
  role,
}: {
  onLogout: () => void
  onRole: (r: Role) => void
  role: AdminRole
}) {
  const d = useDemoData()
  const [active, setActive] = useState(
    adminNav.find((n) => n.roles.includes(role))!.label,
  )
  const [collapsed, setCollapsed] = useState(false)
  const [notice, setNotice] = useState("")
  const [adminBranch, setAdminBranch] = useState("Todas las sedes")
  const [branchMenu, setBranchMenu] = useState(false)
  const canChangeBranch = role === "gerente"
  const scope = role === "admin" ? d.managerBranch : adminBranch
  const navigate = (view: string) => {
    if (adminNav.some((n) => n.label === view && n.roles.includes(role)))
      setActive(view)
  }
  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }
  return (
    <div className="admin-shell">
      <aside className={collapsed ? "collapsed" : ""}>
        <div className="aside-brand">
          <Brand compact={collapsed} />
          <button
            aria-label="Contraer sidebar"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="branch-switch">
          <button
            className="branch-select"
            onClick={() =>
              canChangeBranch
                ? setBranchMenu(!branchMenu)
                : showNotice(
                    role === "admin"
                      ? `Sede asignada: ${scope}. El Administrador gestiona las asignaciones de usuarios.`
                      : "Configuración técnica de las 3 sedes oficiales.",
                  )
            }
          >
            <Store size={17} />
            <div>
              <small>
                {canChangeBranch
                  ? "FILTRO GLOBAL DE SEDE"
                  : role === "admin"
                    ? "SEDE ASIGNADA"
                    : "SISTEMA CENTRAL"}
              </small>
              <b>{scope}</b>
            </div>
            {canChangeBranch ? <ChevronDown size={14} /> : <Lock size={13} />}
          </button>
          {branchMenu && canChangeBranch && (
            <div>
              {["Todas las sedes", ...d.branches.map((b) => b.name)].map(
                (item) => (
                  <button
                    key={item}
                    className={scope === item ? "active" : ""}
                    onClick={() => {
                      setAdminBranch(item)
                      setBranchMenu(false)
                    }}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
        <nav>
          {adminNav
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <button
                key={item.label}
                className={active === item.label ? "active" : ""}
                onClick={() => navigate(item.label)}
                title={item.label}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
        </nav>
        <div className="aside-bottom">
          {role === "superadmin" && (
            <button onClick={() => navigate("Configuración y Auditoría")}>
              <Settings size={18} />
              <span>Configuración</span>
            </button>
          )}
          <button onClick={onLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p>
              {roleLabels[role].toUpperCase()} / {active.toUpperCase()}
            </p>
            <h1>{active}</h1>
          </div>
          <div className="admin-actions">
            {canChangeBranch && (
              <select
                className="option-select global-branch"
                aria-label="Filtro global de sede"
                value={adminBranch}
                onChange={(e) => setAdminBranch(e.target.value)}
              >
                <option>Todas las sedes</option>
                {d.branches.map((b) => (
                  <option key={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <button
              className="notification"
              aria-label="Ver estado del sistema"
              onClick={() =>
                showNotice(
                  role === "superadmin"
                    ? `3 sedes configuradas · ${d.employees.filter((e) => e.active).length} usuarios activos · Servicios operativos.`
                    : `${d.orders.filter((o) => (scope === "Todas las sedes" || o.branch === scope) && !["Anulado", "Entregado"].includes(o.status)).length} pedidos activos en la vista seleccionada.`,
                )
              }
            >
              <Bell size={19} />
              <i />
            </button>
            <button
              className="user-menu"
              onClick={() =>
                showNotice(`Sesión demo: ${roleLabels[role]} · ${scope}.`)
              }
            >
              <span>AM</span>
              <div>
                <b>Andrea Mendoza</b>
                <small>{roleLabels[role]}</small>
              </div>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main className="admin-content">
          <div className="content-title">
            <div>
              <h2>
                {active.startsWith("Dashboard")
                  ? "Buenos días, Andrea"
                  : `Gestión de ${active}`}
              </h2>
              <p>
                {roleLabels[role]} · {scope}
                {scope === "La Victoria" ? " (Sede Principal)" : ""}.
              </p>
            </div>
            {active === "Dashboard Operativo" && (
              <Button onClick={() => navigate("Pedidos")}>
                <Eye size={17} /> Ver operación
              </Button>
            )}
          </div>
          <ModuleContent
            active={active}
            role={role}
            branch={scope}
            navigate={navigate}
          />
        </main>
      </div>
      {notice && (
        <div className="app-toast" role="status">
          <Bell />
          {notice}
        </div>
      )}
      <RoleSwitcher onRole={onRole} current={role} />
    </div>
  )
}

function BranchPicker() {
  const d = useDemoData()
  return (
    <label className="ops-branch">
      <Store />
      <select
        aria-label="Sede operativa"
        value={d.activeBranch}
        onChange={(e) => d.setActiveBranch(e.target.value)}
      >
        {d.branches.map((b) => (
          <option key={b.id}>{b.name}</option>
        ))}
      </select>
    </label>
  )
}
function useNotice() {
  const [notice, setNotice] = useState("")
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(""), 3600)
    return () => clearTimeout(t)
  }, [notice])
  return [notice, setNotice] as const
}
function Notice({ text }: { text: string }) {
  return text ? (
    <div className="app-toast" role="status">
      <CheckCircle2 />
      {text}
    </div>
  ) : null
}
function Dialog({
  title,
  children,
  onClose,
  receipt = false,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  receipt?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const old = document.activeElement as HTMLElement
    ref.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,textarea,a[href]",
        )
        if (nodes?.length) {
          const first = nodes[0],
            last = nodes[nodes.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("keydown", key)
      old?.focus()
    }
  }, [])
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`form-modal admin-modal ${
          receipt ? "receipt-print pos-modal" : ""
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label="Cerrar modal"
          onClick={onClose}
        >
          <X />
        </button>
        {receipt && (
          <div className="receipt-brand">
            <Brand />
            <small>RUC 20601234567 · COMPROBANTE DEMO</small>
          </div>
        )}
        <span className="kicker">BROS CHICKEN · DEMO INTERACTIVA</span>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}
function CatalogPicker({
  onAdd,
  onClose,
}: {
  onAdd: (productId: number) => void
  onClose: () => void
}) {
  const d = useDemoData()
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  return (
    <Dialog title="Agregar productos" onClose={onClose}>
      <div className="filters composer-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar plato o bebida..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Categoría de comanda"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Todos</option>
          {d.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap composer-catalog">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {d
              .productsFor(d.activeBranch)
              .filter(
                (p) =>
                  p.active &&
                  (category === "Todos" || p.category === category) &&
                  p.name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                  </td>
                  <td>{money(d.priceFor(p.id))}</td>
                  <td>{p.stockActual}</td>
                  <td>
                    <button
                      className="icon-btn"
                      disabled={!p.stockActual || !p.available}
                      aria-label={`Agregar ${p.name}`}
                      onClick={() => onAdd(p.id)}
                    >
                      <Plus size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="option-form-actions">
        <Button onClick={onClose}>Volver a la comanda</Button>
      </div>
    </Dialog>
  )
}
function Kitchen({
  onLogout,
  onRole,
}: {
  onLogout: () => void
  onRole: (r: Role) => void
}) {
  const d = useDemoData()
  const [area, setArea] = useState("Todas")
  const [notice, notify] = useNotice()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const zone = (line: Line) => {
    const p = d.products.find((p) => p.id === line.productId)
    return p?.category === "Carta y Chifa"
      ? "Wok / Salteados"
      : p?.category === "Broaster y Mostritos"
        ? "Freidoras / Broaster"
        : "Horno Brasa"
  }
  const cards = d.orders
    .filter(
      (o) =>
        o.branch === d.activeBranch &&
        ["Pendiente", "Preparando", "Listo"].includes(o.status) &&
        !o.kitchenNotified,
    )
    .sort((a, b) => a.created - b.created)
  const columns = [
    { title: "Nuevos", state: "Pendiente", tone: "red" },
    { title: "En preparación", state: "Preparando", tone: "gold" },
    { title: "Listos", state: "Listo", tone: "black" },
  ]
  const advance = (o: Order) => {
    if (o.status === "Listo") {
      d.updateOrder(o.id, { kitchenNotified: true })
      d.log(
        `Pedido #${o.id} notificado para atención o despacho`,
        o.branch,
        "Cocina",
      )
      notify(`Pedido #${o.id} notificado. Sigue disponible en Caja y Salón.`)
    } else {
      d.advanceOrder(o.id)
      notify(
        `Pedido #${o.id}: ${
          o.status === "Pendiente" ? "en preparación" : "listo"
        }.`,
      )
    }
  }
  return (
    <div className="ops-page kitchen">
      <header className="ops-header">
        <Brand />
        <div className="ops-title">
          <ChefHat />
          <div>
            <b>Panel de cocina</b>
            <span>Sede {d.activeBranch} · Turno tarde</span>
          </div>
        </div>
        <div className="ops-right">
          <BranchPicker />
          <span className="live">
            <i /> EN VIVO
          </span>
          <button
            aria-label="Ver actividad de cocina"
            onClick={() =>
              notify(
                `${cards.length} comandas activas. Actualización automática.`,
              )
            }
          >
            <Bell />
            <i />
          </button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut size={16} /> Salir
          </Button>
        </div>
      </header>
      <main>
        <div className="ops-summary">
          <div>
            <h1>KDS multizona</h1>
            <p>FIFO · pedidos ordenados por hora de ingreso</p>
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
          {[
            "Todas",
            "Horno Brasa",
            "Freidoras / Broaster",
            "Wok / Salteados",
          ].map((item) => (
            <button
              className={area === item ? "active" : ""}
              onClick={() => setArea(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="kanban">
          {columns.map((col) => {
            const visible = cards.filter(
              (o) =>
                o.status === col.state &&
                (area === "Todas" || o.items.some((l) => zone(l) === area)),
            )
            return (
              <section className="kanban-col" key={col.state}>
                <div className={`kanban-head ${col.tone}`}>
                  <div>
                    <i />
                    {col.title.toUpperCase()}
                  </div>
                  <span>{visible.length}</span>
                </div>
                <div className="kanban-list">
                  {visible.length ? (
                    visible.map((o) => {
                      const elapsed = Math.max(
                        0,
                        Math.floor((now - o.created) / 1000),
                      )
                      return (
                        <article className="order-card" key={o.id}>
                          <div className="order-card-head">
                            <strong>#{o.id}</strong>
                            <span className={elapsed > 1500 ? "late" : ""}>
                              <Clock3 size={14} />
                              {Math.floor(elapsed / 60)}:
                              {String(elapsed % 60).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="order-type">
                            <span>
                              {o.table
                                ? `Mesa ${o.tableGroup?.join(" + ") || o.table}`
                                : o.channel === "Recojo"
                                  ? "Para llevar"
                                  : "Delivery Web"}
                            </span>
                            <small>
                              {[...new Set(o.items.map(zone))].join(" · ")}
                            </small>
                          </div>
                          <ul>
                            {o.items.map((l, i) => (
                              <li key={i}>
                                <b>{l.qty}×</b> {l.name}
                                {l.note && (
                                  <p className="kitchen-line-note">
                                    <b>Nota:</b> {l.note}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => advance(o)}>
                            {col.state === "Pendiente"
                              ? "Iniciar preparación"
                              : col.state === "Preparando"
                                ? "Marcar como listo"
                                : "Notificar y despachar"}
                            <ArrowRight size={16} />
                          </button>
                        </article>
                      )
                    })
                  ) : (
                    <div className="kanban-empty">
                      <CheckCircle2 />
                      <span>Sin pedidos en esta etapa</span>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </main>
      <Notice text={notice} />
      <RoleSwitcher onRole={onRole} current="cocina" />
    </div>
  )
}
function Cashier({
  onLogout,
  onRole,
}: {
  onLogout: () => void
  onRole: (r: Role) => void
}) {
  const d = useDemoData()
  const branch = d.activeBranch
  const tables = d.tablesFor(branch)
  const session = d.cashSessions[branch]
  const sums = d.cashTotals(branch)
  const [selected, setSelected] = useState(8)
  const [tab, setTab] = useState("Mesas")
  const [posModal, setPosModal] =
    useState<"pago" | "apertura" | "cierre" | "comprobante" | null>(null)
  const [notice, notify] = useNotice()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [method, setMethod] = useState<PaymentMethod>("Efectivo")
  const [receiptType, setReceiptType] = useState<"Boleta" | "Factura">("Boleta")
  const [received, setReceived] = useState("")
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null)
  const [catalog, setCatalog] = useState(false)
  const [draft, setDraft] = useState<Line[]>([])
  const [riders, setRiders] = useState<Record<number, string>>({})
  const tableOrders = d.orders.filter(
    (o) =>
      o.branch === branch &&
      o.table &&
      (o.table === selected || o.tableGroup?.includes(selected)) &&
      !o.paid &&
      o.status !== "Anulado",
  )
  const queue = d.orders.filter(
    (o) =>
      o.branch === branch &&
      !o.paid &&
      o.status !== "Anulado" &&
      (o.bill || o.channel === "Recojo"),
  )
  const due = d.orders.filter(
    (o) => selectedIds.includes(o.id) && !o.paid && o.status !== "Anulado",
  )
  const dueTotal = Math.round(due.reduce((s, o) => s + total(o), 0) * 100) / 100
  const draftTotal = draft.reduce(
    (s, l) => s + d.priceFor(l.productId) * l.qty,
    0,
  )
  const pay = (ids: number[]) => {
    if (!session.open) {
      notify("Abre la caja para registrar cobros.")
      return
    }
    setSelectedIds(ids)
    setReceived("")
    setPosModal("pago")
  }
  const add = (id: number) => {
    const p = d.productsFor(branch).find((p) => p.id === id)!
    const qty = draft.find((l) => l.productId === id)?.qty || 0
    if (qty >= p.stockActual || !p.available) {
      notify("Stock disponible alcanzado.")
      return
    }
    setDraft((ls) =>
      qty
        ? ls.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
        : [
            ...ls,
            {
              productId: id,
              name: p.name,
              price: d.priceFor(id),
              qty: 1,
              note: "",
            },
          ],
    )
  }
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (posModal === "pago") {
      const p = d.payOrders(
        selectedIds,
        method,
        receiptType,
        String(f.get("document") || ""),
        Number(received),
      )
      if (!p) {
        notify("Revisa el efectivo, el documento y el estado de la caja.")
        return
      }
      setLastReceipt(p)
      setPosModal("comprobante")
      notify(`Cobro registrado: ${p.receipt}.`)
    } else if (posModal === "apertura") {
      if (d.openCash(branch, Number(f.get("opening")))) {
        notify("Caja abierta correctamente.")
        setPosModal(null)
      }
    } else if (posModal === "cierre") {
      const c = d.closeCash(branch, Number(f.get("counted")))
      if (c) {
        notify(`Caja cerrada. Diferencia: ${money(c.difference)}.`)
        setPosModal(null)
      }
    }
  }
  const send = () => {
    const id = d.placeOrder({
      branch,
      channel: "Salón",
      table: selected,
      customer: `Mesa ${selected}`,
      items: draft,
    })
    if (!id) {
      notify("No se pudo enviar. Revisa la disponibilidad de los productos.")
      return
    }
    setDraft([])
    notify(`Pedido #${id} enviado a cocina. Stock actualizado.`)
  }
  const ready = d.orders.filter(
    (o) =>
      o.branch === branch &&
      o.channel === "Delivery Web" &&
      o.status === "Listo" &&
      !o.delivery,
  )
  const completed = d.orders.filter(
    (o) =>
      o.branch === branch &&
      o.delivery === "ENTREGADO" &&
      o.method === "Efectivo" &&
      !o.settled,
  )
  const pickupReady = d.orders.filter(
    (o) =>
      o.branch === branch &&
      o.channel === "Recojo" &&
      o.paid &&
      o.status === "Listo",
  )
  return (
    <div className="ops-page waiter">
      <header className="ops-header">
        <Brand />
        <div className="ops-title">
          <ReceiptText />
          <div>
            <b>Terminal POS · Salón y caja</b>
            <span>Sede {branch} · Caja 01 · Lucía Vega</span>
          </div>
        </div>
        <div className="waiter-tabs">
          {["Mesas", "Pedidos", "Delivery", "Liquidaciones"].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ops-right">
          <BranchPicker />
          <Button
            variant="outline"
            disabled={!session.open}
            onClick={() => setPosModal("cierre")}
          >
            <Lock size={15} /> Cierre de caja
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut size={16} /> Salir
          </Button>
        </div>
      </header>
      <div className="cashier-strip">
        <span>
          <i className={session.open ? "open" : ""} />
          <small>CAJA 01</small>
          <b>
            {session.open ? "Abierta" : "Cerrada"} · {money(session.opening)}{" "}
            inicial
          </b>
        </span>
        <span>
          <small>VENTAS DEL TURNO</small>
          <b>{money(sums.total)}</b>
        </span>
        <span>
          <small>EFECTIVO</small>
          <b>{money(sums.cash)}</b>
        </span>
        <span>
          <small>YAPE / PLIN</small>
          <b>{money(sums.yape + sums.plin)}</b>
        </span>
        <span>
          <small>TARJETA</small>
          <b>{money(sums.card)}</b>
        </span>
        <Button variant="outline" onClick={() => setPosModal("apertura")}>
          {session.open ? "Ver apertura" : "Abrir caja"}
        </Button>
        <Button variant="outline" onClick={() => setTab("Pedidos")}>
          {queue.length} cobros pendientes
        </Button>
        <Button
          variant="outline"
          disabled={!session.open}
          onClick={() => setPosModal("cierre")}
        >
          Cerrar turno
        </Button>
      </div>
      <div className="report-tabs mobile-ops-tabs">
        {["Mesas", "Pedidos", "Delivery", "Liquidaciones"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Mesas" ? (
        <main className="waiter-main">
          <section className="table-map">
            <div className="ops-summary">
              <div>
                <h1>Plano de mesas</h1>
                <p>Selecciona una mesa para tomar la comanda o cobrar.</p>
              </div>
              <Button
                onClick={() => {
                  setDraft([])
                  setCatalog(true)
                }}
              >
                <Plus size={17} /> Nueva comanda
              </Button>
            </div>
            <div className="table-legend">
              {["Libre", "Ocupada", "Reservada", "Cuenta solicitada"].map(
                (t, i) => (
                  <span key={t}>
                    <i className={["free", "busy", "reserved", "bill"][i]} />
                    {t}
                  </span>
                ),
              )}
            </div>
            <div className="tables-grid">
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
                  onClick={() => {
                    setSelected(t.id)
                    setDraft([])
                  }}
                >
                  <Utensils />
                  <b>Mesa {String(t.id).padStart(2, "0")}</b>
                  <small>{t.status}</small>
                </button>
              ))}
            </div>
          </section>
          <aside className="order-builder">
            <div className="builder-head">
              <div>
                <span>COMANDA ACTUAL</span>
                <h2>Mesa {String(selected).padStart(2, "0")}</h2>
              </div>
              <button aria-label="Limpiar comanda" onClick={() => setDraft([])}>
                <X />
              </button>
            </div>
            <div className="guest-row">
              <span>
                {tables.find((t) => t.id === selected)?.capacity || 4}{" "}
                comensales
              </span>
              <span>{branch}</span>
            </div>
            <div className="builder-items">
              {draft.map((l) => (
                <article key={l.productId}>
                  <img
                    src={d.products.find((p) => p.id === l.productId)?.image}
                    alt=""
                  />
                  <div>
                    <b>{l.name}</b>
                    <small>{money(d.priceFor(l.productId))} por unidad</small>
                    <div>
                      <button
                        aria-label={`Reducir ${l.name}`}
                        onClick={() =>
                          setDraft((ls) =>
                            ls.map((x) =>
                              x.productId === l.productId
                                ? { ...x, qty: x.qty - 1 }
                                : x,
                            ).filter((x) => x.qty > 0),
                          )
                        }
                      >
                        <Minus />
                      </button>
                      <span>{l.qty}</span>
                      <button
                        aria-label={`Aumentar ${l.name}`}
                        onClick={() => add(l.productId)}
                      >
                        <Plus />
                      </button>
                    </div>
                    <input
                      className="line-note"
                      aria-label={`Nota ${l.name}`}
                      placeholder="Observación para cocina"
                      value={l.note}
                      onChange={(e) =>
                        setDraft((ls) =>
                          ls.map((x) =>
                            x.productId === l.productId
                              ? { ...x, note: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <strong>{money(d.priceFor(l.productId) * l.qty)}</strong>
                </article>
              ))}
            </div>
            <button className="add-product" onClick={() => setCatalog(true)}>
              <Plus /> Agregar productos
            </button>
            {tableOrders.length > 0 && (
              <div className="movement-list">
                {tableOrders.map((o) => (
                  <span key={o.id}>
                    <b>
                      #{o.id} · {o.status}
                    </b>
                    {o.items.map((l) => `${l.qty}× ${l.name}`).join(" · ")} ·{" "}
                    {money(total(o))}
                  </span>
                ))}
              </div>
            )}
            <div className="builder-total">
              <span>
                Nueva comanda <b>{money(draftTotal)}</b>
              </span>
              <span>
                Cuenta pendiente{" "}
                <strong>
                  {money(tableOrders.reduce((s, o) => s + total(o), 0))}
                </strong>
              </span>
            </div>
            <Button className="full" onClick={send} disabled={!draft.length}>
              Enviar a cocina <ChefHat size={18} />
            </Button>
            <Button
              className="full pos-charge"
              onClick={() => pay(tableOrders.map((o) => o.id))}
              disabled={!tableOrders.length || !session.open}
            >
              <Banknote /> Cobrar y emitir comprobante
            </Button>
          </aside>
        </main>
      ) : tab === "Pedidos" ? (
        <main>
          <div className="ops-summary">
            <div>
              <h1>Cola de cobro</h1>
              <p>Cuentas solicitadas y pedidos para llevar.</p>
            </div>
          </div>
          <section className="waiter-orders">
            {queue.map((o) => (
              <article key={o.id}>
                <div>
                  <Status>{o.status}</Status>
                  <h3>
                    Pedido #{o.id} ·{" "}
                    {o.table
                      ? `Mesa ${o.tableGroup?.join(" + ") || o.table}`
                      : o.customer}
                  </h3>
                  <p>
                    {o.channel} ·{" "}
                    {o.items.map((l) => `${l.qty}× ${l.name}`).join(" · ")} ·{" "}
                    {money(total(o))}
                  </p>
                </div>
                <Button disabled={!session.open} onClick={() => pay([o.id])}>
                  Cobrar
                </Button>
              </article>
            ))}
            {pickupReady.map((o) => (
              <article key={o.id}>
                <div>
                  <Status>Listo</Status>
                  <h3>
                    Pedido #{o.id} · {o.customer}
                  </h3>
                  <p>Para llevar · Pagado · {money(total(o))}</p>
                </div>
                <Button
                  onClick={() => {
                    d.updateOrder(o.id, {
                      status: "Entregado",
                      served: true,
                      arrival: Date.now(),
                    })
                    d.log(
                      `Pedido #${o.id} recogido en tienda`,
                      branch,
                      "Cajero",
                    )
                    notify(`Recojo #${o.id} confirmado.`)
                  }}
                >
                  Confirmar recojo
                </Button>
              </article>
            ))}
            {!queue.length && !pickupReady.length && (
              <div className="kanban-empty">
                <CheckCircle2 />
                Sin cuentas pendientes
              </div>
            )}
          </section>
        </main>
      ) : (
        <main>
          <div className="ops-summary">
            <div>
              <h1>
                {tab === "Delivery"
                  ? "Despacho de delivery"
                  : "Liquidación de repartidores"}
              </h1>
              <p>
                {tab === "Delivery"
                  ? `${d.freeRiders(branch).length} repartidores libres · Pedidos listos de cocina`
                  : "El efectivo entra a la caja al liquidar el cobro."}
              </p>
            </div>
          </div>
          <section className="dispatch-board">
            {(tab === "Delivery" ? ready : completed).map((o) => (
              <article className="dispatch-card" key={o.id}>
                <div className="dispatch-head">
                  <strong>#{o.id}</strong>
                  <Status>
                    {tab === "Delivery" ? "Listo" : "Por liquidar"}
                  </Status>
                </div>
                <h3>{o.customer}</h3>
                <p>
                  <MapPin />
                  {o.address}
                </p>
                <p>{o.reference}</p>
                <div className="dispatch-meta">
                  <span>
                    Método<b>{o.paid ? "Pagado" : o.method}</b>
                  </span>
                  <span>
                    Importe<b>{money(total(o))}</b>
                  </span>
                </div>
                {tab === "Delivery" ? (
                  <>
                    <label className="dispatch-rider-label">
                      Repartidor libre
                      <select
                        aria-label={`Repartidor para #${o.id}`}
                        value={riders[o.id] || ""}
                        onChange={(e) =>
                          setRiders((rs) => ({ ...rs, [o.id]: e.target.value }))
                        }
                      >
                        <option value="">Selecciona un repartidor</option>
                        {d.freeRiders(branch).map((e) => (
                          <option key={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </label>
                    <Button
                      className="full"
                      disabled={!riders[o.id]}
                      onClick={() => {
                        if (d.assignRider(o.id, riders[o.id]))
                          notify(`Pedido #${o.id} asignado a ${riders[o.id]}.`)
                        else notify("El repartidor ya está ocupado.")
                      }}
                    >
                      <Bike /> Asignar despacho
                    </Button>
                  </>
                ) : (
                  <>
                    <p>Repartidor: {o.rider}</p>
                    <Button
                      className="full"
                      disabled={!session.open}
                      onClick={() => {
                        if (d.settleDelivery(o.id))
                          notify(`Cobro #${o.id} liquidado en caja.`)
                      }}
                    >
                      Liquidar cobro
                    </Button>
                  </>
                )}
              </article>
            ))}
          </section>
          {!(tab === "Delivery" ? ready : completed).length && (
            <div className="kanban-empty">
              <CheckCircle2 />
              Todo al día en esta sede
            </div>
          )}
        </main>
      )}
      {catalog && (
        <CatalogPicker onAdd={add} onClose={() => setCatalog(false)} />
      )}
      {posModal && (
        <Dialog
          title={
            posModal === "pago"
              ? `Cobrar ${due.map((o) => `#${o.id}`).join(", ")}`
              : posModal === "apertura"
                ? session.open
                  ? "Apertura del turno"
                  : "Abrir caja"
                : posModal === "comprobante"
                  ? "Comprobante de pago"
                  : "Cierre y arqueo de caja"
          }
          onClose={() => setPosModal(null)}
          receipt={posModal === "pago" || posModal === "comprobante"}
        >
          {posModal === "comprobante" && lastReceipt ? (
            <>
              <div className="movement-list">
                <span>
                  <b>{lastReceipt.receipt}</b>
                  {branch} ·{" "}
                  {new Date(lastReceipt.time).toLocaleString("es-PE")}
                </span>
                <span>
                  <b>
                    Pedidos{" "}
                    {lastReceipt.orderIds.map((id) => `#${id}`).join(", ")}
                  </b>
                  {lastReceipt.method} ·{" "}
                  {lastReceipt.document || "Consumidor final"}
                </span>
              </div>
              <div className="builder-total">
                <span>
                  Subtotal <b>{money(lastReceipt.amount / 1.18)}</b>
                </span>
                <span>
                  IGV (18%){" "}
                  <b>{money(lastReceipt.amount - lastReceipt.amount / 1.18)}</b>
                </span>
                <span>
                  Total <strong>{money(lastReceipt.amount)}</strong>
                </span>
              </div>
              <p className="modal-copy">
                Comprobante de demostración. No tiene validez tributaria ni
                procesa dinero real.
              </p>
              <div className="option-form-actions">
                <Button variant="outline" onClick={() => window.print()}>
                  Imprimir comprobante
                </Button>
                <Button onClick={() => setPosModal(null)}>Cerrar</Button>
              </div>
            </>
          ) : posModal === "apertura" && session.open ? (
            <>
              <div className="movement-list">
                <span>
                  <b>Fondo de apertura</b>
                  {money(session.opening)} ·{" "}
                  {new Date(session.opened).toLocaleString("es-PE")}
                </span>
              </div>
              <div className="option-form-actions">
                <Button onClick={() => setPosModal(null)}>Cerrar</Button>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              {posModal === "pago" ? (
                <>
                  <div className="builder-total">
                    <span>
                      Total a cobrar <strong>{money(dueTotal)}</strong>
                    </span>
                  </div>
                  <label>
                    Comprobante
                    <select
                      value={receiptType}
                      onChange={(e) =>
                        setReceiptType(e.target.value as "Boleta" | "Factura")
                      }
                    >
                      <option>Boleta</option>
                      <option>Factura</option>
                    </select>
                  </label>
                  <label>
                    {receiptType === "Boleta" ? "DNI (opcional)" : "RUC"}
                    <input
                      key={receiptType}
                      name="document"
                      required={receiptType === "Factura"}
                      pattern={
                        receiptType === "Factura" ? "[0-9]{11}" : "[0-9]{8}"
                      }
                      maxLength={receiptType === "Factura" ? 11 : 8}
                      placeholder={
                        receiptType === "Factura" ? "11 dígitos" : "8 dígitos"
                      }
                    />
                  </label>
                  <label>
                    Medio de pago
                    <select
                      value={method}
                      onChange={(e) =>
                        setMethod(e.target.value as PaymentMethod)
                      }
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
                          aria-label="Efectivo recibido"
                          type="number"
                          min={dueTotal.toFixed(2)}
                          step=".01"
                          required
                          value={received}
                          onChange={(e) => setReceived(e.target.value)}
                        />
                      </label>
                      <label>
                        Vuelto
                        <strong className="cash-change">
                          {money(Math.max(0, Number(received) - dueTotal))}
                        </strong>
                      </label>
                    </div>
                  )}
                  <div className="builder-total">
                    <span>
                      Subtotal <b>{money(dueTotal / 1.18)}</b>
                    </span>
                    <span>
                      IGV (18%) <b>{money(dueTotal - dueTotal / 1.18)}</b>
                    </span>
                    <span>
                      Total <strong>{money(dueTotal)}</strong>
                    </span>
                  </div>
                </>
              ) : posModal === "apertura" ? (
                <label>
                  Fondo inicial (S/)
                  <input
                    name="opening"
                    type="number"
                    required
                    min="0"
                    step=".01"
                    defaultValue="300"
                  />
                </label>
              ) : (
                <>
                  <div className="movement-list">
                    <span>
                      <b>Efectivo esperado</b>
                      {money(session.opening + sums.cash)} · Incluye fondo{" "}
                      {money(session.opening)}
                    </span>
                    <span>
                      <b>Yape / Plin / Tarjeta</b>
                      {money(sums.yape)} / {money(sums.plin)} /{" "}
                      {money(sums.card)}
                    </span>
                  </div>
                  <label>
                    Efectivo contado
                    <input
                      name="counted"
                      type="number"
                      min="0"
                      step=".01"
                      required
                    />
                  </label>
                </>
              )}
              <div className="option-form-actions">
                <Button variant="outline" onClick={() => setPosModal(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {posModal === "pago"
                    ? "Confirmar cobro"
                    : posModal === "apertura"
                      ? "Confirmar apertura"
                      : "Cerrar turno"}
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      )}
      <Notice text={notice} />
      <RoleSwitcher onRole={onRole} current="cajero" />
    </div>
  )
}
type TableAction = "abrir" | "fusionar" | "cambiar" | "cuenta" | "separar" | "reservar" | "autorizar" | null
function Waiter({
  onLogout,
  onRole,
}: {
  onLogout: () => void
  onRole: (r: Role) => void
}) {
  const d = useDemoData()
  const branch = d.activeBranch
  const tables = d.tablesFor(branch)
  const [selected, setSelected] = useState<number[]>([5, 6])
  const [merged, setMerged] = useState<number[]>([])
  const [action, setAction] = useState<TableAction>(null)
  const [notice, notify] = useNotice()
  const [catalog, setCatalog] = useState(false)
  const [draft, setDraft] = useState<Line[]>([])
  const [moveTarget, setMoveTarget] = useState<number | null>(null)
  const [guests, setGuests] = useState(4)
  const [waiter, setWaiter] = useState("Carlos Ruiz")
  const [reason, setReason] = useState("")
  useEffect(() => {
    setSelected([])
    setMerged([])
    setDraft([])
  }, [branch])
  const activeTables = (merged.length ? merged : selected).filter((id) =>
    tables.some((t) => t.id === id),
  )
  const existing = d.orders.filter(
    (o) =>
      o.branch === branch &&
      (!o.paid || !o.served) &&
      o.status !== "Anulado" &&
      o.table &&
      (activeTables.includes(o.table) ||
        o.tableGroup?.some((id) => activeTables.includes(id))),
  )
  const activeTotal = existing
    .filter((o) => !o.paid)
    .reduce((s, o) => s + total(o), 0)
  const draftTotal = draft.reduce(
    (s, l) => s + d.priceFor(l.productId) * l.qty,
    0,
  )
  const toggleTable = (t: DiningTable) => {
    setMerged([])
    setDraft([])
    if (t.status === "Libre")
      setSelected((ids) =>
        ids.includes(t.id) ? ids.filter((id) => id !== t.id) : [...ids, t.id],
      )
    else setSelected([t.id])
  }
  const add = (id: number) => {
    const p = d.productsFor(branch).find((p) => p.id === id)!
    const qty = draft.find((l) => l.productId === id)?.qty || 0
    if (!p.available || qty >= p.stockActual) {
      notify("Stock disponible alcanzado.")
      return
    }
    setDraft((ls) =>
      qty
        ? ls.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
        : [
            ...ls,
            {
              productId: id,
              name: p.name,
              price: d.priceFor(id),
              qty: 1,
              note: "",
            },
          ],
    )
  }
  const confirmAction = () => {
    if (action === "abrir") {
      d.setTableState(branch, activeTables, {
        status: "Ocupada",
        waiter,
        guests,
      })
      notify("Atención abierta y mesero asignado.")
    }
    if (action === "fusionar") {
      if (selected.length < 2) {
        notify("Selecciona al menos dos mesas.")
        return
      }
      d.mergeTables(branch, selected)
      setMerged(selected)
      notify(`Mesas ${selected.join(" + ")} fusionadas temporalmente.`)
    }
    if (action === "cambiar") {
      if (!moveTarget || !d.moveTables(branch, activeTables, moveTarget)) {
        notify("Selecciona una mesa libre de destino.")
        return
      }
      setSelected([moveTarget])
      setMerged([])
      notify(`Atención trasladada a Mesa ${moveTarget} sin perder el pedido.`)
    }
    if (action === "cuenta") {
      d.requestBill(branch, activeTables)
      notify("Cuenta solicitada. Caja recibió las comandas.")
    }
    if (action === "separar") {
      d.separateTables(branch, activeTables)
      setMerged([])
      setSelected([])
      notify("Mesas separadas sin borrar los pedidos.")
    }
    if (action === "reservar") {
      if (
        !moveTarget ||
        tables.find((t) => t.id === moveTarget)?.status !== "Libre"
      ) {
        notify("Selecciona una mesa libre.")
        return
      }
      d.setTableState(branch, [moveTarget], {
        status: "Reservada",
        waiter,
        guests,
      })
      d.log(`Reserva de Mesa ${moveTarget}`, branch, "Mesero")
      notify(`Reserva registrada para Mesa ${moveTarget}.`)
    }
    if (action === "autorizar") {
      if (reason.trim().length < 8) {
        notify("Indica un motivo de al menos 8 caracteres.")
        return
      }
      existing.forEach((o) =>
        d.updateOrder(o.id, { reason: `Solicitud de anulación: ${reason}` }),
      )
      d.log(
        `Solicitud de anulación de pedidos ${existing.map((o) => o.id).join(", ")}: ${reason}`,
        branch,
        "Mesero",
      )
      notify("Solicitud enviada al Gerente. El pedido no se ha anulado.")
    }
    setAction(null)
  }
  const sendToKitchen = () => {
    if (!activeTables.length) return
    const id = d.placeOrder({
      branch,
      channel: "Salón",
      table: activeTables[0],
      tableGroup: activeTables.length > 1 ? activeTables : undefined,
      customer: `Mesa ${activeTables.join(" + ")}`,
      items: draft,
    })
    if (!id) {
      notify("Revisa las cantidades: la disponibilidad de tienda cambió.")
      return
    }
    if (activeTables.length > 1) {
      d.mergeTables(branch, activeTables)
      setMerged(activeTables)
    }
    setDraft([])
    notify(`Pedido #${id} enviado a Cocina. Stock descontado.`)
  }
  const counts = (status: string) =>
    tables.filter((t) => t.status === status).length
  return (
    <div className="ops-page waiter waiter-v2">
      <header className="ops-header">
        <Brand />
        <div className="ops-title">
          <Utensils />
          <div>
            <b>Salón · Atención de mesas</b>
            <span>Sede {branch} · Carlos Ruiz</span>
          </div>
        </div>
        <div className="ops-right">
          <BranchPicker />
          <span className="live">
            <i /> TURNO ACTIVO
          </span>
          <Button variant="outline" onClick={onLogout}>
            <LogOut size={16} /> Salir
          </Button>
        </div>
      </header>
      <main>
        <div className="ops-summary">
          <div>
            <h1>Mesas del salón</h1>
            <p>
              {tables.length} mesas configuradas · selecciona varias para
              fusionar.
            </p>
          </div>
          <div className="service-stats">
            <span>
              <b>{counts("Libre")}</b> libres
            </span>
            <span>
              <b>{counts("Ocupada")}</b> ocupadas
            </span>
            <span>
              <b>{counts("Cuenta solicitada")}</b> cuenta solicitada
            </span>
          </div>
        </div>
        <div className="waiter-dashboard">
          <span>
            <b>{counts("Ocupada") + counts("Cuenta solicitada")}</b> Mis mesas
          </span>
          <span>
            <b>
              {
                d.orders.filter(
                  (o) =>
                    o.branch === branch &&
                    o.channel === "Salón" &&
                    ["Pendiente", "Preparando"].includes(o.status),
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
                    o.branch === branch &&
                    o.channel === "Salón" &&
                    o.status === "Listo",
                ).length
              }
            </b>{" "}
            Listos en cocina
          </span>
          <span>
            <b>{counts("Cuenta solicitada")}</b> Cuenta solicitada
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
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTable(t)}
                  className={`${
                    t.status === "Libre"
                      ? "free"
                      : t.status === "Ocupada"
                        ? "busy"
                        : t.status === "Reservada"
                          ? "reserved"
                          : "bill"
                  } ${
                    selected.includes(t.id) || merged.includes(t.id)
                      ? "selected"
                      : ""
                  }`}
                >
                  <div>
                    <Utensils />
                    <Status>{t.status}</Status>
                  </div>
                  <b>Mesa {String(t.id).padStart(2, "0")}</b>
                  <small>
                    {t.capacity} personas · {t.waiter}
                  </small>
                  {t.status !== "Libre" && (
                    <>
                      <span>
                        {t.guests} personas · {t.minutes} min
                      </span>
                      <strong>{money(t.total)}</strong>
                    </>
                  )}
                </button>
              ))}
            </div>
            <div className="table-quick-actions">
              <Button
                variant="outline"
                onClick={() => setAction("abrir")}
                disabled={!activeTables.length}
              >
                <Plus /> Abrir mesa
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction("fusionar")}
                disabled={!selected.length}
              >
                <Utensils /> Fusionar seleccionadas
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMoveTarget(null)
                  setAction("reservar")
                }}
              >
                <Clock3 /> Nueva reserva
              </Button>
            </div>
          </section>
          <aside className="table-attention">
            <div className="attention-head">
              <div>
                <span>ATENCIÓN ACTIVA</span>
                <h2>
                  {activeTables.length
                    ? `Mesa ${activeTables.join(" + Mesa ")}`
                    : "Selecciona una mesa"}
                </h2>
                <p>
                  Carlos Ruiz · {activeTables.length * 4} personas · {branch}
                </p>
              </div>
              {activeTables.length > 0 && (
                <Status>
                  {tables.find((t) => t.id === activeTables[0])?.status ||
                    "Libre"}
                </Status>
              )}
            </div>
            <div className="attention-actions">
              <button
                disabled={!activeTables.length}
                onClick={() => {
                  setMoveTarget(null)
                  setAction("cambiar")
                }}
              >
                Cambiar mesa
              </button>
              <button
                disabled={!selected.length}
                onClick={() => setAction("fusionar")}
              >
                Fusionar
              </button>
              <button
                disabled={!activeTables.length}
                onClick={() => setAction("separar")}
              >
                Separar
              </button>
            </div>
            <div className="attention-order">
              {existing.map((o) => (
                <div className="attention-row existing-comanda" key={o.id}>
                  <span>
                    <b>
                      #{o.id} · {o.status}
                    </b>
                    <small>
                      {o.items.map((l) => `${l.qty}× ${l.name}`).join(" · ")}
                    </small>
                  </span>
                  <strong>{money(total(o))}</strong>
                  {o.status === "Listo" && !o.served && (
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        if (d.serveOrder(o.id))
                          notify(`Pedido #${o.id} servido en mesa.`)
                      }}
                    >
                      Servir pedido
                    </button>
                  )}
                </div>
              ))}
              {draft.map((l) => (
                <div className="attention-row" key={l.productId}>
                  <span>
                    <b>{l.name}</b>
                    <input
                      className="line-note"
                      aria-label={`Nota de cocina ${l.name}`}
                      placeholder="Ej. Parte pecho, sin ají"
                      value={l.note}
                      onChange={(e) =>
                        setDraft((ls) =>
                          ls.map((x) =>
                            x.productId === l.productId
                              ? { ...x, note: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                  </span>
                  <div className="qty-control">
                    <button
                      aria-label={`Reducir ${l.name}`}
                      onClick={() =>
                        setDraft((ls) =>
                          ls.map((x) =>
                            x.productId === l.productId
                              ? { ...x, qty: x.qty - 1 }
                              : x,
                          ).filter((x) => x.qty > 0),
                        )
                      }
                    >
                      <Minus />
                    </button>
                    <span>{l.qty}</span>
                    <button
                      aria-label={`Aumentar ${l.name}`}
                      onClick={() => add(l.productId)}
                    >
                      <Plus />
                    </button>
                  </div>
                  <strong>{money(d.priceFor(l.productId) * l.qty)}</strong>
                </div>
              ))}
            </div>
            <button
              className="add-product"
              disabled={!activeTables.length}
              onClick={() => setCatalog(true)}
            >
              <Plus /> Agregar productos
            </button>
            <div className="attention-total">
              <span>
                Nueva comanda <b>{money(draftTotal)}</b>
              </span>
              <span>
                Enviadas a cocina <b>{money(activeTotal)}</b>
              </span>
              <span>
                Total acumulado{" "}
                <strong>{money(draftTotal + activeTotal)}</strong>
              </span>
            </div>
            <div className="attention-footer">
              <Button
                variant="outline"
                disabled={!draft.length || !activeTables.length}
                onClick={sendToKitchen}
              >
                <ChefHat /> Enviar a cocina
              </Button>
              <Button
                disabled={!existing.some((o) => !o.paid)}
                onClick={() => setAction("cuenta")}
              >
                <ReceiptText /> Solicitar cuenta
              </Button>
            </div>
            <button
              className="authorization-action"
              disabled={!existing.length}
              onClick={() => {
                setReason("")
                setAction("autorizar")
              }}
            >
              <Lock /> Cancelar producto con autorización
            </button>
          </aside>
        </div>
      </main>
      {catalog && (
        <CatalogPicker onAdd={add} onClose={() => setCatalog(false)} />
      )}
      {action && (
        <Dialog
          title={
            action === "abrir"
              ? "Abrir mesa"
              : action === "fusionar"
                ? "Fusionar mesas"
                : action === "cambiar"
                  ? "Cambiar mesa"
                  : action === "cuenta"
                    ? "Solicitar cuenta"
                    : action === "reservar"
                      ? "Nueva reserva"
                      : action === "autorizar"
                        ? "Solicitar autorización"
                        : "Separar mesas"
          }
          onClose={() => setAction(null)}
        >
          <p className="modal-copy">
            {action === "cambiar"
              ? "Se conserva el pedido y su tiempo de atención."
              : action === "fusionar"
                ? "Fusión temporal. No modifica la cantidad de mesas de la sede."
                : "Confirma los datos antes de continuar."}
          </p>
          {["abrir", "reservar"].includes(action) && (
            <>
              <label>
                Cantidad de personas
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.max(1, Number(e.target.value)))
                  }
                />
              </label>
              <label>
                Mesero asignado
                <select
                  value={waiter}
                  onChange={(e) => setWaiter(e.target.value)}
                >
                  {d.employees
                    .filter(
                      (e) =>
                        e.branch === branch && e.role === "mesero" && e.active,
                    )
                    .map((e) => (
                      <option key={e.id}>{e.name}</option>
                    ))}
                </select>
              </label>
            </>
          )}
          {["cambiar", "reservar"].includes(action) && (
            <div className="modal-table-options">
              {tables
                .filter(
                  (t) => t.status === "Libre" && !activeTables.includes(t.id),
                )
                .map((t) => (
                  <button
                    key={t.id}
                    className={moveTarget === t.id ? "selected" : ""}
                    onClick={() => setMoveTarget(t.id)}
                  >
                    Mesa {t.id}
                  </button>
                ))}
            </div>
          )}
          {action === "fusionar" && (
            <div className="modal-table-options">
              {tables
                .filter((t) => t.status !== "Reservada")
                .map((t) => (
                  <button
                    className={selected.includes(t.id) ? "selected" : ""}
                    key={t.id}
                    onClick={() =>
                      setSelected((ids) =>
                        ids.includes(t.id)
                          ? ids.filter((id) => id !== t.id)
                          : [...ids, t.id],
                      )
                    }
                  >
                    Mesa {t.id}
                  </button>
                ))}
            </div>
          )}
          {action === "autorizar" && (
            <label>
              Motivo
              <textarea
                value={reason}
                minLength={8}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
          )}
          <div className="option-form-actions">
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmAction}>Confirmar acción</Button>
          </div>
        </Dialog>
      )}
      <Notice text={notice} />
      <RoleSwitcher onRole={onRole} current="mesero" />
    </div>
  )
}
function Delivery({
  onLogout,
  onRole,
}: {
  onLogout: () => void
  onRole: (r: Role) => void
}) {
  const d = useDemoData()
  const [rider, setRider] = useState("José Ramírez")
  const [notice, notify] = useNotice()
  const deliveryOrders = d.orders.filter(
    (o) => o.rider === rider && o.status !== "Anulado",
  )
  const bag = deliveryOrders
    .filter(
      (o) =>
        o.delivery === "ENTREGADO" && o.method === "Efectivo" && !o.settled,
    )
    .reduce((s, o) => s + total(o), 0)
  return (
    <div className="ops-page delivery-page">
      <header className="ops-header">
        <Brand />
        <div className="ops-title">
          <Bike />
          <div>
            <b>Flota delivery propio</b>
            <span>Mis entregas asignadas · {rider}</span>
          </div>
        </div>
        <div className="ops-right">
          <label className="ops-branch">
            <UserRound />
            <select
              aria-label="Repartidor demo"
              value={rider}
              onChange={(e) => setRider(e.target.value)}
            >
              {d.employees
                .filter((e) => e.role === "repartidor" && e.active)
                .map((e) => (
                  <option key={e.id}>{e.name}</option>
                ))}
            </select>
          </label>
          <Button variant="outline" onClick={onLogout}>
            <LogOut size={16} /> Salir
          </Button>
        </div>
      </header>
      <main>
        <div className="ops-summary">
          <div>
            <h1>Mis entregas</h1>
            <p>Dirección, contacto y cobro de cada pedido asignado.</p>
          </div>
        </div>
        <div className="delivery-kpis">
          <article>
            <Package />
            <span>
              <b>
                {deliveryOrders.filter((o) => o.delivery === "ASIGNADO").length}
              </b>{" "}
              asignadas
            </span>
          </article>
          <article>
            <Bike />
            <span>
              <b>
                {deliveryOrders.filter((o) => o.delivery === "EN_RUTA").length}
              </b>{" "}
              en camino
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
          {deliveryOrders.map((o) => (
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
                <Status>
                  {o.delivery === "ASIGNADO"
                    ? "Asignado"
                    : o.delivery === "EN_RUTA"
                      ? "En camino"
                      : "Entregado"}
                </Status>
              </div>
              <h3>{o.customer}</h3>
              <p>
                <MapPin />
                {o.address}
              </p>
              <p>
                <b>Referencia:</b> {o.reference}
              </p>
              <p>
                <Phone />
                <a href={`tel:${o.phone}`}>{o.phone} · Llamar</a>
              </p>
              <div className="dispatch-meta">
                <span>
                  Motorizado<b>{o.rider}</b>
                </span>
                <span>
                  {o.paid ? "Ya está pagado" : "Cobro contra entrega"}
                  <b>
                    {money(total(o))} · {o.method}
                  </b>
                </span>
                {o.departure && (
                  <span>
                    Salida
                    <b>{new Date(o.departure).toLocaleTimeString("es-PE")}</b>
                  </span>
                )}
                {o.arrival && (
                  <span>
                    Entrega
                    <b>{new Date(o.arrival).toLocaleTimeString("es-PE")}</b>
                  </span>
                )}
              </div>
              {o.delivery !== "ENTREGADO" ? (
                <Button
                  className="full"
                  onClick={() => {
                    d.advanceDelivery(o.id)
                    notify(
                      o.delivery === "ASIGNADO"
                        ? `Pedido #${o.id} en camino.`
                        : `Pedido #${o.id} entregado. El cliente ya puede verlo.`,
                    )
                  }}
                >
                  {o.delivery === "ASIGNADO" ? (
                    <>
                      <Bike /> Iniciar ruta
                    </>
                  ) : (
                    <>
                      <CheckCircle2 /> Confirmar entrega
                    </>
                  )}
                </Button>
              ) : (
                <div className="delivery-done">
                  <CheckCircle2 />
                  {o.settled || o.method !== "Efectivo"
                    ? "Entrega completada"
                    : "Efectivo pendiente de rendición"}
                </div>
              )}
            </article>
          ))}
        </section>
        {!deliveryOrders.length && (
          <div className="kanban-empty">
            <CheckCircle2 />
            <span>
              No tienes entregas asignadas. Caja asigna los pedidos listos de
              cocina.
            </span>
          </div>
        )}
      </main>
      <Notice text={notice} />
      <RoleSwitcher onRole={onRole} current="repartidor" />
    </div>
  )
}

type ClientView = "menu" | "cart" | "checkout" | "confirmation" | "tracking" | "orders" | "order-detail" | "profile" | "addresses"
type CartLine = {
  name: string
  price: number
  image: string
  qty: number
  productId?: number
  note?: string
}

function Client({
  onLogout,
  onRole,
  initialView = "menu",
}: {
  onLogout: () => void
  onRole: (r: Role) => void
  initialView?: ClientView
}) {
  const data = useDemoData()
  const [branch, setBranch] = useState(data.activeBranch)
  const products = useCatalog(branch)
  const menuCategories = ["Todos", ...data.categories]
  const branches = data.branches
    .filter((b) => b.active)
    .map((b) => ({ ...b, status: "Abierto", hours: `Lun–Dom · ${b.hours}` }))
  const [view, setView] = useState<ClientView>(initialView)
  const mapCart = (ls: Line[]): CartLine[] =>
    ls.map((l) => ({
      ...l,
      price: data.priceFor(l.productId),
      image:
        data.products.find((p) => p.id === l.productId)?.image || foodImages[0],
    }))
  const cart = mapCart(data.clientCart)
  const setCart = (update: React.SetStateAction<CartLine[]>) =>
    data.setClientCart((ls) => {
      const next = typeof update === "function" ? update(mapCart(ls)) : update
      return next.map((l) => ({
        productId: l.productId || products.find((p) => p.name === l.name)!.id,
        name: l.name,
        price: l.price,
        qty: l.qty,
        note: l.note || "",
      }))
    })
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  const [toast, setToast] = useNotice()
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [orderType, setOrderType] =
  useState<"Delivery" | "Para llevar">("Delivery")
  const [payment, setPayment] = useState<PaymentMethod>("Yape")
  const [cashTendered, setCashTendered] = useState("")
  const [operationCode, setOperationCode] = useState("123456")
  const [diningTable, setDiningTable] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(
    data.addresses.find((a) => a.primary)?.id || data.addresses[0]?.id || 0,
  )
  const [selectedProduct, setSelectedProduct] =
    useState<typeof products[number] | null>(null)
  const [selectedCreams, setSelectedCreams] = useState([
    "Mayonesa",
    "Ají pollero",
  ])
  const [companion, setCompanion] = useState("")
  const [editingProfile, setEditingProfile] = useState(false)
  const profileForm = useRef<HTMLFormElement>(null)
  const [addressModal, setAddressModal] = useState(false)
  const [addressEditing, setAddressEditing] = useState<number | null>(null)
  const [orderPeriod, setOrderPeriod] = useState<"Recientes" | "Anteriores">(
    "Recientes",
  )
  const addresses = data.addresses,
    setAddresses = data.setAddresses
  const customerOrders = data.orders
    .filter((o) => o.customerId === 1)
    .sort((a, b) => b.created - a.created)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    customerOrders[0]?.id || null,
  )
  const tracked =
    customerOrders.find((o) => o.id === selectedOrderId) || customerOrders[0]
  const trackedCart: CartLine[] =
    tracked?.items.map((l) => ({
      ...l,
      image:
        data.products.find((p) => p.id === l.productId)?.image || foodImages[0],
    })) || []
  const trackedTotal = tracked
    ? tracked.items.reduce((s, l) => s + l.price * l.qty, 0) + tracked.shipping
    : 0
  const trackStep =
    tracked?.status === "Anulado"
      ? -1
      : tracked?.delivery === "ENTREGADO" || tracked?.status === "Entregado"
        ? tracked.channel === "Delivery Web"
          ? 4
          : 3
        : tracked?.delivery === "EN_RUTA"
          ? 3
          : tracked?.status === "Listo"
            ? 2
            : tracked?.status === "Preparando"
              ? 1
              : 0
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal =
    Math.round(
      cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 100,
    ) / 100
  const delivery = orderType === "Delivery" ? 5 : 0
  const total = Math.round((subtotal + delivery) * 100) / 100
  const selectedAddressData =
    addresses.find((a) => a.id === selectedAddress) ||
    addresses.find((a) => a.primary) ||
    addresses[0]
  const visibleProducts = products.filter(
    (p) =>
      p.active &&
      (category === "Todos" || p.category === category) &&
      (p.name + p.desc).toLowerCase().includes(query.toLowerCase()),
  )
  const notify = (message: string) => setToast(message)
  const go = (next: ClientView) => {
    setView(next)
    window.scrollTo(0, 0)
  }
  const chooseBranch = (value: string) => {
    setBranch(value)
    data.setActiveBranch(value)
  }
  const addProduct = (product: typeof products[number], qty = 1) => {
    const currentQty = cart.find((l) => l.name === product.name)?.qty || 0
    if (
      !product.active ||
      !product.available ||
      product.stockActual < currentQty + qty
    ) {
      notify("Este producto no tiene más stock disponible.")
      return
    }
    const note =
      product.category === "Gaseosas y Bebidas"
        ? ""
        : selectedCreams.length
          ? `Cremas: ${selectedCreams.join(", ")}`
          : "Sin cremas"
    setCart((current) => {
      const existing = current.find((l) => l.productId === product.id)
      return existing
        ? current.map((l) =>
            l.productId === product.id ? { ...l, qty: l.qty + qty, note } : l,
          )
        : [
            ...current,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              qty,
              note,
            },
          ]
    })
    notify(`${product.name} fue agregado al carrito.`)
  }
  const changeQty = (name: string, delta: number) => {
    const p = products.find((p) => p.name === name),
      current = cart.find((l) => l.name === name)
    if (
      delta > 0 &&
      (!p || !p.active || !p.available || p.stockActual <= (current?.qty || 0))
    ) {
      notify("Stock disponible alcanzado.")
      return
    }
    setCart((ls) =>
      ls.map((l) =>
        l.name === name ? { ...l, qty: Math.max(1, l.qty + delta) } : l,
      ),
    )
  }
  const removeLine = (name: string) => {
    setCart((ls) => ls.filter((l) => l.name !== name))
    notify("Producto eliminado del carrito.")
  }
  const startCheckout = () => {
    setCheckoutStep(1)
    go("checkout")
  }
  const confirmPayment = () => {
    if (orderType === "Delivery" && !selectedAddressData) {
      notify("Agrega una dirección para recibir tu pedido.")
      return
    }
    if (
      (payment === "Yape" || payment === "Plin") &&
      !/^\d{6}$/.test(operationCode)
    ) {
      notify("Ingresa el código demo de 6 dígitos.")
      return
    }
    if (
      payment === "Efectivo" &&
      cashTendered &&
      Number(cashTendered) < total
    ) {
      notify("El efectivo indicado no cubre el total del pedido.")
      return
    }
    const id = data.placeOrder({
      client: true,
      branch,
      channel:
        orderType === "Delivery"
          ? "Delivery Web"
          : orderType === "Para llevar"
            ? "Recojo"
            : "Salón",
      table: orderType === "En local" ? diningTable : undefined,
      customer: data.profile.name,
      items: cart.map((l) => ({
        productId: l.productId!,
        name: l.name,
        price: l.price,
        qty: l.qty,
        note: l.note || "",
      })),
      method: payment,
      address: selectedAddressData?.address,
      reference: selectedAddressData?.reference,
      phone: data.profile.phone,
    })
    if (!id) {
      notify(
        "La disponibilidad cambió. Revisa el carrito y la sede seleccionada.",
      )
      return
    }
    setSelectedOrderId(id)
    setCart([])
    go("confirmation")
  }
  const repeatOrder = (order = tracked) => {
    if (!order) {
      go("menu")
      return
    }
    const lines = order.items.filter((l) => {
      const p = products.find((p) => p.id === l.productId)
      return p?.active && p.available && p.stockActual >= l.qty
    })
    if (!lines.length) {
      notify(
        "Los productos de este pedido no están disponibles en la sede actual.",
      )
      go("menu")
      return
    }
    data.setClientCart(
      lines.map((l) => ({ ...l, price: data.priceFor(l.productId) })),
    )
    notify(
      lines.length === order.items.length
        ? "Tu pedido anterior se agregó al carrito."
        : "Se agregaron los productos disponibles. Revisa el carrito.",
    )
    go("cart")
  }
  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    const a: AddressItem = {
      id: addressEditing || Date.now(),
      alias: String(f.get("alias")).trim(),
      address: String(f.get("address")).trim(),
      reference: String(f.get("reference")).trim(),
      primary:
        addresses.find((a) => a.id === addressEditing)?.primary ||
        addresses.length === 0,
    }
    setAddresses((as) =>
      addressEditing ? as.map((x) => (x.id === a.id ? a : x)) : [...as, a],
    )
    setSelectedAddress(a.id)
    setAddressModal(false)
    setAddressEditing(null)
    notify("Dirección guardada correctamente.")
  }
  const saveProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    data.setProfile({
      name: String(f.get("name")),
      surname: String(f.get("surname")),
      dni: String(f.get("dni")),
      phone: String(f.get("phone")),
      email: String(f.get("email")),
    })
    setEditingProfile(false)
    notify("Tu perfil demo fue actualizado.")
  }
  const navButton = (label: string, target: ClientView) => (
    <button
      className={view === target ? "active" : ""}
      onClick={() => go(target)}
    >
      {label}
    </button>
  )

  return (
    <div className="client-page">
      <header className="client-header">
        <button className="brand-button" onClick={() => go("menu")}>
          <Brand />
        </button>
        <nav>
          {navButton("Inicio", "menu")}
          {navButton("Menú", "menu")}
          <button
            onClick={() => {
              go("menu")
              window.setTimeout(
                () =>
                  document
                    .querySelector(".client-products")
                    ?.scrollIntoView({ behavior: "smooth" }),
                50,
              )
            }}
          >
            Promociones
          </button>
          {navButton("Mis pedidos", "orders")}
          {navButton("Mis direcciones", "addresses")}
          {navButton("Mi perfil", "profile")}
        </nav>
        <div>
          <button
            className="notification"
            onClick={() =>
              notify(
                tracked
                  ? `Tu pedido #${tracked.id}: ${
                      tracked.delivery === "EN_RUTA"
                        ? "En camino"
                        : tracked.status
                    }.`
                  : "Todavía no tienes pedidos.",
              )
            }
          >
            <Bell />
            <i />
          </button>
          <button className="cart-chip" onClick={() => go("cart")}>
            <ShoppingCart /> Carrito <span>{cartCount}</span>
          </button>
          <button className="avatar" onClick={() => go("profile")}>
            LM
          </button>
          <button aria-label="Cerrar sesión" onClick={onLogout}>
            <LogOut />
          </button>
        </div>
      </header>

      {view === "menu" && (
        <main>
          <section className="client-welcome">
            <div>
              <span className="kicker">
                HOLA, {data.profile.name.toUpperCase()}
              </span>
              <h1>¿Qué se te antoja hoy?</h1>
              <p>
                Elige tus favoritos y recíbelos calientes, como recién salidos
                de nuestras brasas.
              </p>
              <div className="welcome-branch">
                <Store />
                <span>Sede de atención</span>
                <select
                  value={branch || "La Victoria"}
                  onChange={(e) => chooseBranch(e.target.value)}
                >
                  <option>La Victoria</option>
                  <option>Ferreñafe</option>
                  <option>Lambayeque</option>
                </select>
              </div>
              <div className="search-menu">
                <Search />
                <input
                  aria-label="Buscar en la carta"
                  placeholder="Busca pollo, broaster, mostritos o chaufa..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  onClick={() =>
                    document
                      .querySelector(".client-products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Buscar
                </button>
              </div>
            </div>
            <img src={foodImages[0]} alt="Pollo a la brasa" />
          </section>
          <section className="client-content">
            <div className="category-strip">
              {menuCategories.map((c) => (
                <button
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="client-layout">
              <div>
                <div className="client-section-head">
                  <div>
                    <h2>
                      {category === "Todos" ? "Recomendados para ti" : category}
                    </h2>
                    <p>Preparados al momento en BROS Chicken</p>
                  </div>
                  <button onClick={() => setCategory("Todos")}>
                    Ver todo <ArrowRight />
                  </button>
                </div>
                <div className="client-products">
                  {visibleProducts.map((p) => (
                    <article key={p.name}>
                      <button
                        className="product-thumb"
                        disabled={!p.available || !p.stockActual}
                        onClick={() => {
                          setSelectedProduct(p)
                          setCompanion("")
                        }}
                      >
                        <img src={p.image} alt={p.name} />
                      </button>
                      <span>{p.tag}</span>
                      <button
                        className="product-name"
                        disabled={!p.available || !p.stockActual}
                        onClick={() => {
                          setSelectedProduct(p)
                          setCompanion("")
                        }}
                      >
                        {p.name}
                      </button>
                      <p>{p.desc}</p>
                      <div>
                        <strong>S/ {p.price.toFixed(2)}</strong>
                        <button
                          aria-label={`Agregar ${p.name}`}
                          disabled={!p.available || !p.stockActual}
                          onClick={() => {
                            setSelectedProduct(p)
                            setCompanion("")
                          }}
                        >
                          <Plus />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <aside className="mini-cart">
                <div className="mini-cart-head">
                  <h3>Tu pedido</h3>
                  <span>{cartCount} productos</span>
                </div>
                <div className="delivery-mode">
                  <button
                    className={orderType === "Delivery" ? "active" : ""}
                    onClick={() => setOrderType("Delivery")}
                  >
                    <Truck /> Delivery
                  </button>
                  <button
                    className={orderType === "Para llevar" ? "active" : ""}
                    onClick={() => setOrderType("Para llevar")}
                  >
                    <ShoppingBag /> Recojo
                  </button>
                </div>
                {orderType === "Delivery" && (
                  <button
                    className="delivery-address"
                    onClick={() => go("addresses")}
                  >
                    <MapPin /> {selectedAddressData?.address} <ChevronRight />
                  </button>
                )}
                {cart[0] ? (
                  <div className="mini-item">
                    <img src={cart[0].image} />
                    <div>
                      <b>{cart[0].name}</b>
                      <small>S/ {cart[0].price.toFixed(2)}</small>
                      <div>
                        <button onClick={() => changeQty(cart[0].name, -1)}>
                          −
                        </button>
                        <span>{cart[0].qty}</span>
                        <button onClick={() => changeQty(cart[0].name, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mini-empty">Aún no agregaste productos.</p>
                )}
                <div className="cart-sum">
                  <span>
                    Subtotal <b>S/ {subtotal.toFixed(2)}</b>
                  </span>
                  <span>
                    Delivery <b>S/ {delivery.toFixed(2)}</b>
                  </span>
                  <span>
                    Total <strong>S/ {total.toFixed(2)}</strong>
                  </span>
                </div>
                <Button
                  className="full"
                  onClick={() =>
                    cart.length
                      ? go("cart")
                      : notify("Agrega un producto para continuar.")
                  }
                >
                  Ver carrito <ArrowRight />
                </Button>
                <small className="safe-pay">
                  <CreditCard /> Pago seguro con Yape, Plin o tarjeta
                </small>
              </aside>
            </div>
          </section>
        </main>
      )}

      {view === "cart" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="TU PEDIDO"
            title="Carrito de compras"
            copy="Revisa tus productos antes de continuar."
            onBack={() => go("menu")}
          />
          {cart.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart />}
              title="Tu carrito está vacío"
              copy="Agrega tus favoritos del menú para empezar un pedido."
              action="Ver menú"
              onAction={() => go("menu")}
            />
          ) : (
            <div className="cart-page-grid">
              <section className="cart-list">
                <div className="cart-list-head">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Precio</span>
                  <span>Subtotal</span>
                </div>
                {cart.map((line) => (
                  <article key={line.name}>
                    <img src={line.image} alt={line.name} />
                    <div>
                      <b>{line.name}</b>
                      <small>Disponible · Preparado al momento</small>
                      <button
                        onClick={() =>
                          setSelectedProduct(
                            products.find((p) => p.name === line.name) ??
                              products[0],
                          )
                        }
                      >
                        Ver producto
                      </button>
                    </div>
                    <div className="qty-control">
                      <button onClick={() => changeQty(line.name, -1)}>
                        <Minus />
                      </button>
                      <span>{line.qty}</span>
                      <button onClick={() => changeQty(line.name, 1)}>
                        <Plus />
                      </button>
                    </div>
                    <strong>S/ {line.price.toFixed(2)}</strong>
                    <strong>S/ {(line.price * line.qty).toFixed(2)}</strong>
                    <button
                      className="delete-line"
                      onClick={() => removeLine(line.name)}
                    >
                      <Trash2 />
                    </button>
                  </article>
                ))}
                <button
                  className="continue-shopping"
                  onClick={() => go("menu")}
                >
                  ← Continuar comprando
                </button>
              </section>
              <aside className="order-total">
                <h3>Resumen del pedido</h3>
                <span>
                  Subtotal <b>S/ {subtotal.toFixed(2)}</b>
                </span>
                <span>
                  Delivery <b>Se calcula después</b>
                </span>
                <span className="grand-total">
                  Total <strong>S/ {subtotal.toFixed(2)}</strong>
                </span>
                <Button className="full" onClick={startCheckout}>
                  Continuar pedido <ArrowRight />
                </Button>
                <small>
                  <Check /> Puedes modificar tu pedido antes de pagar.
                </small>
              </aside>
            </div>
          )}
        </main>
      )}

      {view === "checkout" && (
        <main className="client-subpage checkout-page">
          <SubpageHead
            kicker="REALIZAR PEDIDO"
            title="Completa tu pedido"
            copy="Sigue los pasos para confirmar tu compra."
            onBack={() =>
              checkoutStep === 1
                ? go("cart")
                : setCheckoutStep(checkoutStep - 1)
            }
          />
          <CheckoutProgress step={checkoutStep} />
          <section className="checkout-card">
            {checkoutStep === 1 && (
              <>
                <div className="checkout-title">
                  <span>01</span>
                  <div>
                    <h2>Selecciona una sede</h2>
                    <p>Tu pedido será preparado en la sede que elijas.</p>
                  </div>
                </div>
                <div className="branch-options">
                  {branches.map((b) => (
                    <button
                      className={branch === b.name ? "selected" : ""}
                      onClick={() => chooseBranch(b.name)}
                      key={b.name}
                    >
                      <div>
                        <Store />
                        <Status>{b.status}</Status>
                      </div>
                      <h3>{b.name}</h3>
                      <p>
                        <MapPin />
                        {b.address}
                      </p>
                      <p>
                        <Phone />
                        {b.phone}
                      </p>
                      <p>
                        <Clock3 />
                        {b.hours}
                      </p>
                      <span>
                        {branch === b.name ? (
                          <>
                            <Check /> Sede seleccionada
                          </>
                        ) : (
                          "Seleccionar"
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                {branch && (
                  <div className="selection-note">
                    <CheckCircle2 /> Sede seleccionada: <b>{branch}</b>
                  </div>
                )}
                <div className="checkout-actions">
                  <Button variant="outline" onClick={() => go("cart")}>
                    Volver al carrito
                  </Button>
                  <Button
                    onClick={() =>
                      branch
                        ? setCheckoutStep(2)
                        : notify("Selecciona una sede para continuar.")
                    }
                  >
                    Continuar <ArrowRight />
                  </Button>
                </div>
              </>
            )}
            {checkoutStep === 2 && (
  <>
    <div className="checkout-title">
      <span>02</span>
      <div>
        <h2>Tipo de pedido</h2>
        <p>Elige cómo deseas recibir tu pedido.</p>
      </div>
    </div>
    <div
      className="order-type-options"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 320px))",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      {[
        {
          name: "Delivery",
          icon: Truck,
          copy: "Lo llevamos a tu dirección",
        },
        {
          name: "Para llevar",
          icon: ShoppingBag,
          copy: "Recógelo en la sede",
        },
      ].map((option) => (
        <button
          className={orderType === option.name ? "selected" : ""}
          onClick={() =>
            setOrderType(option.name as typeof orderType)
          }
          key={option.name}
        >
          <option.icon />
          <b>{option.name.toUpperCase()}</b>
          <span>{option.copy}</span>
          {orderType === option.name && <CheckCircle2 />}
        </button>
      ))}
    </div>
    {orderType === "Delivery" && (
      <div className="delivery-details">
        <h3>Mis direcciones</h3>
        {addresses.map((a) => (
          <button
            className={selectedAddress === a.id ? "selected" : ""}
            onClick={() => setSelectedAddress(a.id)}
            key={a.id}
          >
            <MapPin />
            <div>
              <b>
                {a.alias}
                {a.primary && <em>Principal</em>}
              </b>
              <span>{a.address}</span>
              <small>Ref. {a.reference}</small>
            </div>
            {selectedAddress === a.id && <CheckCircle2 />}
          </button>
        ))}
        <div className="delivery-info">
          <span>
            Teléfono <b>{data.profile.phone}</b>
          </span>
          <span>
            Costo de delivery <b>S/ 5.00</b>
          </span>
        </div>
        <button
          onClick={() => {
            setAddressEditing(null)
            setAddressModal(true)
          }}
        >
          <Plus /> Agregar dirección
        </button>
      </div>
    )}
    {orderType === "Para llevar" && (
      <div className="mode-message">
        <ShoppingBag />
        <div>
          <b>Sede donde recogerás tu pedido</b>
          <span>{branch} · Te avisaremos cuando esté listo.</span>
        </div>
      </div>
    )}
    <div className="checkout-actions">
      <Button variant="outline" onClick={() => setCheckoutStep(1)}>
        Atrás
      </Button>
      <Button onClick={() => setCheckoutStep(3)}>
        Continuar <ArrowRight />
      </Button>
    </div>
  </>
)}
            {checkoutStep === 3 && (
              <>
                <div className="checkout-title">
                  <span>03</span>
                  <div>
                    <h2>Resumen del pedido</h2>
                    <p>Confirma que todos los datos sean correctos.</p>
                  </div>
                </div>
                <OrderSummary
                  cart={cart}
                  branch={branch}
                  orderType={orderType}
                  address={selectedAddressData?.address}
                  delivery={delivery}
                  total={total}
                />
                <div className="checkout-actions">
                  <Button variant="outline" onClick={() => go("cart")}>
                    <Pencil size={15} /> Editar pedido
                  </Button>
                  <Button
                    onClick={() =>
                      cart.length
                        ? setCheckoutStep(4)
                        : notify("Agrega productos antes de pagar.")
                    }
                  >
                    Continuar al pago <ArrowRight />
                  </Button>
                </div>
              </>
            )}
            {checkoutStep === 4 && (
              <>
                <div className="checkout-title">
                  <span>04</span>
                  <div>
                    <h2>Método de pago</h2>
                    <p>Selecciona cómo deseas pagar S/ {total.toFixed(2)}.</p>
                  </div>
                </div>
                <div className="payment-options">
                  {["Efectivo", "Yape", "Plin", "Tarjeta"].map((method) => (
                    <button
                      className={payment === method ? "selected" : ""}
                      onClick={() => setPayment(method as PaymentMethod)}
                      key={method}
                    >
                      <CreditCard />
                      <b>{method}</b>
                      {payment === method && <CheckCircle2 />}
                    </button>
                  ))}
                </div>
                {payment === "Efectivo" && (
                  <div className="payment-detail">
                    <b>Pago contra entrega</b>
                    <label>
                      ¿Con cuánto pagarás?
                      <input
                        type="number"
                        min={total.toFixed(2)}
                        step=".01"
                        placeholder={`Exacto: ${money(total)}`}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                      />
                    </label>
                  </div>
                )}
                {(payment === "Yape" || payment === "Plin") && (
                  <div className="payment-detail qr-detail">
                    <div className="fake-qr">DEMO</div>
                    <div>
                      <b>Paga con {payment}</b>
                      <span>
                        Pago simulado. No escanees ni transfieras dinero real.
                      </span>
                      <label>
                        Código de operación
                        <input
                          aria-label="Código de operación demo"
                          inputMode="numeric"
                          maxLength={6}
                          value={operationCode}
                          onChange={(e) => setOperationCode(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                )}
                {payment === "Tarjeta" && (
                  <div className="payment-detail card-form">
                    <label>
                      Número de tarjeta
                      <input
                        value="4000 0000 0000 0002"
                        readOnly
                        aria-label="Tarjeta de prueba"
                      />
                    </label>
                    <label>
                      Vencimiento
                      <input value="12/30" readOnly />
                    </label>
                    <label>
                      CVV
                      <input value="123" readOnly />
                    </label>
                  </div>
                )}
                <div className="checkout-actions">
                  <Button variant="outline" onClick={() => setCheckoutStep(3)}>
                    Atrás
                  </Button>
                  <Button onClick={confirmPayment}>
                    <Lock size={15} /> Confirmar pago
                  </Button>
                </div>
              </>
            )}
          </section>
        </main>
      )}

      {view === "confirmation" && tracked && (
        <main className="client-subpage">
          <section className="confirmation-card">
            <div className="success-icon">
              <Check />
            </div>
            <span>PEDIDO CONFIRMADO</span>
            <h1>Pedido realizado correctamente</h1>
            <p>
              Gracias, {data.profile.name}. Ya enviamos tu pedido a la cocina de{" "}
              {tracked.branch}.
            </p>
            <div className="order-number">
              Pedido <strong>#{tracked.id}</strong>
            </div>
            <div className="confirmation-data">
              <span>
                Sede <b>{tracked.branch}</b>
              </span>
              <span>
                Tipo de pedido{" "}
                <b>
                  {tracked.channel === "Recojo"
                    ? "Para llevar"
                    : tracked.channel === "Salón"
                      ? "En local"
                      : "Delivery"}
                </b>
              </span>
              {tracked.channel === "Delivery Web" && (
                <span>
                  Dirección <b>{tracked.address}</b>
                </span>
              )}
              <span>
                Método de pago{" "}
                <b>
                  {tracked.method} ·{" "}
                  {tracked.paid ? "Pagado demo" : "Contra entrega / caja"}
                </b>
              </span>
              <span>
                Total <b>S/ {trackedTotal.toFixed(2)}</b>
              </span>
              <span>
                Hora aproximada <b>25–35 min</b>
              </span>
            </div>
            <div className="confirmation-actions">
              <Button onClick={() => go("tracking")}>
                <Navigation /> Ver seguimiento
              </Button>
              <Button variant="outline" onClick={() => go("orders")}>
                Ver mis pedidos
              </Button>
              <button onClick={() => go("menu")}>Volver al inicio</button>
            </div>
          </section>
        </main>
      )}
      {view === "tracking" && (
        <main className="client-subpage">
          <SubpageHead
            kicker={tracked ? `PEDIDO #${tracked.id}` : "MIS PEDIDOS"}
            title="Seguimiento del pedido"
            copy={
              tracked
                ? `Tu pedido en ${tracked.branch}.`
                : "Realiza tu primer pedido para empezar."
            }
            onBack={() => go("orders")}
          />
          {tracked ? (
            <section className="tracking-card">
              <div className="tracking-head">
                <div>
                  <Status>
                    {tracked.delivery === "EN_RUTA"
                      ? "En camino"
                      : tracked.status}
                  </Status>
                  <h2>
                    {tracked.status === "Anulado"
                      ? "Pedido anulado"
                      : trackStep === 0
                        ? "Ya recibimos tu pedido"
                        : trackStep === 1
                          ? "Tu pedido está en las brasas"
                          : trackStep === 2
                            ? "Tu pedido está listo"
                            : trackStep === 3 &&
                                tracked.channel === "Delivery Web"
                              ? "Tu pedido va en camino"
                              : "Pedido entregado"}
                  </h2>
                  <p>
                    {tracked.status === "Anulado"
                      ? tracked.reason
                      : tracked.rider
                        ? `Te lo lleva: ${tracked.rider}`
                        : "Actualización en vivo con cocina y reparto"}
                  </p>
                </div>
                <ChefHat />
              </div>
              {tracked.status !== "Anulado" && (
                <div className="tracking-steps">
                  {(tracked.channel === "Delivery Web"
                    ? [
                        "Pedido recibido",
                        "En preparación",
                        "Listo",
                        "En camino",
                        "Entregado",
                      ]
                    : [
                        "Pedido recibido",
                        "En preparación",
                        "Listo",
                        "Entregado",
                      ]
                  ).map((state, i) => (
                    <div
                      className={
                        i < trackStep
                          ? "done"
                          : i === trackStep
                            ? "current"
                            : ""
                      }
                      key={state}
                    >
                      <span>{i < trackStep ? <Check /> : i + 1}</span>
                      <b>{state}</b>
                      <small>
                        {i <= trackStep ? "Confirmado" : "Pendiente"}
                      </small>
                    </div>
                  ))}
                </div>
              )}
              <OrderSummary
                cart={trackedCart}
                branch={tracked.branch}
                orderType={
                  tracked.channel === "Delivery Web"
                    ? "Delivery"
                    : tracked.channel === "Recojo"
                      ? "Para llevar"
                      : "En local"
                }
                address={tracked.address}
                delivery={tracked.shipping}
                total={trackedTotal}
                compact
              />
            </section>
          ) : (
            <EmptyState
              icon={<ShoppingCart />}
              title="Sin pedidos"
              copy="Elige tus favoritos para empezar."
              action="Ver menú"
              onAction={() => go("menu")}
            />
          )}
        </main>
      )}
      {view === "orders" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mis pedidos"
            copy="Consulta tus pedidos recientes y vuelve a pedir tus favoritos."
            onBack={() => go("menu")}
          />
          <div className="orders-tabs">
            {(["Recientes", "Anteriores"] as const).map((period) => (
              <button
                className={orderPeriod === period ? "active" : ""}
                onClick={() => setOrderPeriod(period)}
                key={period}
              >
                {period}
              </button>
            ))}
          </div>
          <section className="customer-orders">
            {customerOrders
              .filter((o) =>
                orderPeriod === "Recientes"
                  ? Date.now() - o.created <= 7 * 86400000
                  : Date.now() - o.created > 7 * 86400000,
              )
              .map((o) => (
                <article key={o.id}>
                  <div>
                    <Status>
                      {o.delivery === "EN_RUTA" ? "En camino" : o.status}
                    </Status>
                    <strong>#{o.id}</strong>
                    <span>{new Date(o.created).toLocaleString("es-PE")}</span>
                  </div>
                  <div>
                    <b>{o.branch}</b>
                    <span>
                      {o.channel} · {o.items.reduce((s, l) => s + l.qty, 0)}{" "}
                      productos
                    </span>
                  </div>
                  <strong>
                    S/{" "}
                    {(
                      o.items.reduce((s, l) => s + l.price * l.qty, 0) +
                      o.shipping
                    ).toFixed(2)}
                  </strong>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrderId(o.id)
                        go("order-detail")
                      }}
                    >
                      <Eye /> Ver detalle
                    </Button>
                    {o.status === "Entregado" || o.status === "Anulado" ? (
                      <Button onClick={() => repeatOrder(o)}>
                        <ShoppingCart /> Repetir pedido
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedOrderId(o.id)
                          go("tracking")
                        }}
                      >
                        <Navigation /> Seguimiento
                      </Button>
                    )}
                  </div>
                </article>
              ))}
          </section>
          {!customerOrders.filter((o) =>
            orderPeriod === "Recientes"
              ? Date.now() - o.created <= 7 * 86400000
              : Date.now() - o.created > 7 * 86400000,
          ).length && (
            <EmptyState
              icon={<ShoppingBag />}
              title="Sin pedidos en este período"
              copy="Puedes seguir explorando la carta."
              action="Ver menú"
              onAction={() => go("menu")}
            />
          )}
        </main>
      )}
      {view === "order-detail" && tracked && (
        <main className="client-subpage">
          <SubpageHead
            kicker={`PEDIDO #${tracked.id}`}
            title="Detalle del pedido"
            copy={`Realizado el ${new Date(tracked.created).toLocaleString("es-PE")}.`}
            onBack={() => go("orders")}
          />
          <section className="checkout-card">
            <OrderSummary
              cart={trackedCart}
              branch={tracked.branch}
              orderType={
                tracked.channel === "Delivery Web"
                  ? "Delivery"
                  : tracked.channel === "Recojo"
                    ? "Para llevar"
                    : "En local"
              }
              address={tracked.address}
              delivery={tracked.shipping}
              total={trackedTotal}
            />
            <div className="checkout-actions">
              <Button variant="outline" onClick={() => go("orders")}>
                Volver
              </Button>
              <Button onClick={() => repeatOrder(tracked)}>
                <ShoppingCart /> Repetir pedido
              </Button>
            </div>
          </section>
        </main>
      )}
      {view === "profile" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mi perfil"
            copy="Administra tus datos personales y seguridad."
            onBack={() => go("menu")}
          />
          <section className="profile-card">
            <div className="profile-avatar">
              {data.profile.name[0]}
              {data.profile.surname[0]}
            </div>
            <div className="profile-title">
              <h2>
                {data.profile.name} {data.profile.surname}
              </h2>
              <span>Cliente · Perfil de demostración</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setEditingProfile(!editingProfile)}
            >
              <Pencil /> {editingProfile ? "Cancelar" : "Editar información"}
            </Button>
            <form
              key={String(editingProfile)}
              ref={profileForm}
              className="profile-form"
              onSubmit={saveProfile}
            >
              {([
                ["dni", "DNI"],
                ["name", "Nombres"],
                ["surname", "Apellidos"],
                ["phone", "Teléfono"],
                ["email", "Correo"],
              ] as const).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    name={key}
                    type={key === "email" ? "email" : "text"}
                    defaultValue={data.profile[key]}
                    required
                    pattern={
                      key === "dni"
                        ? "[0-9]{8}"
                        : key === "phone"
                          ? "[0-9]{9}"
                          : undefined
                    }
                    disabled={!editingProfile}
                  />
                </label>
              ))}
            </form>
            {editingProfile && (
              <Button onClick={() => profileForm.current?.requestSubmit()}>
                Guardar cambios
              </Button>
            )}
            <button
              className="change-password"
              onClick={() => {
                data.log(
                  "Contraseña demo del Cliente restablecida",
                  branch,
                  data.profile.name,
                )
                notify(
                  "Acción demo completada. Clave temporal: BrosDemo2025! No se modifica ninguna cuenta real.",
                )
              }}
            >
              <Lock /> Cambiar contraseña <ChevronRight />
            </button>
          </section>
        </main>
      )}
      {view === "addresses" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mis direcciones"
            copy="Administra tus direcciones de entrega."
            onBack={() => go("menu")}
            action={
              <Button
                onClick={() => {
                  setAddressEditing(null)
                  setAddressModal(true)
                }}
              >
                <Plus /> Agregar dirección
              </Button>
            }
          />
          <section className="address-grid">
            {addresses.map((a) => (
              <article className={a.primary ? "primary" : ""} key={a.id}>
                <div>
                  <MapPin />
                  <span>{a.primary ? "Principal" : "Dirección guardada"}</span>
                </div>
                <h3>{a.alias}</h3>
                <p>{a.address}</p>
                <small>Referencia: {a.reference}</small>
                <div>
                  <button
                    onClick={() => {
                      setSelectedAddress(a.id)
                      setAddresses((list) =>
                        list.map((item) => ({
                          ...item,
                          primary: item.id === a.id,
                        })),
                      )
                      notify(`${a.alias} ahora es tu dirección principal.`)
                    }}
                  >
                    <CheckCircle2 /> Usar como principal
                  </button>
                  <button
                    onClick={() => {
                      setAddressEditing(a.id)
                      setAddressModal(true)
                    }}
                  >
                    <Pencil /> Editar
                  </button>
                  <button
                    onClick={() => {
                      const rest = addresses.filter((item) => item.id !== a.id)
                      setAddresses(
                        rest.map((item, i) => ({
                          ...item,
                          primary: a.primary ? i === 0 : item.primary,
                        })),
                      )
                      if (selectedAddress === a.id)
                        setSelectedAddress(rest[0]?.id || 0)
                      notify("Dirección eliminada.")
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
          </section>
          {!addresses.length && (
            <p className="option-empty">
              Agrega tu primera dirección de entrega.
            </p>
          )}
        </main>
      )}

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <X />
            </button>
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <div>
              <span className="kicker">
                {selectedProduct.category.toUpperCase()}
              </span>
              <h2>{selectedProduct.name}</h2>
              <p>
                {selectedProduct.desc}. Preparado al momento con nuestro aderezo
                secreto.
              </p>
              <Status>
                {selectedProduct.stockActual && selectedProduct.available
                  ? "Disponible"
                  : "Agotado"}
              </Status>
              <div className="cream-picker">
                <b>Elige tus cremas</b>
                <div>
                  {[
                    "Mayonesa",
                    "Ají pollero",
                    "Vinagreta",
                    "Tártara",
                    "Kétchup",
                    "Mostaza",
                  ].map((cream) => (
                    <button
                      className={
                        selectedCreams.includes(cream) ? "selected" : ""
                      }
                      onClick={() =>
                        setSelectedCreams((current) =>
                          current.includes(cream)
                            ? current.filter((item) => item !== cream)
                            : [...current, cream],
                        )
                      }
                      key={cream}
                    >
                      {selectedCreams.includes(cream) && <Check />} {cream}
                    </button>
                  ))}
                </div>
              </div>
              <label className="companion-picker">
                Bebida acompañante
                <select
                  value={companion}
                  onChange={(e) => setCompanion(e.target.value)}
                >
                  <option value="">Sin bebida adicional</option>
                  {products
                    .filter(
                      (p) =>
                        p.category === "Gaseosas y Bebidas" &&
                        p.id !== selectedProduct.id &&
                        p.active &&
                        p.available &&
                        p.stockActual > 0,
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} + {money(p.price)}
                      </option>
                    ))}
                </select>
              </label>
              <strong>S/ {selectedProduct.price.toFixed(2)}</strong>
              <Button
                onClick={() => {
                  addProduct(selectedProduct)
                  if (companion)
                    addProduct(
                      products.find((p) => p.id === Number(companion))!,
                    )
                  setSelectedProduct(null)
                }}
              >
                Agregar al carrito <ShoppingCart />
              </Button>
            </div>
          </section>
        </div>
      )}
      {addressModal && (
        <Dialog
          title={addressEditing ? "Editar dirección" : "Nueva dirección"}
          onClose={() => {
            setAddressModal(false)
            setAddressEditing(null)
          }}
        >
          <form onSubmit={saveAddress}>
            <label>
              Alias
              <input
                name="alias"
                defaultValue={
                  addresses.find((a) => a.id === addressEditing)?.alias
                }
                required
                placeholder="Casa, Trabajo, Familia..."
              />
            </label>
            <label>
              Dirección
              <input
                name="address"
                defaultValue={
                  addresses.find((a) => a.id === addressEditing)?.address
                }
                required
                placeholder="Calle, número y distrito"
              />
            </label>
            <label>
              Referencia
              <textarea
                name="reference"
                defaultValue={
                  addresses.find((a) => a.id === addressEditing)?.reference
                }
                required
                placeholder="Indicaciones para encontrar el lugar"
              />
            </label>
            <div className="option-form-actions">
              <Button variant="outline" onClick={() => setAddressModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar dirección</Button>
            </div>
          </form>
        </Dialog>
      )}
      {toast && (
        <div className="app-toast">
          <CheckCircle2 />
          {toast}
        </div>
      )}
      <RoleSwitcher onRole={onRole} current="cliente" />
    </div>
  )
}

function SubpageHead({
  kicker,
  title,
  copy,
  onBack,
  action,
}: {
  kicker: string
  title: string
  copy: string
  onBack: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="subpage-head">
      <div>
        <button onClick={onBack}>← Volver</button>
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  copy,
  action,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  copy: string
  action: string
  onAction: () => void
}) {
  return (
    <section className="empty-state">
      <div>{icon}</div>
      <h2>{title}</h2>
      <p>{copy}</p>
      <Button onClick={onAction}>
        {action} <ArrowRight />
      </Button>
    </section>
  )
}

function CheckoutProgress({ step }: { step: number }) {
  return (
    <div className="checkout-progress">
      {["Sede", "Modalidad", "Resumen", "Pago"].map((label, i) => (
        <div
          className={step > i + 1 ? "done" : step === i + 1 ? "active" : ""}
          key={label}
        >
          <span>{step > i + 1 ? <Check /> : i + 1}</span>
          <b>{label}</b>
        </div>
      ))}
    </div>
  )
}

function OrderSummary({
  cart,
  branch,
  orderType,
  address,
  delivery,
  total,
  compact = false,
}: {
  cart: CartLine[]
  branch: string
  orderType: string
  address?: string
  delivery: number
  total: number
  compact?: boolean
}) {
  return (
    <div className={`order-summary-full ${compact ? "compact" : ""}`}>
      <div className="summary-products">
        {cart.map((line) => (
          <div key={line.name}>
            <img src={line.image} />
            <span>
              <b>
                {line.qty}× {line.name}
              </b>
              <small>S/ {line.price.toFixed(2)} c/u</small>
            </span>
            <strong>S/ {(line.price * line.qty).toFixed(2)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-meta">
        <span>
          Sede <b>{branch}</b>
        </span>
        <span>
          Tipo de pedido <b>{orderType}</b>
        </span>
        {orderType === "Delivery" && (
          <span>
            Dirección <b>{address}</b>
          </span>
        )}
        <span>
          Costo de delivery <b>S/ {delivery.toFixed(2)}</b>
        </span>
        <span>
          Total <strong>S/ {total.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  )
}

function RoleSwitcher({
  onRole,
  current,
}: {
  onRole: (r: Role) => void
  current: Role
}) {
  return (
    <label className="role-switcher demo-role-select">
      <span>Selector rápido de rol · Modo Demo</span>
      <select
        aria-label="Selector rápido de rol (Modo Demo)"
        value={current}
        onChange={(e) => onRole(e.target.value as Role)}
      >
        {([
          "superadmin",
          "gerente",
          "admin",
          "cajero",
          "mesero",
          "cocina",
          "repartidor",
          "cliente",
        ] as Role[]).map((r) => (
          <option key={r} value={r}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
    </label>
  )
}

function AppContent() {
  const data = useDemoData()
  const [screen, setScreen] = useState<Screen>("landing")
  const [role, setRole] = useState<Role>("superadmin")
  const enter = (r: Role) => {
    setRole(r)
    setScreen("system")
    data.log(
      `Acceso Demo · ${roleLabels[r]}`,
      r === "admin" ? data.managerBranch : data.activeBranch,
      roleLabels[r],
    )
    window.scrollTo(0, 0)
  }
  if (screen === "landing")
    return (
      <Landing
        onLogin={() => setScreen("login")}
        onOrder={() => enter("cliente")}
      />
    )
  if (screen === "login")
    return <Login onBack={() => setScreen("landing")} onEnter={enter} />
  const shared = {
    onLogout: () => {
      data.log(
        `Sesión cerrada · ${roleLabels[role]}`,
        data.activeBranch,
        roleLabels[role],
      )
      setScreen("landing")
    },
    onRole: enter,
  }
  if (role === "superadmin" || role === "gerente" || role === "admin")
    return <Admin key={role} {...shared} role={role} />
  if (role === "cocina") return <Kitchen {...shared} />
  if (role === "cajero") return <Cashier {...shared} />
  if (role === "mesero") return <Waiter {...shared} />
  if (role === "repartidor") return <Delivery {...shared} />
  return <Client {...shared} />
}

export default function App() {
  return (
    <DemoProvider>
      <AppContent />
    </DemoProvider>
  )
}
