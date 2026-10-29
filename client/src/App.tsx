import { Navigate, Route, Routes } from "react-router-dom";
import { GatePage } from "./pages/GatePage";
import { NeedBloodPage } from "./pages/NeedBloodPage";
import { PublicCompatibilityPage } from "./pages/PublicCompatibilityPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { DonorsPage } from "./pages/admin/DonorsPage";
import { DonationsPage } from "./pages/admin/DonationsPage";
import { RequestsPage } from "./pages/admin/RequestsPage";
import { CompatibilityPage } from "./pages/admin/CompatibilityPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<GatePage />} />
      <Route path="/need-blood" element={<NeedBloodPage />} />
      <Route path="/compatibility" element={<PublicCompatibilityPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="donors" element={<DonorsPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="compatibility" element={<CompatibilityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
