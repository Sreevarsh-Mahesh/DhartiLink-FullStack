'use client'

import dynamic from 'next/dynamic'

const EntryLoader = dynamic(() => import('./entry-loader'), { ssr: false })

export default function ClientEntryLoader() {
  return <EntryLoader />
}
