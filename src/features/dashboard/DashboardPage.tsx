import { observer } from "mobx-react-lite";
import { clientsStore } from "../../stores/ClientsStore";
import { ordersStore } from "../../stores/OrdersStore";
import Card from "../../components/Card/Card";
import { motion, AnimatePresence } from "framer-motion";
import Title from "../../components/Title/Title";

const DashboardPage = observer(() => {
  const totalClients = clientsStore.clients.length;
  const ongoingOrders = ordersStore.orders.filter(
    (o) => o.status === "W toku"
  ).length;
  const revenueToday = ordersStore.orders
    .filter((o) => o.status === "Zakończone")
    .reduce((sum, o) => sum + o.service.price, 0);

  const cards = [
    {
      id: "clients",
      title: "Liczba klientów",
      content: <p className="text-2xl font-bold">{totalClients}</p>,
    },
    {
      id: "ongoing",
      title: "Zlecenia w toku",
      status: "W toku" as const,
      content: (
        <p className="text-2xl font-bold text-yellow-600">{ongoingOrders}</p>
      ),
    },
    {
      id: "revenue",
      title: "Przychód dzisiaj",
      status: "Zakończone" as const,
      content: (
        <p className="text-2xl font-bold text-green-600">{revenueToday} zł</p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title>Dashboard</Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex"
            >
              <Card title={card.title} status={card.status} className="flex-1">
                {card.content}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default DashboardPage;
