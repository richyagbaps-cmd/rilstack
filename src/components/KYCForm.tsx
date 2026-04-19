import { useState } from "react";

export default function KYCForm({
  mode,
  initialData,
  onSaveDraft,
  onComplete,
}: {
  mode: "google" | "email";
  initialData?: any;
  onSaveDraft?: (draft: any) => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>(initialData || {});
  const [saving, setSaving] = useState(false);

  // Validation helpers
  const validatePhone = (phone: string) =>
    /^(080|081|070|090)\d{7,8}$/.test(phone);
  const validateNIN = (nin: string) => /^\d{11}$/.test(nin);

  // Step fields
  const steps = [
    {
      label: "Basic Info",
      fields: [
        { name: "fullName", label: "Full Name", required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        {
          name: "phone",
          label: "Phone Number",
          required: true,
          validate: validatePhone,
        },
        { name: "email", label: "Email", required: true, type: "email" },
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
        { name: "idType", label: "Means of ID Type", required: true },
        { name: "idNumber", label: "ID Number", required: true },
        {
          name: "selfie",
          label: "Upload Selfie",
          type: "file",
          required: true,
        },
        {
          name: "idPhoto",
          label: "Upload ID Photo",
          type: "file",
          required: true,
        },
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
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate required fields
    const current = steps[step - 1];
    for (const field of current.fields) {
      if (field.required && !form[field.name])
        return alert(`${field.label} is required`);
      if (
        field.validate &&
        form[field.name] &&
        !field.validate(form[field.name])
      )
        return alert(`Invalid ${field.label}`);
    }
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSaveDraft = () => {
    setSaving(true);
    onSaveDraft && onSaveDraft(form);
    setTimeout(() => setSaving(false), 500);
  };

  const handleSubmit = () => {
    // Validate all fields
    for (const s of steps) {
      for (const field of s.fields) {
        if (field.required && !form[field.name])
          return alert(`${field.label} is required`);
        if (
          field.validate &&
          form[field.name] &&
          !field.validate(form[field.name])
        )
          return alert(`Invalid ${field.label}`);
      }
    }
    // Terms & PIN setup would go here
    onComplete();
  };

  return (
    <div>
      <div className="mb-4">
        <div className="font-bold text-lg mb-2">{steps[step - 1].label}</div>
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
            {field.type === "file" ? (
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
          >
            Back
          </button>
        )}
        {step < steps.length && (
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white"
            onClick={handleNext}
          >
            Next
          </button>
        )}
        {step === steps.length && (
          <button
            className="px-4 py-2 rounded bg-green-500 text-white"
            onClick={handleSubmit}
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
        >
          {saving ? "Saving..." : "Save & Resume Later"}
        </button>
      </div>
    </div>
  );
}
