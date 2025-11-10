import { carStore, type Car } from "../../stores/CarStore";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import { toast } from "react-hot-toast";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormField } from "../../components/FormField/FormField";

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  car?: Car | null;
  clientId?: string | null;
  mode?: "add" | "edit" | "delete";
}

type CarInput = Pick<
  Car,
  "make" | "model" | "license_plate" | "color" | "year" | "notes"
>;

const CarModal = ({
  isOpen,
  onClose,
  car,
  clientId,
  mode = "add",
}: CarModalProps) => {
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const initialValues = {
    clientId: clientId || "",
    make: car?.make || "",
    model: car?.model || "",
    licensePlate: car?.license_plate || "",
    color: car?.color || "",
    year: car?.year || "",
    notes: car?.notes || "",
  };

  const baseSchema = {
    make: Yup.string().required("Marka samochodu jest wymagana"),
    model: Yup.string().required("Model samochodu jest wymagany"),
    licensePlate: Yup.string()
      .matches(
        /^[A-Z0-9\s-]{2,8}$/,
        "Niepoprawny format numeru rejestracyjnego"
      )
      .optional(),
    color: Yup.string().optional(),
    year: Yup.number()
      .min(1900, "Rok nie może być wcześniejszy niż 1900")
      .max(
        new Date().getFullYear() + 1,
        "Rok nie może być późniejszy niż przyszły rok"
      )
      .optional(),
    notes: Yup.string().optional(),
  };

  const CarSchema = Yup.object().shape({
    ...baseSchema,
    ...(isAdd
      ? { clientId: Yup.string().required("Klient jest wymagany") }
      : {}),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const carValues: CarInput = {
        make: values.make,
        model: values.model,
        license_plate: values.licensePlate,
        color: values.color,
        year: values.year ? Number(values.year) : undefined,
        notes: values.notes,
      };

      if (isEdit) {
        if (!car) {
          toast.error("Błąd: Brak danych samochodu do edycji");
          return;
        }
        await carStore.updateCar(car.id, carValues);
      } else if (isAdd) {
        await carStore.addCar(values.clientId, carValues);
      }

      toast.success(isEdit ? "Samochód zaktualizowany" : "Samochód dodany");
      onClose();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Nieznany błąd";
      toast.error(`Błąd podczas zapisywania: ${errorMsg}`);
      console.error("CarModal submit error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (!car) {
        toast.error("Błąd: Brak danych samochodu do usunięcia");
        return;
      }
      await carStore.deleteCar(car.id);
      toast.success("Samochód usunięty");
      onClose();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Nieznany błąd";
      toast.error(`Błąd podczas usuwania: ${errorMsg}`);
      console.error("CarModal delete error:", error);
    }
  };

  const title =
    mode === "add"
      ? "Dodaj samochód"
      : mode === "edit"
      ? "Edytuj samochód"
      : "Usuń samochód";

  if (mode === "delete") {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        mode="delete"
        renderBody={() => (
          <p className="dark:text-gray-100">
            Czy na pewno chcesz usunąć samochód{" "}
            <span className="font-semibold">
              {car?.make} {car?.model} ({car?.license_plate})
            </span>
            ?
          </p>
        )}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CarSchema}
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
              {isAdd && (
                <FormField
                  name="clientId"
                  as="select"
                  label="Wybierz klienta"
                  placeholder="Wybierz klienta"
                >
                  <option value="">-- Wybierz klienta --</option>
                  {clientsStore.clients.map((client: Client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </FormField>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField name="make" placeholder="Marka" />
                <FormField name="model" placeholder="Model" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField name="licensePlate" placeholder="Nr rejestracyjny" />
                <FormField name="color" placeholder="Kolor" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField name="year" type="number" placeholder="Rok" />
                <div className="col-span-1" />
              </div>

              <FormField
                name="notes"
                type="textarea"
                placeholder="Notatki o samochodzie"
              />
            </Form>
          )}
        />
      )}
    </Formik>
  );
};

export default CarModal;
