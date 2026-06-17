import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import { MobileGate } from "./components/MobileGate";
import NetworkOverview from "./pages/NetworkOverview";
import RegionView from "./pages/RegionView";
import ServicePointScorecard from "./pages/ServicePointScorecard";
import MixTracker from "./pages/MixTracker";
import FieldEfficiency from "./pages/FieldEfficiency";
import Inventory from "./pages/Inventory";
import ReviewsCases from "./pages/ReviewsCases";
import Benchmarking from "./pages/Benchmarking";

// Reset scroll to the top on every route change so a drill-down never lands
// the user partway down the page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MobileGate>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<NetworkOverview />} />
              <Route path="/region/:regionId" element={<RegionView />} />
              <Route path="/sp/:spId" element={<ServicePointScorecard />} />
              <Route path="/mix" element={<MixTracker />} />
              <Route path="/field" element={<FieldEfficiency />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reviews" element={<ReviewsCases />} />
              <Route path="/benchmarking" element={<Benchmarking />} />
            </Route>
          </Routes>
        </MobileGate>
      </BrowserRouter>
    </AppProvider>
  );
}
