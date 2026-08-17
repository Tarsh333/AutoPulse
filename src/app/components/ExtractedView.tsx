import { ExtractedData } from "../api/documents";

// Renders OCR-extracted data as a medicines table (prescriptions),
// a metrics table (lab reports), or raw JSON as a fallback.
export default function ExtractedView({ data }: { data: ExtractedData }) {
  if (data.document_type === "prescription" && data.medicines?.length) {
    return (
      <div className="bg-white border border-[#D6E4F5] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#EAF2FB] text-[#1F3E72]">
            <tr>
              <th className="text-left p-2">Medicine</th>
              <th className="text-left p-2">Strength</th>
              <th className="text-left p-2">Dose</th>
              <th className="text-left p-2">Frequency</th>
              <th className="text-left p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.medicines.map((m, i) => (
              <tr key={i} className="border-t border-[#D6E4F5] text-[#5C7BA8]">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.strength}</td>
                <td className="p-2">{m.dose}</td>
                <td className="p-2">{m.frequency}</td>
                <td className="p-2">{m.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.document_type === "lab_report" && data.metrics?.length) {
    return (
      <div className="bg-white border border-[#D6E4F5] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#EAF2FB] text-[#1F3E72]">
            <tr>
              <th className="text-left p-2">Metric</th>
              <th className="text-left p-2">Value</th>
              <th className="text-left p-2">Unit</th>
              <th className="text-left p-2">Reference</th>
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((m, i) => (
              <tr key={i} className="border-t border-[#D6E4F5] text-[#5C7BA8]">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.value}</td>
                <td className="p-2">{m.unit}</td>
                <td className="p-2">{m.reference_range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <pre className="text-xs bg-[#EAF2FB] p-3 rounded-lg overflow-auto text-[#5C7BA8]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
