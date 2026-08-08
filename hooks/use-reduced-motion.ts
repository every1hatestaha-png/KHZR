"use client"

import * as React from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const mql = window.matchMedia(QUERY)
    const update = () => setReduced(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return reduced
}
