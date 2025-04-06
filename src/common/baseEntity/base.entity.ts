import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;
  @VersionColumn()
  @Exclude()
  version: number;
}
