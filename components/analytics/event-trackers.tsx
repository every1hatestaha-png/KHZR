"use client"

import * as React from "react"
import { analytics } from "@/lib/analytics"

export function CollectionTracker({ slug, name, sort, filter }: { slug: string; name: string; sort?: string | null; filter?: string | null }) {
  React.useEffect(() => {
    analytics.collectionViewed({ slug, name })
  }, [slug, name])
  React.useEffect(() => {
    if (sort) analytics.collectionFilter({ type: "sort", value: sort, collection: slug })
  }, [sort, slug])
  React.useEffect(() => {
    if (filter) analytics.collectionFilter({ type: "filter", value: filter, collection: slug })
  }, [filter, slug])
  return null
}

export function SearchTracker({ term }: { term?: string | null }) {
  React.useEffect(() => {
    if (term) analytics.search({ term })
  }, [term])
  return null
}

export function AuthIntentTracker({ kind }: { kind: "login" | "sign_up" }) {
  React.useEffect(() => {
    if (kind === "login") analytics.login()
    else analytics.signUp()
  }, [kind])
  return null
}
