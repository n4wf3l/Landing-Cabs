import { lazy, Suspense } from 'react'
import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { PainPoints } from '@/components/sections/PainPoints'
import { Features } from '@/components/sections/Features'
import { ROISimulator } from '@/components/sections/ROISimulator'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import {
  organizationJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/seo'

// Heavy sections lazy-loaded so the home page above-fold renders fast.
// ProductShowcase contains the full admin simulator (mock fleet of 12
// drivers × 7 vehicles × shifts × revenue × map). DriverApp ships the
// phone simulator with ~12 screens. Each is ~150-250 KB on its own.
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

// Thin block-level placeholder so the page height stays roughly stable
// while a sim chunk streams in. Avoids a giant layout shift when a 200 KB
// chunk lands and a 90vh section pops into existence.
function SimSkeleton() {
  return <div aria-hidden className="min-h-[60vh] sm:min-h-[80vh]" />
}

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
        <Suspense fallback={<SimSkeleton />}>
          <ProductShowcase />
        </Suspense>
        <Features />
      </section>
      <ROISimulator />
      <Suspense fallback={<SimSkeleton />}>
        <DriverApp />
      </Suspense>
      <Team />
      <FinalCTA />
    </>
  )
}
