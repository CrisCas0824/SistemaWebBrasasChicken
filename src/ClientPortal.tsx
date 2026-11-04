import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Lock,
  LogOut,
  MapPin,
  Minus,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  Utensils,
  X,
} from "lucide-react"
import brosLogo from "./assets/bros-chicken-logo.png"
import { useDemoData } from "./demo-state"
import Action, { DemoModal, Empty, StateTag, useNotice } from "./demo-ui"
import { money, total, type ClientAddress, type Order } from "./model"

type View = "menu" | "cart" | "checkout" | "confirmation" | "tracking" | "orders" | "order-detail" | "profile" | "addresses"
interface Props {
  onLogout: () => void
  roleSwitcher: ReactNode
}
export default function ClientPortal({ onLogout, roleSwitcher }: Props) {
  const d = useDemoData()
  const { notify, feedback } = useNotice()
  const [view, setView] = useState<View>("menu")
  const [category, setCategory] = useState("Todos")
  const [query, setQuery] = useState("")
  const [promoOnly, setPromoOnly] = useState(false)
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState("Delivery")
  const [method, setMethod] = useState("Efectivo")
  const [addressId, setAddressId] = useState(
    d.addresses.find((a) => a.primary)?.id || d.addresses[0]?.id || 0,
  )
  const [table, setTable] = useState(8)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  )
  const [creams, setCreams] = useState(["Mayonesa", "Ají pollero"])
  const [note, setNote] = useState("")
  const [orderId, setOrderId] = useState<number | null>(d.lastOrderId)
  const [period, setPeriod] = useState("Recientes")
  const [addressModal, setAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(
    null,
  )
  const [editingProfile, setEditingProfile] = useState(false)
  const [passwordModal, setPasswordModal] = useState(false)
  const products = d.getProducts()
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const cart = d.cart.map((l) => ({
    ...l,
    price: d.priceFor(
      products.find((p) => p.id === l.productId) ||
        d.products.find((p) => p.id === l.productId)!,
    ),
    image: d.products.find((p) => p.id === l.productId)?.image || "",
  }))
  const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0)
  const count = cart.reduce((s, l) => s + l.qty, 0)
  const shipping = mode === "Delivery" ? 5 : 0
  const amount = subtotal + shipping
  const address =
    d.addresses.find((a) => a.id === addressId) ||
    d.addresses.find((a) => a.primary) ||
    d.addresses[0]
  const myOrders = d.orders
    .filter((o) => o.clientOrder)
    .slice()
    .sort((a, b) => b.created - a.created)
  const selectedOrder =
    myOrders.find((o) => o.id === orderId) ||
    myOrders.find((o) => o.id === d.lastOrderId) ||
    myOrders[0]
  const visible = products.filter(
    (p) =>
      p.active &&
      (category === "Todos" || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (!promoOnly ||
        d.promotions.some((c) => c.active && c.productId === p.id)),
  )
  useEffect(() => {
    if (!selectedProductId) return
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProductId(null)
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [selectedProductId])
  const go = (next: View) => {
    setView(next)
    window.scrollTo(0, 0)
  }
  const openProduct = (id: number) => {
    setSelectedProductId(id)
    setCreams(["Mayonesa", "Ají pollero"])
    setNote("")
  }
  const add = () => {
    if (!selectedProduct) return
    const current =
      d.cart.find((l) => l.productId === selectedProduct.id)?.qty || 0
    if (
      !selectedProduct.active ||
      !selectedProduct.available ||
      current >= selectedProduct.stockActual
    ) {
      notify("No hay más unidades disponibles de este producto.")
      return
    }
    const kitchenNote = [
      creams.length ? `Cremas: ${creams.join(", ")}` : "Sin cremas",
      note,
    ]
      .filter(Boolean)
      .join(". ")
    d.setCart((ls) =>
      ls.some((l) => l.productId === selectedProduct.id)
        ? ls.map((l) =>
            l.productId === selectedProduct.id
              ? { ...l, qty: l.qty + 1, note: kitchenNote }
              : l,
          )
        : [
            ...ls,
            {
              productId: selectedProduct.id,
              name: selectedProduct.name,
              price: d.priceFor(selectedProduct),
              qty: 1,
              note: kitchenNote,
            },
          ],
    )
    setSelectedProductId(null)
    notify(`${selectedProduct.name} agregado a tu carrito.`)
  }
  const quantity = (id: number, delta: number) => {
    const p = products.find((p) => p.id === id),
      l = d.cart.find((l) => l.productId === id)
    if (!p || !l) return
    if (delta > 0 && (!p.active || !p.available || l.qty >= p.stockActual)) {
      notify("Stock disponible alcanzado.")
      return
    }
    d.setCart((ls) =>
      ls.map((l) =>
        l.productId === id ? { ...l, qty: l.qty + delta } : l,
      ).filter((l) => l.qty > 0),
    )
  }
  const confirm = () => {
    if (mode === "Delivery" && !address) {
      notify("Agrega una dirección de entrega antes de confirmar.")
      return
    }
    const r = d.createOrder({
      branch: d.branch,
      channel:
        mode === "Delivery"
          ? "Delivery Web"
          : mode === "Para llevar"
            ? "Recojo"
            : "Salón",
      tables:
        mode === "En local"
          ? [Math.min(table, d.tables[d.branch].length)]
          : undefined,
      items: d.cart,
      method,
      customer: d.profile.name,
      phone: d.profile.phone,
      address: address?.address,
      reference: address?.reference,
      clientOrder: true,
    })
    notify(r.message)
    if (!r.ok) return
    d.setLastOrderId(r.order!.id)
    setOrderId(r.order!.id)
    d.setCart([])
    go("confirmation")
  }
  const repeat = (o: Order) => {
    const local = d.getProducts(o.branch)
    const lines = o.items
      .filter((l) => {
        const p = local.find((p) => p.id === l.productId)
        return p?.active && p.available && p.stockActual > 0
      })
      .map((l) => {
        const p = local.find((p) => p.id === l.productId)!
        return {
          ...l,
          price: d.priceFor(p),
          qty: Math.min(l.qty, p.stockActual),
        }
      })
    if (!lines.length) {
      notify("Los productos de ese pedido no están disponibles en esta sede.")
      return
    }
    d.setBranch(o.branch)
    d.setCart(lines)
    go("cart")
    notify(
      lines.length < o.items.length
        ? "Agregamos los productos disponibles; algunos están agotados."
        : "Tu pedido anterior ya está en el carrito.",
    )
  }
  const saveAddress = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const a = {
      id: editingAddress?.id || Date.now(),
      alias: String(f.get("alias")),
      address: String(f.get("address")),
      reference: String(f.get("reference")),
      primary: editingAddress?.primary ?? !d.addresses.length,
    }
    d.setAddresses((as) =>
      editingAddress ? as.map((x) => (x.id === a.id ? a : x)) : [...as, a],
    )
    setAddressId(a.id)
    setAddressModal(false)
    setEditingAddress(null)
    notify("Dirección guardada en tu libreta demo.")
  }
  const saveProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    d.setProfile({
      name: String(f.get("name")),
      phone: String(f.get("phone")),
      email: String(f.get("email")),
    })
    setEditingProfile(false)
    notify("Tus datos se actualizaron en esta sesión.")
  }
  const nav = (label: string, next: View) => (
    <button className={view === next ? "active" : ""} onClick={() => go(next)}>
      {label}
    </button>
  )
  const summary = (o: Order) => (
    <div className="order-summary-full compact">
      <div className="summary-products">
        {o.items.map((l, i) => (
          <div key={i}>
            <img
              src={d.products.find((p) => p.id === l.productId)?.image}
              alt=""
            />
            <span>
              <b>
                {l.qty}× {l.name}
              </b>
              <small>{l.note}</small>
            </span>
            <strong>{money(l.qty * l.price)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-meta">
        <span>
          Sede <b>{o.branch}</b>
        </span>
        <span>
          Modalidad <b>{o.channel === "Recojo" ? "Para llevar" : o.channel}</b>
        </span>
        {o.channel === "Delivery Web" && (
          <span>
            Dirección <b>{o.address}</b>
          </span>
        )}
        <span>
          Medio de pago{" "}
          <b>
            {o.method} · {o.paid ? "Pagado" : "Pago pendiente"}
          </b>
        </span>
        <span>
          Envío <b>{money(o.shipping)}</b>
        </span>
        <span>
          Total <strong>{money(total(o))}</strong>
        </span>
      </div>
    </div>
  )
  const renderTracking = (o: Order) => {
    const labels =
      o.channel === "Delivery Web"
        ? [
            "Pedido recibido",
            "En preparación",
            "Listo",
            "En camino",
            "Entregado",
          ]
        : ["Pedido recibido", "En preparación", "Listo", "Entregado"]
    const current =
      o.status === "Entregado" || o.delivery === "ENTREGADO"
        ? labels.length - 1
        : o.delivery === "EN_RUTA"
          ? 3
          : o.status === "Listo"
            ? 2
            : o.status === "Preparando"
              ? 1
              : 0
    return (
      <section className="tracking-card">
        <div className="tracking-head">
          <div>
            <StateTag>{o.status}</StateTag>
            <h2>
              {o.status === "Anulado"
                ? "Tu pedido fue anulado"
                : labels[current]}
            </h2>
            <p>
              {o.status === "Anulado"
                ? o.reason
                : `Actualizado en vivo · ${o.branch}${
                    o.rider ? ` · Repartidor: ${o.rider}` : ""
                  }`}
            </p>
          </div>
          <ChefHat />
        </div>
        {o.status !== "Anulado" && (
          <div className="tracking-steps">
            {labels.map((label, i) => (
              <div
                className={
                  i < current ? "done" : i === current ? "current" : ""
                }
                key={label}
              >
                <span>{i < current ? <Check /> : i + 1}</span>
                <b>{label}</b>
                <small>{i <= current ? "Confirmado" : "Pendiente"}</small>
              </div>
            ))}
          </div>
        )}
        {summary(o)}
      </section>
    )
  }
  return (
    <div className="client-page">
      <header className="client-header">
        <button className="brand-button" onClick={() => go("menu")}>
          <div className="brand">
            <img src={brosLogo} alt="BROS Chicken" />
          </div>
        </button>
        <nav>
          {nav("Inicio", "menu")}
          {nav("Menú", "menu")}
          <button
            onClick={() => {
              setPromoOnly(true)
              setQuery("")
              setCategory("Todos")
              go("menu")
            }}
          >
            Promociones
          </button>
          {nav("Mis pedidos", "orders")}
          {nav("Mis direcciones", "addresses")}
          {nav("Mi perfil", "profile")}
        </nav>
        <div>
          <button
            className="notification"
            aria-label="Estado de mi pedido"
            onClick={() =>
              selectedOrder
                ? (setOrderId(selectedOrder.id), go("tracking"))
                : notify("Aún no tienes pedidos registrados.")
            }
          >
            <Bell />
            <i />
          </button>
          <button className="cart-chip" onClick={() => go("cart")}>
            <ShoppingCart /> Carrito <span>{count}</span>
          </button>
          <button className="avatar" onClick={() => go("profile")}>
            {d.profile.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </button>
          <button aria-label="Cerrar sesión" onClick={onLogout}>
            <LogOut />
          </button>
        </div>
      </header>
      <nav className="client-mobile-nav">
        {nav("Menú", "menu")}
        {nav("Mis pedidos", "orders")}
        {nav("Direcciones", "addresses")}
        {nav("Perfil", "profile")}
        <button onClick={onLogout}>Salir</button>
      </nav>
      {view === "menu" && (
        <main>
          <section className="client-welcome">
            <div>
              <span className="kicker">
                HOLA, {d.profile.name.split(" ")[0].toUpperCase()}
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
                  aria-label="Sede de atención"
                  value={d.branch}
                  onChange={(e) => d.setBranch(e.target.value)}
                >
                  {d.branches
                    .filter((b) => b.active)
                    .map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name === "La Victoria"
                          ? "La Victoria (Sede Principal)"
                          : b.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="search-menu">
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Buscar en el menú"
                  placeholder="Busca pollo, broaster, mostritos o chaufa..."
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
            <img
              src={`${import.meta.env.BASE_URL}images/original-hero.jpg`}
              alt="Pollo a la brasa"
            />
          </section>
          <section className="client-content">
            <div className="category-strip">
              {["Todos", ...d.categories].map((c) => (
                <button
                  className={category === c && !promoOnly ? "active" : ""}
                  key={c}
                  onClick={() => {
                    setCategory(c)
                    setPromoOnly(false)
                  }}
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
                      {promoOnly
                        ? "Promociones activas"
                        : category === "Todos"
                          ? "Recomendados para ti"
                          : category}
                    </h2>
                    <p>
                      Preparados al momento en BROS Chicken · Stock en vivo de{" "}
                      {d.branch}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCategory("Todos")
                      setQuery("")
                      setPromoOnly(false)
                    }}
                  >
                    Ver todo <ArrowRight />
                  </button>
                </div>
                <div className="client-products">
                  {visible.map((p) => {
                    const promo = d.promotions.find(
                      (c) => c.active && c.productId === p.id,
                    )
                    return (
                      <article key={p.id}>
                        <button
                          className="product-thumb"
                          disabled={!p.available || !p.stockActual}
                          onClick={() => openProduct(p.id)}
                        >
                          <img src={p.image} alt={p.name} />
                        </button>
                        <span className={promo ? "sale-tag" : "catalog-label"}>
                          {!p.stockActual || !p.available
                            ? "Agotado"
                            : promo
                              ? `−${promo.discount}%`
                              : p.id === 1
                                ? "Más vendido"
                                : "Favorito"}
                        </span>
                        <button
                          className="product-name"
                          disabled={!p.available || !p.stockActual}
                          onClick={() => openProduct(p.id)}
                        >
                          {p.name}
                        </button>
                        <p>{p.description}</p>
                        <div>
                          <strong>{money(d.priceFor(p))}</strong>
                          <button
                            aria-label={`Agregar ${p.name}`}
                            disabled={!p.available || !p.stockActual}
                            onClick={() => openProduct(p.id)}
                          >
                            <Plus />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
                {!visible.length && (
                  <Empty>
                    No hay productos con estos filtros. Usa “Ver todo” para
                    volver a la carta.
                  </Empty>
                )}
              </div>
              <aside className="mini-cart">
                <div className="mini-cart-head">
                  <h3>Tu pedido</h3>
                  <span>{count} productos</span>
                </div>
                <div className="delivery-mode">
                  <button
                    className={mode === "Delivery" ? "active" : ""}
                    onClick={() => setMode("Delivery")}
                  >
                    <Truck /> Delivery
                  </button>
                  <button
                    className={mode === "Para llevar" ? "active" : ""}
                    onClick={() => setMode("Para llevar")}
                  >
                    <ShoppingBag /> Recojo
                  </button>
                </div>
                {mode === "Delivery" && (
                  <button
                    className="delivery-address"
                    onClick={() => go("addresses")}
                  >
                    <MapPin />
                    {address?.address || "Agrega una dirección"}
                    <ChevronRight />
                  </button>
                )}
                {cart[0] ? (
                  <div className="mini-item">
                    <img src={cart[0].image} alt="" />
                    <div>
                      <b>{cart[0].name}</b>
                      <small>{money(cart[0].price)}</small>
                      <div>
                        <button
                          aria-label="Reducir primer producto"
                          onClick={() => quantity(cart[0].productId, -1)}
                        >
                          −
                        </button>
                        <span>{cart[0].qty}</span>
                        <button
                          aria-label="Aumentar primer producto"
                          onClick={() => quantity(cart[0].productId, 1)}
                        >
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
                    Subtotal <b>{money(subtotal)}</b>
                  </span>
                  <span>
                    Delivery <b>{money(shipping)}</b>
                  </span>
                  <span>
                    Total <strong>{money(amount)}</strong>
                  </span>
                </div>
                <Action
                  className="full"
                  disabled={!cart.length}
                  onClick={() => go("cart")}
                >
                  Ver carrito <ArrowRight />
                </Action>
                <small className="safe-pay">
                  <CreditCard /> Pagos simulados · Efectivo, Yape, Plin o
                  tarjeta
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
            title="Carrito de pedido"
            copy="Revisa tus productos antes de continuar."
            back={() => go("menu")}
          />
          {!cart.length ? (
            <Empty>
              Aún no agregaste productos. Vuelve al Menú para elegir tus
              favoritos.
            </Empty>
          ) : (
            <div className="cart-page-grid">
              <section className="cart-list">
                <div className="cart-list-head">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Precio</span>
                  <span>Subtotal</span>
                </div>
                {cart.map((l) => (
                  <article key={l.productId}>
                    <img src={l.image} alt={l.name} />
                    <div>
                      <b>{l.name}</b>
                      <small>{l.note || "Sin observaciones"}</small>
                      <button onClick={() => openProduct(l.productId)}>
                        Ver producto
                      </button>
                    </div>
                    <div className="qty-control">
                      <button
                        aria-label={`Reducir ${l.name}`}
                        onClick={() => quantity(l.productId, -1)}
                      >
                        <Minus />
                      </button>
                      <span>{l.qty}</span>
                      <button
                        aria-label={`Aumentar ${l.name}`}
                        onClick={() => quantity(l.productId, 1)}
                      >
                        <Plus />
                      </button>
                    </div>
                    <strong>{money(l.price)}</strong>
                    <strong>{money(l.price * l.qty)}</strong>
                    <button
                      className="delete-line"
                      aria-label={`Eliminar ${l.name}`}
                      onClick={() =>
                        d.setCart((ls) =>
                          ls.filter((x) => x.productId !== l.productId),
                        )
                      }
                    >
                      <Trash2 />
                    </button>
                  </article>
                ))}
                <button
                  className="continue-shopping"
                  onClick={() => go("menu")}
                >
                  ← Continuar eligiendo
                </button>
              </section>
              <aside className="order-total">
                <h3>Resumen del pedido</h3>
                <span>
                  Subtotal <b>{money(subtotal)}</b>
                </span>
                <span>
                  Delivery <b>Se calcula después</b>
                </span>
                <span className="grand-total">
                  Total <strong>{money(subtotal)}</strong>
                </span>
                <Action
                  className="full"
                  onClick={() => {
                    setStep(1)
                    go("checkout")
                  }}
                >
                  Continuar pedido <ArrowRight />
                </Action>
                <small>
                  <Check /> Puedes modificar tu pedido antes de confirmar.
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
            copy="Sigue los pasos para confirmar tu pedido demo."
            back={() => (step === 1 ? go("cart") : setStep(step - 1))}
          />
          <div className="checkout-progress">
            {["Sede", "Modalidad", "Resumen", "Pago"].map((label, i) => (
              <div
                key={label}
                className={
                  step > i + 1 ? "done" : step === i + 1 ? "active" : ""
                }
              >
                <span>{step > i + 1 ? <Check /> : i + 1}</span>
                <b>{label}</b>
              </div>
            ))}
          </div>
          <section className="checkout-card">
            {step === 1 && (
              <>
                <div className="checkout-title">
                  <span>01</span>
                  <div>
                    <h2>Selecciona una sede</h2>
                    <p>Tu pedido será preparado en la sede que elijas.</p>
                  </div>
                </div>
                <div className="branch-options">
                  {d.branches.map((b) => (
                    <button
                      disabled={!b.active}
                      key={b.id}
                      className={d.branch === b.name ? "selected" : ""}
                      onClick={() => d.setBranch(b.name)}
                    >
                      <div>
                        <Store />
                        <StateTag>{b.active ? "Abierto" : "Cerrado"}</StateTag>
                      </div>
                      <h3>
                        {b.name === "La Victoria"
                          ? "La Victoria (Sede Principal)"
                          : b.name}
                      </h3>
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
                        {d.branch === b.name ? (
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
                <div className="selection-note">
                  <CheckCircle2 /> Sede seleccionada: <b>{d.branch}</b>
                </div>
                <div className="checkout-actions">
                  <Action secondary onClick={() => go("cart")}>
                    Volver al carrito
                  </Action>
                  <Action
                    disabled={
                      !d.branches.find((b) => b.name === d.branch)?.active
                    }
                    onClick={() => setStep(2)}
                  >
                    Continuar <ArrowRight />
                  </Action>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="checkout-title">
                  <span>02</span>
                  <div>
                    <h2>Tipo de pedido</h2>
                    <p>Elige cómo deseas recibir tu pedido.</p>
                  </div>
                </div>
                <div className="order-type-options">
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
                    {
                      name: "En local",
                      icon: Utensils,
                      copy: "Disfrútalo en nuestro salón",
                    },
                  ].map((o) => (
                    <button
                      key={o.name}
                      className={mode === o.name ? "selected" : ""}
                      onClick={() => setMode(o.name)}
                    >
                      <o.icon />
                      <b>{o.name.toUpperCase()}</b>
                      <span>{o.copy}</span>
                      {mode === o.name && <CheckCircle2 />}
                    </button>
                  ))}
                </div>
                {mode === "Delivery" && (
                  <div className="delivery-details">
                    <h3>Mis direcciones</h3>
                    {d.addresses.map((a) => (
                      <button
                        className={address?.id === a.id ? "selected" : ""}
                        key={a.id}
                        onClick={() => setAddressId(a.id)}
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
                        {address?.id === a.id && <CheckCircle2 />}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setEditingAddress(null)
                        setAddressModal(true)
                      }}
                    >
                      <Plus size={15} />
                      Agregar dirección
                    </button>
                    <div className="delivery-info">
                      <span>
                        Teléfono <b>{d.profile.phone}</b>
                      </span>
                      <span>
                        Costo de delivery <b>{money(5)}</b>
                      </span>
                    </div>
                  </div>
                )}
                {mode === "Para llevar" && (
                  <div className="mode-message">
                    <ShoppingBag />
                    <div>
                      <b>Recojo en {d.branch}</b>
                      <span>Te avisaremos cuando esté listo.</span>
                    </div>
                  </div>
                )}
                {mode === "En local" && (
                  <div className="mode-message">
                    <Utensils />
                    <div>
                      <b>Atención en {d.branch}</b>
                      <label>
                        Mesa
                        <select
                          aria-label="Mesa para atención en local"
                          value={Math.min(table, d.tables[d.branch].length)}
                          onChange={(e) => setTable(Number(e.target.value))}
                        >
                          {d.tables[d.branch].map((t) => (
                            <option key={t.id} value={t.id}>
                              Mesa {t.id}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}
                <div className="checkout-actions">
                  <Action secondary onClick={() => setStep(1)}>
                    Atrás
                  </Action>
                  <Action
                    disabled={mode === "Delivery" && !address}
                    onClick={() => setStep(3)}
                  >
                    Continuar <ArrowRight />
                  </Action>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="checkout-title">
                  <span>03</span>
                  <div>
                    <h2>Resumen del pedido</h2>
                    <p>Confirma que todos los datos sean correctos.</p>
                  </div>
                </div>
                <div className="order-summary-full">
                  <div className="summary-products">
                    {cart.map((l) => (
                      <div key={l.productId}>
                        <img src={l.image} alt="" />
                        <span>
                          <b>
                            {l.qty}× {l.name}
                          </b>
                          <small>{l.note}</small>
                        </span>
                        <strong>{money(l.price * l.qty)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="summary-meta">
                    <span>
                      Sede <b>{d.branch}</b>
                    </span>
                    <span>
                      Modalidad <b>{mode}</b>
                    </span>
                    {mode === "Delivery" && (
                      <span>
                        Dirección <b>{address?.address}</b>
                      </span>
                    )}
                    <span>
                      Envío <b>{money(shipping)}</b>
                    </span>
                    <span>
                      Total <strong>{money(amount)}</strong>
                    </span>
                  </div>
                </div>
                <div className="checkout-actions">
                  <Action secondary onClick={() => go("cart")}>
                    <Pencil size={15} /> Editar pedido
                  </Action>
                  <Action onClick={() => setStep(4)}>
                    Continuar al pago <ArrowRight />
                  </Action>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <div className="checkout-title">
                  <span>04</span>
                  <div>
                    <h2>Método de pago</h2>
                    <p>Selecciona cómo deseas pagar {money(amount)}.</p>
                  </div>
                </div>
                <div className="payment-options">
                  {["Efectivo", "Yape", "Plin", "Tarjeta"].map((m) => (
                    <button
                      key={m}
                      className={method === m ? "selected" : ""}
                      onClick={() => setMethod(m)}
                    >
                      <CreditCard />
                      <b>{m}</b>
                      {method === m && <CheckCircle2 />}
                    </button>
                  ))}
                </div>
                {method === "Efectivo" ? (
                  <div className="payment-detail">
                    <b>Pago al recibir o recoger tu pedido</b>
                    <p className="modal-copy">
                      El cobro se registrará en caja o con el repartidor.
                    </p>
                  </div>
                ) : (
                  <div className="payment-detail qr-detail">
                    <div className="fake-qr">DEMO</div>
                    <div>
                      <b>Pago simulado con {method}</b>
                      <span>
                        Se marcará como aprobado al confirmar. No ingreses datos
                        bancarios reales.
                      </span>
                    </div>
                  </div>
                )}
                <div className="checkout-actions">
                  <Action secondary onClick={() => setStep(3)}>
                    Atrás
                  </Action>
                  <Action disabled={!cart.length} onClick={confirm}>
                    <Lock size={15} /> Confirmar pago demo
                  </Action>
                </div>
              </>
            )}
          </section>
        </main>
      )}
      {view === "confirmation" && selectedOrder && (
        <main className="client-subpage">
          <section className="confirmation-card">
            <div className="success-icon">
              <Check />
            </div>
            <span>PEDIDO CONFIRMADO</span>
            <h1>Pedido realizado correctamente</h1>
            <p>
              Gracias, {d.profile.name.split(" ")[0]}. Ya enviamos tu pedido a
              la cocina de {selectedOrder.branch}.
            </p>
            <div className="order-number">
              Pedido <strong>#{selectedOrder.id}</strong>
            </div>
            <div className="confirmation-data">
              <span>
                Sede <b>{selectedOrder.branch}</b>
              </span>
              <span>
                Tipo de pedido{" "}
                <b>
                  {selectedOrder.channel === "Recojo"
                    ? "Para llevar"
                    : selectedOrder.channel}
                </b>
              </span>
              {selectedOrder.channel === "Delivery Web" && (
                <span>
                  Dirección <b>{selectedOrder.address}</b>
                </span>
              )}
              <span>
                Método de pago <b>{selectedOrder.method}</b>
              </span>
              <span>
                Total <b>{money(total(selectedOrder))}</b>
              </span>
              <span>
                Hora aproximada <b>25–35 min</b>
              </span>
            </div>
            <div className="confirmation-actions">
              <Action onClick={() => go("tracking")}>
                <Navigation /> Ver seguimiento
              </Action>
              <Action secondary onClick={() => go("orders")}>
                Ver mis pedidos
              </Action>
              <button onClick={() => go("menu")}>Volver al inicio</button>
            </div>
          </section>
        </main>
      )}
      {view === "tracking" && (
        <main className="client-subpage">
          <SubpageHead
            kicker={
              selectedOrder ? `PEDIDO #${selectedOrder.id}` : "MIS PEDIDOS"
            }
            title="Seguimiento del pedido"
            copy="Los cambios de cocina y reparto aparecen aquí en vivo."
            back={() => go("orders")}
          />
          {selectedOrder ? (
            renderTracking(selectedOrder)
          ) : (
            <Empty>Aún no tienes un pedido para seguir.</Empty>
          )}
        </main>
      )}
      {view === "orders" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mis pedidos"
            copy="Consulta tus pedidos y vuelve a pedir tus favoritos."
            back={() => go("menu")}
          />
          <div className="orders-tabs">
            {["Recientes", "Anteriores"].map((p) => (
              <button
                className={period === p ? "active" : ""}
                key={p}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <section className="customer-orders">
            {myOrders
              .filter((o) =>
                period === "Recientes"
                  ? Date.now() - o.created < 7 * 86400000
                  : Date.now() - o.created >= 7 * 86400000,
              )
              .map((o) => (
                <article key={o.id}>
                  <div>
                    <StateTag>{o.status}</StateTag>
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
                  <strong>{money(total(o))}</strong>
                  <div>
                    <Action
                      secondary
                      onClick={() => {
                        setOrderId(o.id)
                        go("order-detail")
                      }}
                    >
                      <Eye /> Ver detalle
                    </Action>
                    <Action
                      onClick={() => {
                        setOrderId(o.id)
                        go("tracking")
                      }}
                    >
                      <Navigation /> Seguimiento
                    </Action>
                    <Action secondary onClick={() => repeat(o)}>
                      <ShoppingCart /> Repetir pedido
                    </Action>
                  </div>
                </article>
              ))}
          </section>
          {!myOrders.filter((o) =>
            period === "Recientes"
              ? Date.now() - o.created < 7 * 86400000
              : Date.now() - o.created >= 7 * 86400000,
          ).length && <Empty>No tienes pedidos en este período.</Empty>}
        </main>
      )}
      {view === "order-detail" && selectedOrder && (
        <main className="client-subpage">
          <SubpageHead
            kicker={`PEDIDO #${selectedOrder.id}`}
            title="Detalle del pedido"
            copy={new Date(selectedOrder.created).toLocaleString("es-PE")}
            back={() => go("orders")}
          />
          <section className="checkout-card">
            {summary(selectedOrder)}
            <div className="checkout-actions">
              <Action secondary onClick={() => go("orders")}>
                Volver
              </Action>
              <Action onClick={() => repeat(selectedOrder)}>
                <ShoppingCart /> Repetir pedido
              </Action>
            </div>
          </section>
        </main>
      )}
      {view === "profile" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mi perfil"
            copy="Administra tus datos de esta sesión demo."
            back={() => go("menu")}
          />
          <form
            key={`${editingProfile}-${d.profile.name}-${d.profile.phone}-${d.profile.email}`}
            onSubmit={saveProfile}
            className="profile-card"
          >
            <div className="profile-avatar">
              {d.profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="profile-title">
              <h2>{d.profile.name}</h2>
              <span>Cliente Bros Chicken</span>
            </div>
            <Action
              secondary
              onClick={() => setEditingProfile(!editingProfile)}
            >
              <Pencil />
              {editingProfile ? "Cancelar" : "Editar información"}
            </Action>
            <div className="profile-form">
              <label>
                Nombre completo
                <input
                  name="name"
                  required
                  defaultValue={d.profile.name}
                  disabled={!editingProfile}
                />
              </label>
              <label>
                Teléfono
                <input
                  name="phone"
                  type="tel"
                  required
                  pattern="[0-9]{9}"
                  defaultValue={d.profile.phone}
                  disabled={!editingProfile}
                />
              </label>
              <label>
                Correo
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={d.profile.email}
                  disabled={!editingProfile}
                />
              </label>
            </div>
            {editingProfile && <Action type="submit">Guardar cambios</Action>}
            <button
              type="button"
              className="change-password"
              onClick={() => setPasswordModal(true)}
            >
              <Lock /> Cambiar contraseña (demo) <ChevronRight />
            </button>
          </form>
        </main>
      )}
      {view === "addresses" && (
        <main className="client-subpage">
          <SubpageHead
            kicker="MI CUENTA"
            title="Mis direcciones"
            copy="Administra tus direcciones de entrega."
            back={() => go("menu")}
            action={
              <Action
                onClick={() => {
                  setEditingAddress(null)
                  setAddressModal(true)
                }}
              >
                <Plus /> Agregar dirección
              </Action>
            }
          />
          <section className="address-grid">
            {d.addresses.map((a) => (
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
                      setAddressId(a.id)
                      d.setAddresses((as) =>
                        as.map((x) => ({ ...x, primary: x.id === a.id })),
                      )
                      notify(`${a.alias} es ahora tu dirección principal.`)
                    }}
                  >
                    <CheckCircle2 /> Usar como principal
                  </button>
                  <button
                    aria-label={`Editar dirección ${a.alias}`}
                    onClick={() => {
                      setEditingAddress(a)
                      setAddressModal(true)
                    }}
                  >
                    <Pencil /> Editar
                  </button>
                  <button
                    aria-label={`Eliminar dirección ${a.alias}`}
                    onClick={() => {
                      d.setAddresses((as) => {
                        const rest = as.filter((x) => x.id !== a.id)
                        return a.primary
                          ? rest.map((x, i) => ({ ...x, primary: i === 0 }))
                          : rest
                      })
                      setAddressId(0)
                      notify("Dirección eliminada.")
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
          </section>
          {!d.addresses.length && (
            <Empty>
              Agrega una dirección para recibir pedidos a domicilio.
            </Empty>
          )}
        </main>
      )}
      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProductId(null)}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Cerrar producto"
              onClick={() => setSelectedProductId(null)}
            >
              <X />
            </button>
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <div>
              <span className="kicker">
                {selectedProduct.category.toUpperCase()}
              </span>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <StateTag>
                {selectedProduct.stockActual && selectedProduct.available
                  ? "Stock disponible"
                  : "Agotado"}
              </StateTag>
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
                  ].map((c) => (
                    <button
                      className={creams.includes(c) ? "selected" : ""}
                      key={c}
                      onClick={() =>
                        setCreams((cs) =>
                          cs.includes(c)
                            ? cs.filter((x) => x !== c)
                            : [...cs, c],
                        )
                      }
                    >
                      {creams.includes(c) && <Check />} {c}
                    </button>
                  ))}
                </div>
              </div>
              <label className="option-form-label">
                Observación para cocina
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Sin ají, papas bien doradas..."
                />
              </label>
              <strong>{money(d.priceFor(selectedProduct))}</strong>
              <Action
                disabled={
                  !selectedProduct.active ||
                  !selectedProduct.available ||
                  !selectedProduct.stockActual
                }
                onClick={add}
              >
                Agregar al carrito <ShoppingCart />
              </Action>
            </div>
          </section>
        </div>
      )}
      {addressModal && (
        <DemoModal
          title={editingAddress ? "Editar dirección" : "Nueva dirección"}
          close={() => setAddressModal(false)}
        >
          <form onSubmit={saveAddress}>
            <label>
              Alias
              <input
                name="alias"
                required
                defaultValue={editingAddress?.alias}
                placeholder="Casa, Trabajo, Familia..."
              />
            </label>
            <label>
              Dirección
              <input
                name="address"
                required
                defaultValue={editingAddress?.address}
                placeholder="Calle, número y distrito"
              />
            </label>
            <label>
              Referencia
              <textarea
                name="reference"
                required
                defaultValue={editingAddress?.reference}
                placeholder="Indicaciones para encontrar el lugar"
              />
            </label>
            <div className="option-form-actions">
              <Action secondary onClick={() => setAddressModal(false)}>
                Cancelar
              </Action>
              <Action type="submit">Guardar dirección</Action>
            </div>
          </form>
        </DemoModal>
      )}
      {passwordModal && (
        <DemoModal
          title="Validación de contraseña demo"
          close={() => setPasswordModal(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              if (f.get("password") !== f.get("confirm")) {
                notify("Las contraseñas no coinciden.")
                return
              }
              setPasswordModal(false)
              notify(
                "Validación demo completada. No se almacenan contraseñas reales.",
              )
            }}
          >
            <p className="modal-copy">
              No ingreses contraseñas reales. Esta es una simulación de
              interfaz.
            </p>
            <label>
              Nueva contraseña demo
              <input name="password" type="password" minLength={8} required />
            </label>
            <label>
              Confirmar contraseña demo
              <input name="confirm" type="password" minLength={8} required />
            </label>
            <div className="option-form-actions">
              <Action secondary onClick={() => setPasswordModal(false)}>
                Cancelar
              </Action>
              <Action type="submit">Validar cambio demo</Action>
            </div>
          </form>
        </DemoModal>
      )}
      {feedback}
      {roleSwitcher}
    </div>
  )
}
function SubpageHead({
  kicker,
  title,
  copy,
  back,
  action,
}: {
  kicker: string
  title: string
  copy: string
  back: () => void
  action?: ReactNode
}) {
  return (
    <div className="subpage-head">
      <div>
        <button onClick={back}>← Volver</button>
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  )
}
