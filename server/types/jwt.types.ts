import { UserRole } from "../enums/user-role.enum";

export type JwtAuthPayload = {
  id: string;
  employerId?:string,
  candidateId?:string,
  role: UserRole;
};

export type AuthUser = JwtAuthPayload & {
  firstName?: string;
  lastName?: string;
  email?: string;
};