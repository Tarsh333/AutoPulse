import { useEffect, useState } from "react";
import ExtractedView from "./ExtractedView";
import {
  getShare,
  getSharedDownloadUrl,
  SharedDocument,
} from "../api/shares";

export default function SharedDocumentsPage({ token }: { token: string }) {
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShare(token)
      .then((data) => {
        setOwnerName(data.owner_name);
        setDocuments(data.documents);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async (id: number) => {
    try {
      const { url } = await getSharedDownloadUrl(token, id);
      window.open(url, "_blank");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB]">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-[#1F3E72]" style={{ fontSize: "32px" }}>
            AutoPulse
          </h1>
          {ownerName && (
            <p className="text-[#5C7BA8] mt-2">
              Shared documents from {ownerName}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-[#5C7BA8] text-center">Loading shared documents...</p>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 border-2 border-[#D6E4F5] text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-[#5C7BA8] text-center">No documents shared.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#D6E4F5] rounded-lg"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="text-[#1F3E72] truncate">{doc.file_name}</p>
                    <p className="text-sm text-[#5C7BA8]">
                      {new Date(doc.created_at).toLocaleDateString()}
                      {doc.category ? ` · ${doc.category}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {doc.extracted_data && (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === doc.id ? null : doc.id)
                        }
                        className="text-[#2F5D9F] hover:underline"
                      >
                        {expandedId === doc.id ? "Hide" : "View Data"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="text-[#2F5D9F] hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>

                {expandedId === doc.id && doc.extracted_data && (
                  <div className="px-4 pb-4">
                    <ExtractedView data={doc.extracted_data} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
