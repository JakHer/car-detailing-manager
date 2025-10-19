import { observer } from "mobx-react-lite";
import { useState } from "react";
import { servicesStore, type Service } from "../../stores/ServicesStore";
import Card from "../../components/Card/Card";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button/Button";
import PageSection from "../../layouts/PageSection/PageSection";
import ServiceModal from "./ServiceModal";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";

const ServicesPage = observer(() => {
  const [modalService, setModalService] = useState<Service | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "">(
    ""
  );

  const openModal = (
    service: Service | null,
    mode: "add" | "edit" | "delete"
  ) => {
    setModalService(service);
    setModalMode(mode);
  };

  const closeModal = () => {
    setModalService(null);
    setModalMode("");
  };

  const sortedServices = servicesStore.services
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PageSection
      title="Usługi"
      action={
        <Button
          onClick={() => openModal(null, "add")}
          variant="primary"
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <FiPlus className="w-4 h-4" />
        </Button>
      }
    >
      {sortedServices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-gray-500 dark:text-gray-400"
        >
          Brak usług — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </motion.div>
      )}

      <AnimatePresence>
        {sortedServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex"
          >
            <Card
              title={service.name}
              className="hover:shadow-lg transition-transform duration-200 truncate"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cena: <span className="font-semibold">{service.price} zł</span>
              </p>

              <ButtonGroup align="right" className="mt-2">
                <Button
                  size="icon"
                  variant="secondary"
                  title="Edytuj usługę"
                  onClick={() => openModal(service, "edit")}
                >
                  <FiEdit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  title="Usuń usługę"
                  onClick={() => openModal(service, "delete")}
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </ButtonGroup>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {modalMode && (
        <ServiceModal
          isOpen={!!modalMode}
          service={modalService}
          mode={modalMode as "add" | "edit" | "delete"}
          onClose={closeModal}
        />
      )}
    </PageSection>
  );
});

export default ServicesPage;
