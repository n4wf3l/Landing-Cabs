import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { PainPoints } from '@/components/sections/PainPoints'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { ROISimulator } from '@/components/sections/ROISimulator'
import { Features } from '@/components/sections/Features'
import { DriverApp } from '@/components/sections/DriverApp'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import {
  organizationJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/seo'

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
