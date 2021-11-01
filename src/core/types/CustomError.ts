export class CustomError extends Error {
  public code: number;
  public digest: string;
  public details: string[];

  constructor(msg: string) {
    super(msg);
    this.digest = msg;
  }
}
