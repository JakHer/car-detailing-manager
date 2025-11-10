import { observer } from "mobx-react-lite";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { authStore } from "../../stores/AuthStore";
import { FiAlertCircle } from "react-icons/fi";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import toast from "react-hot-toast";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Niepoprawny adres email")
    .required("Email jest wymagany"),
  password: Yup.string().required("Hasło jest wymagane"),
});

const LoginPage = observer(() => {
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await authStore.login(values.email, values.password);
      toast.success("Pomyślnie zalogowano");

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd");
      }
    }
  };

  console.log("authStore.loading", authStore.loading);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnBlur
        validateOnChange
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="max-w-sm mx-auto p-6 space-y-4 bg-gray-800 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-center text-gray-100">
              Zaloguj się
            </h2>

            {/* Email Field */}
            <div className="relative">
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className={clsx(
                  "border px-3 py-2 rounded w-full pr-9 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 bg-gray-700 text-gray-100",
                  errors.email && touched.email
                    ? "border-red-500 animate-shake"
                    : "border-gray-600"
                )}
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

            {/* Password Field */}
            <div className="relative">
              <Field
                name="password"
                type="password"
                placeholder="Hasło"
                className={clsx(
                  "border px-3 py-2 rounded w-full pr-9 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 bg-gray-700 text-gray-100",
                  errors.password && touched.password
                    ? "border-red-500 animate-shake"
                    : "border-gray-600"
                )}
              />
              {errors.password && touched.password && (
                <div className="absolute right-2 top-2.5 text-red-500">
                  <FiAlertCircle size={18} title={errors.password} />
                </div>
              )}
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || authStore.loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-70 text-white py-2 rounded transition-all duration-200"
            >
              {authStore.loading || isSubmitting
                ? "Logowanie..."
                : "Zaloguj się"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
});

export default LoginPage;
