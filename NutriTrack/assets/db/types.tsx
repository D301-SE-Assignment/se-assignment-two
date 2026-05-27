export interface User
{
	id: number,
	email: string,
	passwword: string,
}
export interface Session
{
	token: string,
	user_id: number,
	profile_id: number,
	expiry: number,
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