import Textarea from "./Textarea";
import Select from "./Select";
import Input from "./Input";

export enum FieldTypes {
  Number = "number",
  Text = "text",
  TextArea = "textarea",
  Password = "password",
  Select = "select",
}

export interface FormFieldProps {
  className?: string;
  defaultValue?: string;
  errorMessage?: string;
  label?: string;
  name: string;
  type: FieldTypes;
  disabledOption?: string;
  options?: { value: string; label: string; }[]
}

function renderField(props: FormFieldProps) {
  switch (props.type) {
    case FieldTypes.Select:
      return (<Select {...props}/>)
    case FieldTypes.TextArea:
      return (<Textarea {...props}/>)
    case FieldTypes.Text:
    case FieldTypes.Number:
    case FieldTypes.Password:
      return (<Input {...props}/>)
  }
}

export default function FormField(props: FormFieldProps) {
  return (
    <div className={`${props.className} mb-4`}>
      <label className="block text-sm font-bold mb-2" htmlFor={props.name}>
        {props.label}
      </label>
      {renderField(props)}
      {props.errorMessage && (
        <p
          className="form-validation-error"
          role="alert"
          id={`${props.name}-error`}
        >
          {props.errorMessage}
        </p>
      )}
    </div>
  )
}