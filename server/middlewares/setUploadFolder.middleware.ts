export const setUploadFolder = (folder: string) => {
  return (req: any, res: any, next: any) => {
    req.uploadFolder = folder;
    next();
  };
};