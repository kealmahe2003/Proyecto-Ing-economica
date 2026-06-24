import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/Home'
import SimpleInterestPage from './pages/Calculators/SimpleInterest'
import CompoundInterestPage from './pages/Calculators/CompoundInterest'
import RateConversionPage from './pages/Calculators/RateConversion'
import AmortizationPage from './pages/Calculators/Amortization'
import AnnuitiesPage from './pages/Calculators/Annuities'
import InflationPage from './pages/Calculators/Inflation'
import AcademicLoansPage from './pages/Calculators/AcademicLoans'
import WikiPage from './pages/Wiki'
import NotFoundPage from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
