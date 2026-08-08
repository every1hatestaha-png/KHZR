"use client"

import * as React from "react"

type UseInViewOptions = {
  once?: boolean
  margin?: string
}

export function useInView<T extends HTMLElement>({
  once = true,
  margin = "0px",
}: UseInViewOptions = {}) {
  const ref = React.useRef<T | null>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin: margin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once, margin])

  return { ref, inView }
}
