import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { PainPoints } from '@/components/sections/PainPoints'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { Features } from '@/components/sections/Features'
import { ROISimulator } from '@/components/sections/ROISimulator'
import { DriverApp } from '@/components/sections/DriverApp'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import {
  organizationJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/seo'

// All sections eager-imported. The lazy split for ProductShowcase +
// DriverApp made initial bundle smaller, but the Suspense fallback
// (an empty min-h-[60vh] div) showed as a big black block while the
// chunk streamed in — a worse UX than a slightly bigger initial bundle.

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
      {/*
        #admin anchor groups the operator-side showcase + features.
        scroll-mt = 68 px (navbar 64 px + 4 px) matches the offset used
        by the #team and #app anchors so all three navbar links park
        their eyebrow at the same height under the navbar.
      */}
      <section id="admin" className="scroll-mt-[68px]">
        <ProductShowcase />
        <Features />
      </section>
      <ROISimulator />
      <DriverApp />
      <Team />
      <FinalCTA />
    </>
  )
}
