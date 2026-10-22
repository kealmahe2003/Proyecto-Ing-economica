import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('fincalc-theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
  localStorage.setItem('fincalc-theme', theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return getInitialTheme()
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Círculo que se expande desde el clic (View Transitions API).
  // Sin soporte o con "reducir movimiento" el cambio es instantáneo.
  const toggle = (e?: { clientX: number; clientY: number }) => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) return setTheme(next)

    const x = e?.clientX ?? window.innerWidth / 2
    const y = e?.clientY ?? 0
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const vt = document.startViewTransition(() => {
      applyTheme(next) // el DOM debe cambiar dentro del callback para capturar el estado nuevo
      setTheme(next)
    })
    vt.ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      )
    )
  }

  return { theme, toggle }
}
