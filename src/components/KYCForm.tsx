import { useState } from "react";

type KycStepField = {
  name: string;
  label: string;
  required: boolean;
  type?: string;
  validate?: (value: string) => boolean;
};

export default function KYCForm({
  mode,
  initialData,
  onSaveDraft,
  onComplete,
}: {
  mode: "google" | "email";
  initialData?: Record<string, any>;
  onSaveDraft?: (draft: Record<string, any>) => void;
  onComplete: (data: Record<string, any>) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, any>>(initialData || {});
  const [saving, setSaving] = useState(false);

  const validatePhone = (phone: string) =>
    /^(080|081|070|090)\d{7,8}$/.test(phone);
  const validateNIN = (nin: string) => /^\d{11}$/.test(nin);

  const steps: Array<{ label: string; fields: KycStepField[] }> = [
    {
      label: "Basic Info",
      fields: [
        { name: "fullName", label: "Full Name", required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        { name: "gender", label: "Gender", required: true },
        {
          name: "phone",
          label: "Phone Number",
          required: true,
          validate: validatePhone,
        },
        {
          name: "email",
          label: "Email",
          required: true,
          type: "email",
        },
      ],
    },
    {
      label: "Identity & Address",
      fields: [
        { name: "bvn", label: "BVN (optional)", required: false },
        { name: "nin", label: "NIN", required: true, validate: validateNIN },
        { name: "address", label: "Home Address", required: true },
        { name: "state", label: "State", required: true },
        { name: "lga", label: "LGA", required: true },
      ],
    },
    {
      label: "Financial Profile",
      fields: [
        { name: "occupation", label: "Occupation", required: true },
        { name: "income", label: "Income Range", required: true },
        { name: "source", label: "Source of Funds", required: true },
      ],
    },
  ];

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = (fields: KycStepField[]) => {
    for (const field of fields) {
      if (field.required && !form[field.name]) {
        return `${field.label} is required`;
      }
      if (
        field.validate &&
        form[field.name] &&
        !field.validate(String(form[field.name]))
      ) {
        return `Invalid ${field.label}`;
      }
    }
    return null;
  };

  const handleNext = () => {
    const error = validateFields(steps[step - 1].fields);
    if (error) {
      alert(error);
      return;
    }
    setStep((value) => value + 1);
  };

  const handlePrev = () => setStep((value) => value - 1);

  const handleSaveDraft = () => {
    setSaving(true);
    onSaveDraft?.(form);
    setTimeout(() => setSaving(false), 500);
  };

  const handleSubmit = () => {
    for (const currentStep of steps) {
      const error = validateFields(currentStep.fields);
      if (error) {
        alert(error);
        return;
      }
    }

    // NIN automatically becomes the ID — no separate ID type/number needed
    onComplete({ ...form, idType: "nin", idNumber: form.nin });
  };

  return (
    <div>
      <div className="mb-4">
        <div className="font-bold text-lg mb-2">
          {steps[step - 1].label}
          <span className="ml-2 text-xs font-normal text-gray-500">
            {mode === "google" ? "Google account" : "Email account"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
        {steps[step - 1].fields.map((field) => (
          <div className="mb-3" key={field.name}>
            <label className="block mb-1 font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.name === "gender" ? (
              <select
                className="w-full border p-2 rounded"
                value={form[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="other">Other</option>
              </select>
            ) : field.type === "file" ? (
              <input
                type="file"
                className="w-full border p-2 rounded"
                onChange={(e) => handleChange(field.name, e.target.files?.[0])}
              />
            ) : (
              <input
                type={field.type || "text"}
                className="w-full border p-2 rounded"
                value={form[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        {step > 1 && (
          <button
            className="px-4 py-2 rounded bg-gray-300"
            onClick={handlePrev}
            type="button"
          >
            Back
          </button>
        )}
        {step < steps.length && (
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white"
            onClick={handleNext}
            type="button"
          >
            Next
          </button>
        )}
        {step === steps.length && (
          <button
            className="px-4 py-2 rounded bg-green-500 text-white"
            onClick={handleSubmit}
            type="button"
          >
            Submit
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded border border-blue-400 text-blue-600"
          onClick={handleSaveDraft}
          disabled={saving}
          type="button"
        >
          {saving ? "Saving..." : "Save & Resume Later"}
        </button>
      </div>
    </div>
  );
}
