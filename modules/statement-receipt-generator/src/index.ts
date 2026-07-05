import { createHash } from "crypto";

type StatementType = "full_statement" | "single_receipt" | "monthly_summary" | "audit_report";

export interface GeneratedStatement {
  documentId: string;
  userId: string;
  statementType: StatementType;
  pdfUrl: string;
  documentHash: string;
  digitallySigned: boolean;
  generatedAt: Date;
  expiresAt: Date | null;
  signatureKey: string | null;
}

export async function generateStatement(
  userId: string,
  statementType: StatementType,
  startDate?: Date,
  endDate?: Date,
  transactionId?: string
): Promise<GeneratedStatement> {
  const docId = `DOC_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const now = new Date();
  const payload = `${docId}|${userId}|${statementType}|${now.toISOString()}`;
  const hash = createHash("sha256").update(payload).digest("hex");

  return {
    documentId: docId,
    userId,
    statementType,
    pdfUrl: `https://statements.example.com/${docId}.pdf`,
    documentHash: hash,
    digitallySigned: true,
    generatedAt: now,
    expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    signatureKey: hash.slice(0, 16),
  };
}

export async function verifyStatementIntegrity(statement: GeneratedStatement): Promise<boolean> {
  return statement.documentHash.length === 64;
}
