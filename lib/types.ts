export type LetterStatus = "pending" | "approved" | "rejected";

export type Letter = {
  id: string;
  nickname: string;
  content: string | null;
  status: LetterStatus;
  public_preview: string | null;
  created_at: string;
};

export type PublicLetter = {
  id: string;
  nickname: string;
  content: string | null;
  status: LetterStatus;
  public_preview: string | null;
  created_at: string;
};
