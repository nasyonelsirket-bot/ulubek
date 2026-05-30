import { Author } from "@/types";

export const authors: Author[] = [
  {
    id: "1",
    name: "Ayşe Yılmaz",
    role: "Baş Editör",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Mehmet Kaya",
    role: "Ekonomi Muhabiri",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Zeynep Demir",
    role: "Spor Editörü",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Can Öztürk",
    role: "Teknoloji Yazarı",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Elif Arslan",
    role: "Dünya Haberleri Muhabiri",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
];

export function getAuthorById(id: string): Author | undefined {
  return authors.find((a) => a.id === id);
}
