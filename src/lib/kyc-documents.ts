import { TABLES, insertRow } from "@/lib/seatable";

interface KycDocumentInput {
  type: "selfie" | "id_card";
  url: string;
}

export async function saveKycDocumentsForEmail(
  email: string,
  documents: KycDocumentInput[],
): Promise<void> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return;

  for (const doc of documents) {
    const cleanedUrl = String(doc.url || "").trim();
    if (!cleanedUrl) continue;

    await insertRow(TABLES.KYC_DOCUMENTS, {
      user_email: normalizedEmail,
      document_type: doc.type,
      document_url: cleanedUrl,
      uploaded_at: new Date().toISOString(),
    });
  }
}
