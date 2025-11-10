import { Field, ErrorMessage, type FieldProps, type FormikProps } from "formik";
import Select, { type MultiValue, type SingleValue } from "react-select";
import clsx from "clsx";
import DatePicker from "react-datepicker";
import { FiCalendar } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";

type FieldType = "input" | "textarea" | "select" | "react-select" | "datetime";

interface Option {
  value: string | number;
  label: string;
}

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  as?: FieldType;
  placeholder?: string;
  options?: Option[];
  isMulti?: boolean;
  children?: React.ReactNode;
  onChange?: (value: string | number | (string | number)[]) => void;
}

export const FormField = ({
  name,
  label,
  type = "text",
  as = "input",
  placeholder,
  options,
  isMulti = false,
  children,
  onChange,
}: FormFieldProps) => {
  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium mb-1 block dark:text-gray-100 text-gray-900"
        >
          {label}
        </label>
      )}

      <Field name={name}>
        {({
          field,
          form,
          meta,
        }: FieldProps & { form: FormikProps<unknown> }) => {
          if (options && (as === "select" || as === "react-select")) {
            const selected = isMulti
              ? options.filter((opt) =>
                  Array.isArray(field.value)
                    ? field.value.includes(opt.value)
                    : false
                )
              : options.find((opt) => opt.value === field.value) || null;

            return (
              <Select<Option, boolean>
                id={name}
                instanceId={name}
                options={options}
                isMulti={isMulti}
                value={selected}
                placeholder={placeholder}
                onChange={(val: SingleValue<Option> | MultiValue<Option>) => {
                  const value = isMulti
                    ? (val as MultiValue<Option>).map((v) => v.value)
                    : (val as SingleValue<Option>)?.value || "";
                  form.setFieldValue(name, value);
                  onChange?.(value);
                }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "var(--tw-bg-opacity)",
                    borderColor:
                      meta.touched && meta.error ? "#ef4444" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px #06b6d4" : "none",
                    "&:hover": { borderColor: "#06b6d4" },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 50,
                    backgroundColor: "#fff",
                    color: "#000",
                  }),
                }}
                classNamePrefix="react-select"
              />
            );
          }

          const commonClass = clsx(
            "border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            meta.touched && meta.error
              ? "border-red-500 animate-shake"
              : "border-gray-300 dark:border-gray-600"
          );

          if (as === "textarea") {
            return (
              <textarea
                {...field}
                id={name}
                placeholder={placeholder}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e.target.value);
                }}
                className={`${commonClass} resize-none`}
              />
            );
          }

          if (as === "select") {
            return (
              <select
                {...field}
                id={name}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e.target.value);
                }}
                className={commonClass}
              >
                {children}
              </select>
            );
          }

          if (type === "datetime-local" || as === "datetime") {
            return (
              <div className="flex flex-col w-full relative">
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) => {
                    const isoString = date ? date.toISOString() : "";
                    form.setFieldValue(field.name, isoString);
                    onChange?.(isoString);
                  }}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText={placeholder || "Wybierz datę i godzinę"}
                  className={commonClass}
                  popperClassName="z-50"
                  popperProps={{ strategy: "fixed" }}
                />
                <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            );
          }

          return (
            <input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e.target.value);
              }}
              className={commonClass}
            />
          );
        }}
      </Field>

      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};
