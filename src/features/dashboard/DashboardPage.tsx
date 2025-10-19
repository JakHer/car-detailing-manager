import { observer } from "mobx-react-lite";
import Card, { STATUS_COLORS } from "../../components/Card/Card";
import Title from "../../components/Title/Title";
import { clientsStore } from "../../stores/ClientsStore";
import { servicesStore } from "../../stores/ServicesStore";
import { ordersStore, type OrderStatus } from "../../stores/OrdersStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = observer(() => {
  const statusCounts = ordersStore.orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const pieData = Object.keys(STATUS_COLORS)
    .map((status) => ({
      name: status as OrderStatus,
      value: statusCounts[status as OrderStatus] || 0,
    }))
    .filter((entry) => entry.value > 0);

  const dailyOrdersData = () => {
    const counts: Record<string, number> = {};
    ordersStore.orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  };

  const dailyRevenue = () => {
    const revenuePerDay: Record<string, number> = {};
    ordersStore.orders
      .filter((o) => o.status === "Zakończone")
      .forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const totalPrice = order.services.reduce((sum, s) => sum + s.price, 0);
        revenuePerDay[date] = (revenuePerDay[date] || 0) + totalPrice;
      });
    return Object.entries(revenuePerDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  };

  const today = new Date().toLocaleDateString();
  const todayRevenue =
    dailyRevenue().find((r) => r.date === today)?.revenue || 0;

  return (
    <div className="space-y-6">
      <Title>Dashboard</Title>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Klienci">{clientsStore.clients.length}</Card>
        <Card title="Usługi">{servicesStore.services.length}</Card>
        <Card title="Zlecenia">{ordersStore.orders.length}</Card>
        <Card title="Zakończone zlecenia">
          <p className="text-2xl font-bold">
            {ordersStore.orders.filter((o) => o.status === "Zakończone").length}
          </p>
          <p className="text-sm text-gray-500">
            Przychód dzisiaj: {todayRevenue} zł
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ordersStore.orders.length > 0 && (
          <Card title="Zlecenia w czasie">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyOrdersData()}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) => {
                    const parts = date.split(".");
                    return `${parts[0]}/${parts[1]}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 border p-2 rounded shadow">
                          <p>{`Data: ${label}`}</p>
                          <p>{`Zleceń: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {ordersStore.orders.length > 0 && (
          <Card title="Status zleceń">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name as OrderStatus].hex}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
});

export default Dashboard;
