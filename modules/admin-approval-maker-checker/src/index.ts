type OperationType = "withdrawal_request" | "rate_update" | "supply_adjustment" | "user_suspension";
type Status = "pending_approval" | "approved" | "rejected" | "revoked";

export interface ApprovalRequest {
  requestId: string;
  operationType: OperationType;
  targetId: string;
  amount: number | null;
  makerId: string;
  status: Status;
  checkerId: string | null;
  checkerNote: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createApprovalRequest(
  operationType: OperationType,
  targetId: string,
  makerId: string,
  amount?: number
): Promise<ApprovalRequest> {
  const now = new Date();
  return {
    requestId: `REQ_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    operationType,
    targetId,
    amount: amount || null,
    makerId,
    status: "pending_approval",
    checkerId: null,
    checkerNote: null,
    appliedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function approveRequest(request: ApprovalRequest, checkerId: string, note?: string): Promise<ApprovalRequest> {
  return {
    ...request,
    status: "approved",
    checkerId,
    checkerNote: note || null,
    appliedAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function rejectRequest(request: ApprovalRequest, checkerId: string, reason: string): Promise<ApprovalRequest> {
  return {
    ...request,
    status: "rejected",
    checkerId,
    checkerNote: reason,
    updatedAt: new Date(),
  };
}
