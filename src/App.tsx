import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/Home'

// Cada módulo se descarga solo al visitarlo (Recharts y xlsx no entran en la carga inicial)
const SimpleInterestPage = lazy(() => import('./pages/Calculators/SimpleInterest'))
const CompoundInterestPage = lazy(() => import('./pages/Calculators/CompoundInterest'))
const RateConversionPage = lazy(() => import('./pages/Calculators/RateConversion'))
const AmortizationPage = lazy(() => import('./pages/Calculators/Amortization'))
const AnnuitiesPage = lazy(() => import('./pages/Calculators/Annuities'))
const InflationPage = lazy(() => import('./pages/Calculators/Inflation'))
const AcademicLoansPage = lazy(() => import('./pages/Calculators/AcademicLoans'))
const WikiPage = lazy(() => import('./pages/Wiki'))
const PrivacyPage = lazy(() => import('./pages/Privacy'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/simple" element={<SimpleInterestPage />} />
            <Route path="/compuesto" element={<CompoundInterestPage />} />
            <Route path="/tasas" element={<RateConversionPage />} />
            <Route path="/amortizacion" element={<AmortizationPage />} />
            <Route path="/anualidades" element={<AnnuitiesPage />} />
            <Route path="/credito-educativo" element={<AcademicLoansPage />} />
            <Route path="/inflacion" element={<InflationPage />} />
            <Route path="/wiki" element={<WikiPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}
