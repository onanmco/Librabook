import {StatusCodes} from "../../app/constants/StatusCodes";
import {CustomError} from "./CustomError";

export class CustomErrorBuilder {
  private error: CustomError;
  
  constructor(msg: string) {
    this.error = new CustomError(msg);
    this.error.code = StatusCodes.HTTP_BAD_REQUEST;
  }
  
  public status(code: number): CustomErrorBuilder {
    this.error.code = code;
    return this;
  }
  
  public details(detailsArray: string[]): CustomErrorBuilder {
    this.error.details = detailsArray;
    return this;
  }
  
  public dispatch(): void {
    throw this.error;
  }

  public build(): void {
    this.dispatch();
  }
  
  public get(): CustomError {
    return this.error;
  }
}