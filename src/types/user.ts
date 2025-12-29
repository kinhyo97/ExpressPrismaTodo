// src/types/user.ts

export interface UserPayload {
  id: number;      // 컨트롤러에서 쓰는 필드
  userId: number;  // 필요하면 서비스 쪽에서 직접 써도 됨
  email: string;
}
