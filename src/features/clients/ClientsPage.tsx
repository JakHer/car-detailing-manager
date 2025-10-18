import { observer } from "mobx-react-lite";
import { useState } from "react";
import { clientsStore } from "../../stores/ClientsStore";
import AddClientModal from "./AddClientModal";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button"; // <-- import your Button
import { motion, AnimatePresence } from "framer-motion";
import Title from "../../components/Title/Title";

const ClientsPage = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Title>Klienci</Title>

      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Dodaj nowego klienta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {clientsStore.clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex"
            >
              <Card title={client.name} className="flex-1">
                <p>Telefon: {client.phone}</p>
                <p>Email: {client.email}</p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});

export default ClientsPage;
