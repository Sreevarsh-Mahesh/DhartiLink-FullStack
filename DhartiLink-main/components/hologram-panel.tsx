"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type Parcel = {
  id: string
  owner: string
  areaSqM: number
  jurisdiction: string
  encumbrances: string[]
  chainAssetId: string
  docDigest: string
}

export default function HologramPanel({
  parcel,
  visible,
}: {
  parcel: Parcel | null
  visible: boolean
}) {
  return (
    <div
      className={[
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      ].join(" ")}
      aria-live="polite"
    >
      <Card className="glass holo-border scanlines">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-primary">
            <span className="holo-glow">Parcel Hologram</span>
            <span className="rounded-full px-2 py-1 text-[10px] tracking-wider text-accent-foreground bg-accent/20 ring-1 ring-accent/40">
              VERIFIED
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {parcel ? (
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-muted-foreground">Parcel ID</dt>
                <dd className="font-mono">{parcel.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd>{parcel.owner}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Area</dt>
                <dd>{parcel.areaSqM.toLocaleString()} m²</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jurisdiction</dt>
                <dd>{parcel.jurisdiction}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Encumbrances</dt>
                <dd className="font-mono text-xs">
                  {parcel.encumbrances.length ? parcel.encumbrances.join(", ") : "None"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Chain Asset</dt>
                <dd className="font-mono text-xs break-all">{parcel.chainAssetId}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Document Digest</dt>
                <dd className="font-mono text-[10px] break-all">{parcel.docDigest}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground">Hover a parcel or scroll over the map to inspect a hologram.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
