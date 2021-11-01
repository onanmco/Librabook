export default class Errors {
  public static ACCOUNT_NOT_FOUND = 'Account does not exist.';
  public static INVALID_CREDENTIALS = 'Invalid credentials. Please try again.';
  public static NAME_CHARSET(fieldName: string): string {
    return `${fieldName} can only contain letters, dash, dot and apostrophe.`
  }
  public static UPPERCASE_RULE(fieldName: string, count: number): string {
    return `${fieldName} field must contain at least ${count} uppercase character.`;
  }
  public static DIGIT_RULE(fieldName: string, count: number): string {
    const object = count > 1 ? 'digits' : 'digit';
    return `${fieldName} must contain at least ${count} ${object}`;
  }
  public static PASSWORD_CHARSET(fieldName: string): string {
    return `${fieldName} field can only contain English letters and special characters.`;
  }
  public static EMAIL_ALREADY_TAKEN = 'E-mail address has been already taken.';
  public static SESSION_EXPIRED = 'Session expired.';
  public static UNKNOWN_ERROR = 'Unable to process your request. Please contact support.';
  public static VALIDATION_ERROR = 'Invalid parameters in values.';
  public static UNAUTHORIZED_ACCESS = 'Unauthorized.';
}