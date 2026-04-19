import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminPage } from "./pages/AdminPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AppLayout } from "./pages/AppLayout";
import { DevicesPage } from "./pages/DevicesPage";
import { HealthLogsPage } from "./pages/HealthLogsPage";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PatientPage } from "./pages/PatientPage";
import { UploadPage } from "./pages/UploadPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="logs" element={<HealthLogsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="patients" element={<PatientPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
