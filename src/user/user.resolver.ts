import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Gender } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async me(@Context() context: any): Promise<User> {
    const userId = context.req.uid;
    return this.userService.findUserById(userId);
  }

  @Query(() => Boolean)
  async checkUserNameAvailability(
    @Args('username') username: string,
  ): Promise<boolean> {
    return this.userService.checkUserNameAvailability(username);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async patchUser(
    @Context() context: any,
    @Args('name', { nullable: true }) name?: string,
    @Args('age', { nullable: true }) age?: number,
    @Args('gender', { nullable: true }) gender?: Gender,
    @Args('isPrivate', { nullable: true }) isPrivate?: boolean,
    @Args('username', { nullable: true }) username?: string,
    // Extract user from request
  ): Promise<User> {
    const userId = context.req.uid;
    const user = await this.userService.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (typeof name !== 'undefined') user.name = name;
    if (typeof age !== 'undefined') user.age = age;
    if (typeof gender !== 'undefined') user.gender = gender;
    if (typeof isPrivate !== 'undefined') user.isPrivate = isPrivate;
    if (typeof username !== 'undefined') {
      if (await this.userService.checkUserNameAvailability(username)) {
        user.username = username;
      } else {
        throw new Error('Username already taken');
      }
    }

    await this.userService.patchUser(user);
    return this.userService.findUserById(userId);
  }
}
