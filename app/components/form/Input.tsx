import { FormFieldProps } from './FormField';

export default function Input({
  defaultValue,
  errorMessage,
  name,
  type,
}: FormFieldProps) {
  return (
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      type={type}
      name={name}
      defaultValue={defaultValue}
      aria-invalid={
        Boolean(errorMessage) || undefined
      }
      aria-errormessage={
        errorMessage ? `${name}-error` : undefined
      }
    />
  )
}