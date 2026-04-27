import { lazy, Suspense } from 'react'
import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { PainPoints } from '@/components/sections/PainPoints'
import { Features } from '@/components/sections/Features'
import { ROISimulator } from '@/components/sections/ROISimulator'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { SectionSkeleton } from '@/components/common/SectionSkeleton'
import {
  organizationJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/seo'

// ProductShowcase and DriverApp are very large React trees (admin sim
// with 12 drivers × 7 vehicles × shifts × screens, phone sim with
// multiple screens, lots of framer-motion). On real mobile CPUs their
// commit phase blocks the main thread for several seconds, during
// which the browser can't paint anything below the Hero. Lazy-loading
// + a visible animate-pulse skeleton tells the user 'something is
// coming here' instead of leaving black space.
const ProductShowcase = lazy(() =>
  import('@/components/sections/ProductShowcase').then((m) => ({
    default: m.ProductShowcase,
  })),
)
const DriverApp = lazy(() =>
  import('@/components/sections/DriverApp').then((m) => ({
    default: m.DriverApp,
  })),
)

export default function Landing() {
  return (
    <>
      <SEO
        path="/"
        jsonLd={[
          organizationJsonLd(),
          webSiteJsonLd(),
          webApplicationJsonLd(),
        ]}
      />
      <Hero />
      <PainPoints />
      <section id="admin" className="scroll-mt-0">
        <Suspense
          fallback={
            <SectionSkeleton
              variant="admin"
              eyebrow="01 · Côté patron"
              title="Un tableau de bord. Tout ce qui compte."
            />
          }
        >
          <ProductShowcase />
        </Suspense>
        <Features />
      </section>
      <ROISimulator />
      <Suspense
        fallback={
          <SectionSkeleton
            variant="driver"
            eyebrow="02 · Côté chauffeur"
            title="L'app que vos chauffeurs utilisent."
          />
        }
      >
        <DriverApp />
      </Suspense>
      <Team />
      <FinalCTA />
    </>
  )
}
