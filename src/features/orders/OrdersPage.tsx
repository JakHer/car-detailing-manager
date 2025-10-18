import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ordersStore } from "../../stores/OrdersStore";
import AddOrderModal from "./AddOrderModal";
import Card from "../../components/Card/Card";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button/Button";
import Title from "../../components/Title/Title";

const OrdersPage = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Title>Zlecenia</Title>

      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Dodaj nowe zlecenie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {ordersStore.orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex"
            >
              <Card
                title={order.client.name}
                status={order.status as "W toku" | "Zakończone"}
                className="flex-1"
                onAction={() => ordersStore.toggleStatus(order.id)}
                actionLabel="Zmień status"
              >
                <p>Usługa: {order.service.name}</p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});

export default OrdersPage;
