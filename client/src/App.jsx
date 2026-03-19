import { Routes, Route } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EventDetailPage from "./pages/EventDetailPage";
import FindPhotosPage from "./pages/FindPhotosPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/find" element={<FindPhotosPage />} />
        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute>
            <DashboardPage />
            // {/* </ProtectedRoute> */}
          }
        />
        <Route
          path="/event/:eventId"
          element={
            // <ProtectedRoute>
            <EventDetailPage />
            // </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
