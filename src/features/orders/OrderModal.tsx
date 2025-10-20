import { clientsStore } from "../../stores/ClientsStore";
import { servicesStore } from "../../stores/ServicesStore";
import {
  ordersStore,
  type Order,
  type OrderStatus,
} from "../../stores/OrdersStore";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiAlertCircle } from "react-icons/fi";
import clsx from "clsx";

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
  clientId: Yup.number().required("Wybierz klienta"),
  serviceIds: Yup.array()
    .of(Yup.number())
    .min(1, "Wybierz przynajmniej jedną usługę"),
  status: Yup.string().required("Wybierz status"),
  notes: Yup.string().optional(),
});

export default function OrderModal({
  isOpen,
  onClose,
  order,
  mode,
}: OrderModalProps) {
  const initialValues = {
    clientId: order?.client.id || "",
    serviceIds: order?.services.map((s) => s.id) || [],
    status: order?.status || "Przyjęte",
    notes: order?.notes || "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    const client = clientsStore.clients.find((c) => c.id === values.clientId)!;
    const services = servicesStore.services.filter((s) =>
      values.serviceIds.includes(s.id)
    );

    if (order && mode === "edit") {
      ordersStore.updateOrder(order.id, {
        client,
        services,
        status: values.status,
        notes: values.notes,
      });
    } else if (mode === "add") {
      ordersStore.addOrder({
        client,
        services,
        status: values.status,
        notes: values.notes,
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
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ values, errors, touched, setFieldValue, submitForm }) => (
        <BaseModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          mode={mode}
          onSave={() => submitForm()}
          renderBody={() => (
            <Form className="flex flex-col space-y-3">
              <div className="relative">
                <Field
                  as="select"
                  name="clientId"
                  className={clsx(
                    "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    errors.clientId && touched.clientId
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFieldValue("clientId", Number(e.target.value))
                  }
                  value={values.clientId}
                >
                  <option value="">Wybierz klienta</option>
                  {clientsStore.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Field>
                {errors.clientId && touched.clientId && (
                  <div className="absolute right-2 top-2.5 text-red-500">
                    <FiAlertCircle size={18} title={errors.clientId} />
                  </div>
                )}
                <ErrorMessage
                  name="clientId"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

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
                {errors.serviceIds && touched.serviceIds && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.serviceIds as string}
                  </div>
                )}
              </div>

              <Field
                as="select"
                name="status"
                className={clsx(
                  "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                  errors.status && touched.status
                    ? "border-red-500 animate-shake"
                    : "border-gray-300 dark:border-gray-600"
                )}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-sm mt-1"
              />

              <Field
                as="textarea"
                name="notes"
                placeholder="Notatki"
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              />
            </Form>
          )}
        />
      )}
    </Formik>
  );
}
