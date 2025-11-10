import { clientsStore, type Car } from "../../stores/ClientsStore";
import { servicesStore } from "../../stores/ServicesStore";
import {
  ordersStore,
  type Order,
  type OrderStatus,
} from "../../stores/OrdersStore";
import { toast } from "react-hot-toast";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormField } from "../../components/FormField/FormField";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  mode: "add" | "edit" | "delete";
}

const STATUS_OPTIONS: OrderStatus[] = [
  "Nowe",
  "Przyjęte",
  "W toku",
  "Czeka na odbiór",
  "Zakończone",
  "Anulowane",
];

const OrderSchema = Yup.object().shape({
  clientId: Yup.string().required("Wybierz klienta"),
  carId: Yup.string().when("clientId", {
    is: (clientId: string) => clientId !== "",
    then: (schema) => schema.required("Wybierz samochód"),
    otherwise: (schema) => schema.notRequired(),
  }),
  serviceIds: Yup.array()
    .of(Yup.number())
    .min(1, "Wybierz przynajmniej jedną usługę"),
  status: Yup.string().required("Wybierz status"),
  notes: Yup.string().optional(),
  createdAt: Yup.string().required("Wybierz datę zlecenia"),
});

const OrderModal = ({ isOpen, onClose, order, mode }: OrderModalProps) => {
  const initialValues = {
    clientId: order?.client.id?.toString() || "",
    carId: order?.car?.id?.toString() || "",
    serviceIds: order?.services.map((s) => s.id) || [],
    status: order?.status || "Przyjęte",
    notes: order?.notes || "",
    createdAt: order
      ? new Date(order.createdAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  };

  const handleSubmit = (values: typeof initialValues) => {
    const client = clientsStore.clients.find((c) => c.id === values.clientId);
    if (!client) {
      toast.error("Nieprawidłowy klient wybrany");
      return;
    }
    const car = client.cars.find((c) => c.id === values.carId);
    if (values.clientId && !car) {
      toast.error("Nieprawidłowy samochód wybrany");
      return;
    }
    const services = servicesStore.services.filter((s) =>
      values.serviceIds.includes(s.id)
    );
    const createdAtISO = new Date(values.createdAt).toISOString();

    if (order && mode === "edit") {
      ordersStore.updateOrder(order.id, {
        client,
        car,
        services,
        status: values.status,
        notes: values.notes,
        createdAt: createdAtISO,
      });
    } else if (mode === "add") {
      ordersStore.addOrder({
        client,
        car,
        services,
        status: values.status,
        notes: values.notes,
        createdAt: createdAtISO,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (order) {
      ordersStore.deleteOrder(order.id);
      onClose();
    }
  };

  const title =
    mode === "add"
      ? "Dodaj zlecenie"
      : mode === "edit"
      ? "Edytuj zlecenie"
      : "Usuń zlecenie";

  if (mode === "delete") {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        mode="delete"
        renderBody={() => (
          <p className="dark:text-gray-100">
            Czy na pewno chcesz usunąć zlecenie{" "}
            <span className="font-semibold">{order?.client.name}</span>?
          </p>
        )}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={OrderSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange
    >
      {({ values, setFieldValue, submitForm, errors, touched }) => {
        const selectedClient = clientsStore.clients.find(
          (c) => c.id === values.clientId
        );

        return (
          <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            mode={mode}
            onSave={() => submitForm()}
            renderBody={() => (
              <Form className="flex flex-col space-y-4 m-1">
                <FormField
                  as="select"
                  name="clientId"
                  label="Klient"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue("clientId", e.target.value);
                    if (e.target.value !== values.clientId) {
                      setFieldValue("carId", "");
                    }
                  }}
                >
                  <option value="">Wybierz klienta</option>
                  {clientsStore.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </FormField>

                {values.clientId && selectedClient && (
                  <FormField as="select" name="carId" label="Samochód">
                    {selectedClient.cars.length === 0 ? (
                      <option value="" disabled>
                        Brak samochodów dla wybranego klienta
                      </option>
                    ) : (
                      <>
                        <option value="">Wybierz samochód</option>
                        {selectedClient.cars.map((car: Car) => (
                          <option key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.license_plate})
                          </option>
                        ))}
                      </>
                    )}
                  </FormField>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block dark:text-gray-100 text-gray-900">
                    Usługi
                  </label>
                  <div className="flex flex-col max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 px-3 py-2 rounded space-y-1">
                    {servicesStore.services.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 cursor-pointer dark:text-gray-100 text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={values.serviceIds.includes(s.id)}
                          onChange={() =>
                            setFieldValue(
                              "serviceIds",
                              values.serviceIds.includes(s.id)
                                ? values.serviceIds.filter((id) => id !== s.id)
                                : [...values.serviceIds, s.id]
                            )
                          }
                          className="form-checkbox accent-cyan-500"
                        />
                        {s.name} ({s.price} zł)
                      </label>
                    ))}
                  </div>
                  {errors.serviceIds && touched.serviceIds && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.serviceIds as string}
                    </div>
                  )}
                </div>

                <FormField as="select" name="status" label="Status">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FormField>

                <FormField
                  as="textarea"
                  name="notes"
                  placeholder="Notatki"
                  label="Notatki"
                />

                <FormField
                  name="createdAt"
                  type="datetime-local"
                  label="Data zlecenia"
                />
              </Form>
            )}
          />
        );
      }}
    </Formik>
  );
};

export default OrderModal;
