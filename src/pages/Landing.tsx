import { SEO } from '@/components/common/SEO'
import { Hero } from '@/components/sections/Hero'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { Features } from '@/components/sections/Features'
import { Team } from '@/components/sections/Team'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { organizationJsonLd, softwareApplicationJsonLd } from '@/lib/seo'

export default function Landing() {
  return (
    <>
      <SEO
        path="/"
        jsonLd={[organizationJsonLd(), softwareApplicationJsonLd()]}
      />
      <Hero />
      <section id="product">
        <ProductShowcase />
        <Features />
      </section>
      <Team />
      <FinalCTA />
    </>
  )
}
