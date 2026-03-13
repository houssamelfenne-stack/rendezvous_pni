import React from 'react';

interface FormInputProps {
  label?: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, type = 'text', value, onChange, placeholder, required }) => {
  return (
    <div className="form-input">
      <label>
        {label && <span>{label}</span>}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      </label>
    </div>
  );
};

export default FormInput;