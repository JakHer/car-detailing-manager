import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import ClientsPage from "../features/clients/ClientsPage";
import OrdersPage from "../features/orders/OrdersPage";
import ServicesPage from "../features/services/ServicesPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/services" element={<ServicesPage />} />
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
      </BrowserRouter>
    </>
  );
}

export default App;
