import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { SplashScreen } from '@/components/common/SplashScreen'
import { Skeleton } from '@/components/ui/skeleton'

const Landing = lazy(() => import('@/pages/Landing'))
const Contact = lazy(() => import('@/pages/Contact'))
const LegalTerms = lazy(() => import('@/pages/LegalTerms'))
const LegalPrivacy = lazy(() => import('@/pages/LegalPrivacy'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageSkeleton() {
  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-24 sm:px-6 lg:px-8">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <SplashScreen />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Landing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/legal/privacy" element={<LegalPrivacy />} />
            <Route path="/pricing" element={<Navigate to="/" replace />} />
            <Route path="/features" element={<Navigate to="/#features" replace />} />
            <Route path="/about" element={<Navigate to="/#team" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/signup/success" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
