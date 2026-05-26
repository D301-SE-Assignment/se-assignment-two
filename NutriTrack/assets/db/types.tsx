export interface User
{
  id: number;
  email: string;
  passwword: string;
}

export interface Profile
{
	id: number,
	user_id: number,
	name: string,
	birthdate: string,
	gender: string,
	ethnicity: string,
	dietary_requirements: string,
	medical_conditions: string,
}