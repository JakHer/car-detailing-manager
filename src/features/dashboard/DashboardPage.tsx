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

  const formatDate = (date: Date) => date.toLocaleDateString("pl-PL");

  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const generateWeekDates = (start: Date, end: Date) => {
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dailyOrdersData = () => {
    const { monday, sunday } = getWeekRange();
    const statusKeys = Object.keys(STATUS_COLORS) as OrderStatus[];

    const counts: Record<string, Record<OrderStatus, number>> = {};
    generateWeekDates(monday, sunday).forEach((dateStr) => {
      counts[dateStr] = {} as Record<OrderStatus, number>;
      statusKeys.forEach((status) => (counts[dateStr][status] = 0));
    });

    ordersStore.orders.forEach((order) => {
      const dateStr = formatDate(new Date(order.createdAt));
      if (counts[dateStr]) {
        counts[dateStr][order.status]++;
      }
    });

    return Object.entries(counts)
      .map(([date, statusCounts]) => ({ date, ...statusCounts }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const dailyRevenue = () => {
    const revenuePerDay: Record<string, number> = {};
    ordersStore.orders
      .filter((o) => o.status === "Zakończone")
      .forEach((order) => {
        const date = formatDate(new Date(order.createdAt));
        const totalPrice = order.services.reduce((sum, s) => sum + s.price, 0);
        revenuePerDay[date] = (revenuePerDay[date] || 0) + totalPrice;
      });
    return Object.entries(revenuePerDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  };

  const formatXAxisDate = (dateStr: string) => {
    const [day, month] = dateStr.split(".").filter(Boolean);
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}`;
  };

  const today = formatDate(new Date());
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
          <Card title="Zlecenia w tym tygodniu (podział na statusy)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyOrdersData()}>
                <XAxis dataKey="date" tickFormatter={formatXAxisDate} />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce(
                        (sum, p) => sum + (p.value || 0),
                        0
                      );

                      if (total === 0) return null;

                      return (
                        <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 border p-2 rounded shadow">
                          <p className="font-semibold">Data: {label}</p>
                          {Object.keys(STATUS_COLORS).map((status) => {
                            const barData = payload.find(
                              (p) => p.dataKey === status
                            );
                            if (barData && barData.value > 0) {
                              return (
                                <p key={status}>
                                  <span
                                    className="inline-block w-3 h-3 mr-1 rounded-full"
                                    style={{
                                      backgroundColor:
                                        STATUS_COLORS[status as OrderStatus]
                                          .hex,
                                    }}
                                  />
                                  {status}: {barData.value}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {Object.keys(STATUS_COLORS).map((status) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="a"
                    fill={STATUS_COLORS[status as OrderStatus].hex}
                  />
                ))}
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
