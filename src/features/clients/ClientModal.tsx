import { clientsStore, type Client } from "../../stores/ClientsStore";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiAlertCircle } from "react-icons/fi";
import clsx from "clsx";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  mode?: "add" | "edit" | "delete";
}

const ClientSchema = Yup.object().shape({
  name: Yup.string().required("Imię i nazwisko jest wymagane"),
  phone: Yup.string()
    .matches(/^[0-9+\s-]*$/, "Telefon może zawierać tylko cyfry, spacje, + i -")
    .optional(),
  email: Yup.string().email("Niepoprawny email").optional(),
  notes: Yup.string().optional(),
});

export default function ClientModal({
  isOpen,
  onClose,
  client,
  mode = "add",
}: ClientModalProps) {
  const initialValues = {
    name: client?.name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    notes: client?.notes || "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    if (client && mode === "edit") {
      clientsStore.updateClient(client.id, values);
    } else {
      clientsStore.addClient(values);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!client) return;
    clientsStore.deleteClient(client.id);
    onClose();
  };

  const title =
    mode === "add"
      ? "Dodaj klienta"
      : mode === "edit"
      ? "Edytuj klienta"
      : "Usuń klienta";

  if (mode === "delete") {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        mode="delete"
        renderBody={() => (
          <p className="dark:text-gray-100">
            Czy na pewno chcesz usunąć klienta{" "}
            <span className="font-semibold">{client?.name}</span>?
          </p>
        )}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ClientSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ errors, touched, submitForm }) => (
        <BaseModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          mode={mode}
          onSave={() => submitForm()}
          renderBody={() => (
            <Form className="flex flex-col space-y-4">
              <div className="relative">
                <Field
                  name="name"
                  placeholder="Imię i nazwisko"
                  className={clsx(
                    "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    errors.name && touched.name
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <Field
                  name="phone"
                  placeholder="Telefon"
                  className={`border px-3 py-2 rounded w-full pr-9 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 ${
                    errors.phone && touched.phone
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                />
                {errors.phone && touched.phone && (
                  <div className="absolute right-2 top-2.5 text-red-500">
                    <FiAlertCircle size={18} title={errors.phone} />
                  </div>
                )}
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={`border px-3 py-2 rounded w-full pr-9 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 ${
                    errors.email && touched.email
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                />
                {errors.email && touched.email && (
                  <div className="absolute right-2 top-2.5 text-red-500">
                    <FiAlertCircle size={18} title={errors.email} />
                  </div>
                )}
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <Field
                  as="textarea"
                  name="notes"
                  placeholder="Notatki"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
                />
              </div>
            </Form>
          )}
        />
      )}
    </Formik>
  );
}
