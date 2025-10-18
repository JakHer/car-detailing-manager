import { observer } from "mobx-react-lite";
import { useState } from "react";
import { servicesStore } from "../../stores/ServicesStore";
import AddServiceModal from "./AddServiceModal";
import Card from "../../components/Card/Card";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button/Button";
import Title from "../../components/Title/Title";

const ServicesPage = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Title>Usługi</Title>

      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Dodaj nową usługę
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {servicesStore.services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex"
            >
              <Card title={service.name} className="flex-1">
                <p>Cena: {service.price} zł</p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});

export default ServicesPage;
