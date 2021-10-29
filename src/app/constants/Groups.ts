export class Groups {
  public static readonly ROOT = 'ROOT';
  public static readonly CONSUMER = 'CONSUMER';

  public static getAllGroups(): string[] {
    return [
      Groups.ROOT,
      Groups.CONSUMER
    ];
  }
}