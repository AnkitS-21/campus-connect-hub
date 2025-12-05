export type AppRole = 'student' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  roll_no: string | null;
  email: string | null;
  cpi: number | null;
  branch: string | null;
  minor: string | null;
  resume_link: string | null;
  phone: string | null;
  graduation_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  role: string;
  ctc: string;
  job_type: string;
  location: string;
  jd_link: string | null;
  deadline: string;
  min_cpi: number | null;
  allowed_branches: string[] | null;
  allowed_minors: string[] | null;
  allowed_graduation_years: number[] | null;
  created_at: string;
  created_by: string | null;
}

export interface Application {
  id: string;
  user_id: string;
  company_id: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected';
  applied_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
