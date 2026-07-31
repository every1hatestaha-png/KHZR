import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121110",
          fontFamily: "serif",
        }}
      >
        <span
          style={{
            fontSize: 280,
            letterSpacing: "0.02em",
            color: "#C2A878",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          K
        </span>
      </div>
    ),
    size
  )
}
