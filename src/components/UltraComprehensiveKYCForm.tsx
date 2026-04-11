import { useState, useEffect } from "react";

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];
const ID_TYPES = ["NIN", "BVN", "International Passport", "Driver's License", "Voter's Card"];

export default function UltraComprehensiveKYCForm({
  prefill = {},
  onSubmit,
  loading = false,
}: {
  prefill?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<Record<string, string>>({ ...prefill });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(f => ({ ...f, ...prefill }));
  }, [prefill]);

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Add validation as needed
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.gender || !form.state || !form.address || !form.idType || !form.idNumber || !form.occupation || !form.maritalStatus) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  return (
    <form className="flex flex-col gap-3 w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2 text-[#2c3e5f]">Complete Your KYC</h2>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      <div className="flex gap-2">
        <input name="firstName" value={form.firstName || ""} onChange={handleChange} placeholder="First Name" className="p-2 border rounded w-1/2" required />
        <input name="lastName" value={form.lastName || ""} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded w-1/2" required />
      </div>
      <input name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="p-2 border rounded" required type="email" />
      <input name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone Number" className="p-2 border rounded" required />
      <input name="dob" value={form.dob || ""} onChange={handleChange} placeholder="Date of Birth" className="p-2 border rounded" required type="date" />
      <select name="gender" value={form.gender || ""} onChange={handleChange} className="p-2 border rounded" required>
        <option value="" disabled>Gender</option>
        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select name="maritalStatus" value={form.maritalStatus || ""} onChange={handleChange} className="p-2 border rounded" required>
        <option value="" disabled>Marital Status</option>
        {MARITAL_STATUS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <input name="address" value={form.address || ""} onChange={handleChange} placeholder="Residential Address" className="p-2 border rounded" required />
      <select name="state" value={form.state || ""} onChange={handleChange} className="p-2 border rounded" required>
        <option value="" disabled>State of Origin</option>
        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select name="idType" value={form.idType || ""} onChange={handleChange} className="p-2 border rounded" required>
        <option value="" disabled>ID Type</option>
        {ID_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
      </select>
      <input name="idNumber" value={form.idNumber || ""} onChange={handleChange} placeholder="ID Number (NIN/BVN/etc)" className="p-2 border rounded" required />
      <input name="occupation" value={form.occupation || ""} onChange={handleChange} placeholder="Occupation" className="p-2 border rounded" required />
      <input name="employer" value={form.employer || ""} onChange={handleChange} placeholder="Employer/Business Name" className="p-2 border rounded" />
      <input name="nextOfKin" value={form.nextOfKin || ""} onChange={handleChange} placeholder="Next of Kin" className="p-2 border rounded" />
      <input name="nextOfKinPhone" value={form.nextOfKinPhone || ""} onChange={handleChange} placeholder="Next of Kin Phone" className="p-2 border rounded" />
      <input name="bank" value={form.bank || ""} onChange={handleChange} placeholder="Bank Name" className="p-2 border rounded" />
      <input name="accountNumber" value={form.accountNumber || ""} onChange={handleChange} placeholder="Account Number" className="p-2 border rounded" />
      <button type="submit" className="mt-4 bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base" disabled={loading}>{loading ? "Submitting..." : "Submit KYC"}</button>
    </form>
  );
}
