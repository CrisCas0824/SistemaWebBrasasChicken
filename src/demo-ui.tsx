import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckCircle2, Store, X } from "lucide-react"
import { useDemoData } from "./demo-state"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  secondary?: boolean
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}
export default function Action({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${
        secondary ? "btn-outline" : "btn-primary"
      } ${className}`}
    >
      {children}
    </button>
  )
}
export function StateTag({ children }: { children: ReactNode }) {
  const value = String(children)
  return (
    <span
      className={`status ${
        [
          "Disponible",
          "Stock disponible",
          "Activo",
          "Listo",
          "Entregado",
          "Libre",
          "Pagado",
        ].includes(value)
          ? "success"
          : ["Agotado", "Anulado", "Ocupada"].includes(value)
            ? "danger"
            : value === "Stock bajo"
              ? "warning"
              : "neutral"
      }`}
    >
      <i />
      {children}
    </span>
  )
}
interface ModalProps {
  title: string
  children: ReactNode
  close: () => void
  className?: string
}
export function DemoModal({
  title,
  children,
  close,
  className = "",
}: ModalProps) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    ref.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, select, textarea, a[href]",
        )
        if (!nodes?.length) return
        const first = nodes[0],
          last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("keydown", key)
      previous?.focus()
    }
  }, [])
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        ref={ref}
        tabIndex={-1}
        className={`form-modal admin-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Cerrar"
          onClick={close}
        >
          <X />
        </button>
        <span className="kicker">BROS CHICKEN · DEMO</span>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}
export function useNotice() {
  const [notice, notify] = useState("")
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => notify(""), 4000)
    return () => clearTimeout(t)
  }, [notice])
  return {
    notify,
    feedback: notice ? (
      <div className="app-toast" role="status">
        <CheckCircle2 />
        {notice}
        <button aria-label="Cerrar aviso" onClick={() => notify("")}>
          <X size={14} />
        </button>
      </div>
    ) : null,
  }
}
export function BranchSelect() {
  const d = useDemoData()
  return (
    <label className="ops-branch">
      <Store />
      <select
        aria-label="Sede operativa"
        value={d.branch}
        onChange={(e) => d.setBranch(e.target.value)}
      >
        {d.branches.map((b) => (
          <option key={b.id} value={b.name}>
            {b.name === "La Victoria" ? "La Victoria (Sede Principal)" : b.name}
          </option>
        ))}
      </select>
    </label>
  )
}
export function Empty({
  children = "No hay registros para estos filtros.",
}: {
  children?: ReactNode
}) {
  return (
    <div className="option-empty">
      <CheckCircle2 />
      <p>{children}</p>
    </div>
  )
}
