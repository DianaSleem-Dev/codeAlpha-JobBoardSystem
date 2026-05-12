import { Gender } from "../../enums/gender.enum";
import { UserRole } from "../../enums/user-role.enum";

export type RegisterRequestDto = {
  firstName: string;
  lastName: string;
  gender:Gender;
  country: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  password: string;
  role: UserRole.EMPLOYER | UserRole.CANDIDATE;
};