import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { PainPoints } from '@/components/sections/PainPoints'
import { Features } from '@/components/sections/Features'
import { ROISimulator } from '@/components/sections/ROISimulator'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { SimLauncher } from '@/components/common/SimLauncher'
import {
  organizationJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/seo'

// The two simulators (admin + driver) are huge React trees that block
// real-mobile main threads on commit. We render only a Play-button card
// for each by default; the actual sim chunk only loads if the user
// taps Play. Result: page paints fast on every mobile, no skeleton
// stranded looking like loading content. Users who scroll past without
// engaging never pay the cost.

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
        <SimLauncher variant="admin" />
        <Features />
      </section>
      <ROISimulator />
      <section id="app" className="scroll-mt-0">
        <SimLauncher variant="driver" />
      </section>
      <Team />
      <FinalCTA />
    </>
  )
}
