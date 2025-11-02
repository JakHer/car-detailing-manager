import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import ClientsPage from "../features/clients/ClientsPage";
import OrdersPage from "../features/orders/OrdersPage";
import ServicesPage from "../features/services/ServicesPage";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";
import LoginPage from "../features/login/LoginPage";
import AdminPage from "../features/admin/AdminPage";
import ProgressBar from "../components/ProgressBar/ProgressBar";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-gray-700 !text-white !px-4 !py-2 !rounded-lg !shadow-lg !font-medium !text-center",
        }}
      />

      <BrowserRouter>
        <ProgressBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="clients" element={<ClientsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route
                      path="*"
                      element={
                        <h2 className="text-gray-800 dark:text-gray-100">
                          404 – Strona nie znaleziona
                        </h2>
                      }
                    />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
