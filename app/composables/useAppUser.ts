export const useAppUser = () => {
  return useState("user", () => ({
    user: {} as any,
    avatar: {} as {
      src: string | null;
      alt: string;
    },
  }));
};
