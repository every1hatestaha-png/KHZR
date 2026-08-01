import { ImageResponse } from "next/og"
import { SITE } from "@/lib/constants"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${SITE.name} — ${SITE.tagline}`

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#121110",
        }}
      >
        <span
          style={{
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 160,
            letterSpacing: "0.08em",
            color: "#FAF7F2",
          }}
        >
          KHZR
        </span>
        <span
          style={{
            marginTop: 24,
            fontSize: 32,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#C2A878",
          }}
        >
          {SITE.tagline}
        </span>
      </div>
    ),
    size
  )
}
