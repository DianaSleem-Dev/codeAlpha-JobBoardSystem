export type ResumeResponseDto = {
  id: string;
  candidateId: string;

  title?: string;
  fileUrl: string;

  createdAt: Date;
};