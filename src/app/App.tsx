import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { I18nProvider, useI18n, LangCode } from "./lib/i18n";
import { getFarmerProfile } from "./lib/api";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AIFarmAdvisor from "./pages/AIFarmAdvisor";
import CropHealth from "./pages/CropHealth";
import Weather from "./pages/Weather";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";

function AppContent() {
  const { setLang } = useI18n();

  useEffect(() => {
    const localLang = localStorage.getItem("language");
    if (localLang) {
      setLang(localLang as LangCode);
    } else {
      getFarmerProfile()
        .then((profile) => {
          if (profile) {
            const targetLang = (profile.language || profile.preferredLanguage) as LangCode;
            if (targetLang) {
              setLang(targetLang);
              localStorage.setItem("language", targetLang);
            }
          }
        })
        .catch(() => {
          // Safe fallback if not logged in yet
        });
    }
  }, [setLang]);

  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/advisor" element={<AIFarmAdvisor />} />
          <Route path="/crop-health" element={<CropHealth />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/schemes" element={<GovernmentSchemes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </I18nProvider>
  );
}
