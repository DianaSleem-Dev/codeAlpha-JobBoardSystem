export type ApplyJobRequestDto = {
  jobId: string;
  candidateId:string;
  resume: string;
  coverLetter?: string;
};