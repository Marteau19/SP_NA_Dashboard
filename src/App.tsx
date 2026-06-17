import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import NetworkOverview from "./pages/NetworkOverview";
import RegionView from "./pages/RegionView";
import ServicePointScorecard from "./pages/ServicePointScorecard";
import MixTracker from "./pages/MixTracker";
import FieldEfficiency from "./pages/FieldEfficiency";
import Inventory from "./pages/Inventory";
import ReviewsCases from "./pages/ReviewsCases";
import Benchmarking from "./pages/Benchmarking";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AppProvider>
  );
}
