import { servicesStore, type Service } from "../../stores/ServicesStore";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiAlertCircle } from "react-icons/fi";
import clsx from "clsx";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  mode: "add" | "edit" | "delete";
}

const ServiceSchema = Yup.object().shape({
  name: Yup.string().required("Nazwa usługi jest wymagana"),
  price: Yup.number()
    .typeError("Cena musi być liczbą")
    .positive("Cena musi być większa od 0")
    .required("Cena jest wymagana"),
});

export default function ServiceModal({
  isOpen,
  onClose,
  service,
  mode,
}: ServiceModalProps) {
  const initialValues = {
    name: service?.name || "",
    price: service?.price || "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    if (service && mode === "edit") {
      servicesStore.updateService(service.id, {
        name: values.name,
        price: Number(values.price),
      });
    } else {
      servicesStore.addService({
        name: values.name,
        price: Number(values.price),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!service) return;
    servicesStore.deleteService(service.id);
    onClose();
  };

  const title =
    mode === "add"
      ? "Dodaj usługę"
      : mode === "edit"
      ? "Edytuj usługę"
      : "Usuń usługę";

  if (mode === "delete") {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        mode="delete"
        renderBody={() => (
          <p className="dark:text-gray-100">
            Czy na pewno chcesz usunąć usługę{" "}
            <span className="font-semibold">{service?.name}</span>?
          </p>
        )}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ServiceSchema}
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
                  placeholder="Nazwa usługi"
                  className={clsx(
                    "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    errors.name && touched.name
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                {errors.name && touched.name && (
                  <div className="absolute right-2 top-2.5 text-red-500">
                    <FiAlertCircle size={18} title={errors.name} />
                  </div>
                )}
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <Field
                  name="price"
                  type="number"
                  placeholder="Cena"
                  className={clsx(
                    "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    errors.price && touched.price
                      ? "border-red-500 animate-shake"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                {errors.price && touched.price && (
                  <div className="absolute right-2 top-2.5 text-red-500">
                    <FiAlertCircle size={18} title={errors.price} />
                  </div>
                )}
                <ErrorMessage
                  name="price"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </Form>
          )}
        />
      )}
    </Formik>
  );
}
