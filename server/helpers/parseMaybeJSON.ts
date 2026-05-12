export const parseMaybeJSON = <T>(value: any): T => {
  if (!value) return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Invalid JSON format");
    }
  }

  return value;
};