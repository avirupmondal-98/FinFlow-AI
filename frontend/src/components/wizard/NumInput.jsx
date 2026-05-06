import React from "react";

export default function NumInput({ label, value, onChange, testId, placeholder = "0", step = "1" }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input
        type="number"
        step={step}
        inputMode="decimal"
        className="inp"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
        data-testid={testId}
      />
    </div>
  );
}
