export interface User {
  id: number;
  email: string;
  password: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  birthdate: string;
  gender: string;
  ethnicity: string;
  dietary_requirements: string;
  medical_conditions: string;
}
