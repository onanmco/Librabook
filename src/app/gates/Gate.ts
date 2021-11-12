import {BaseEntity} from "typeorm";

export abstract class Gate<T extends BaseEntity> {
  protected entity: T;

  public constructor(entity: T) {
    this.entity = entity;
  }
}