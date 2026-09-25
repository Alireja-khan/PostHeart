'use client'

import dynamic from 'next/dynamic'
import BirdLoader from "@/components/BirdLoader"

function DeskSkeleton() {
  return (
    <div suppressHydrationWarning className="absolute inset-0 z-50 flex items-center justify-center bg-bg-primary">
      <BirdLoader className="w-16 h-16 text-[#c2410c]" />
    </div>
  )
}

const Desk = dynamic(() => import('@/components/Desk'), {
  ssr: false,
  loading: () => <DeskSkeleton />
})

export default function ClientDesk(props: any) {
  return <Desk {...props} />
}
