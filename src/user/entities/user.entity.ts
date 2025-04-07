import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/baseEntity/base.entity';
import { Role } from '../type/user.role';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  }) /* toClassOnly: request , toPlainOnly: response */
  password: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;
}
