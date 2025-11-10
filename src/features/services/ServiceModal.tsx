import { servicesStore, type Service } from "../../stores/ServicesStore";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormField } from "../../components/FormField/FormField";

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

const ServiceModal = ({
  isOpen,
  onClose,
  service,
  mode,
}: ServiceModalProps) => {
  const initialValues = {
    name: service?.name || "",
    price: service?.price || "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (service && mode === "edit") {
        await servicesStore.updateService(service.id, {
          name: values.name,
          price: Number(values.price),
        });
      } else {
        await servicesStore.addService({
          name: values.name,
          price: Number(values.price),
        });
      }
      onClose();
    } catch (error) {
      console.error("ServiceModal submit error:", error);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    try {
      await servicesStore.deleteService(service.id);
      onClose();
    } catch (error) {
      console.error("ServiceModal delete error:", error);
    }
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
      validateOnBlur
      validateOnChange
    >
      {({ submitForm }) => (
        <BaseModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          mode={mode}
          onSave={() => submitForm()}
          renderBody={() => (
            <Form className="flex flex-col space-y-4 m-1">
              <FormField name="name" placeholder="Nazwa usługi" />
              <FormField name="price" type="number" placeholder="Cena" />
            </Form>
          )}
        />
      )}
    </Formik>
  );
};

export default ServiceModal;
