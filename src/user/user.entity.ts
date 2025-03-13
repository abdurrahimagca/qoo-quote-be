import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NB = 'non-binary',
  NS = 'not-specified',
}

registerEnumType(Gender, { name: 'Gender' });

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  age: number;

  @Field(() => Gender, { nullable: true })
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.NS,
    nullable: true,
  })
  gender: Gender;

  @Field()
  @Column({ default: false })
  isPrivate: boolean;
}
