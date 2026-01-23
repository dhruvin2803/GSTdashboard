export type Client = {
  id: number;
  file_no?: string;
  full_name?: string;
  gst_no?: string;
  mobile_no?: string;
  login_id?: string;
  password?: string;
  pan_no?: string;
  payment_type?: "Monthly" | "Quarterly";
  work_alloted_to?: string;
  group_from?: string;
  created_at?: string;
};
