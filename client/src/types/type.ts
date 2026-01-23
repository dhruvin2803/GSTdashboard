export interface Client {
  id: number;

  file_no: string;
  client_name: string;
  mobile_no?: string;
  email?: string;
  client_group_name?: string;

  admin_group_id: number;
  assigned_employee_id?: number;

  services_opted: "GST" | "INCOME_TAX" | "BOTH";

  // GST
  gstin?: string;
  gst_user_id?: string;
  gst_password?: string;
  gst_filing_type?: "MONTHLY" | "QUARTERLY";

  // Income Tax
  itr_v_status?: string;
  audit_status?: string;
  file_status?: string;
  fees_amount?: number;

  created_at: string;
}
