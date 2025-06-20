interface UserPayload {
  userId: string;
  username: string;
}

declare namespace Express {
  export interface Request {
    user: UserPayload;
  }
}
