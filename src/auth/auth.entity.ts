import { randomUUID } from 'node:crypto';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../user/user.entity';
@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerId: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  generateId() {
    this.id = randomUUID();
  }
}
