import fs from 'fs';
import path from 'path';

export class Loader {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  public loadControllers(): void {
    fs.readdirSync(this.path).forEach(file => {
      import(path.join(this.path, file));
    });
  };
}