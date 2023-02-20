import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const USER_SELECT = {
  avatar: true,
  id: true,
  profileId: true,
  provider: true,
  nickname: true,
  username: true,
  totpEnabled: true,
  role: true,
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async findUserByNickname(nickname: string) {
    return this.prisma.user.findUnique({
      where: { nickname },
      select: USER_SELECT,
    });
  }

  async findUserByProfileId(
    provider: string,
    profileId: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        profileId_provider: {
          profileId,
          provider,
        },
      },
      select: USER_SELECT,
    });
  }

  async createUser(
    profileId: string,
    provider: string,
    username: string,
    avatar: string | null,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        profileId,
        provider,
        username,
        avatar,
      },
    });

    // return this.prisma.user.create({
    //   data: {
    //     profileId,
    //     username,
    //     provider,
    //     profileAvatar,
    //     avatar: null,
    //   },
    //   select: {
    //     avatar: true,
    //     id: true,
    //     username: true,
    //     nickname: true,
    //     profileId: true,
    //     provider: true,
    //   },
    // });
  }

  async setUserNickname(user: User, nickname: string): Promise<User> {
    const { id } = user;

    return this.prisma.user.update({
      data: {
        nickname,
      },
      where: {
        id,
      },
      select: USER_SELECT,
    });
  }

  async hasTotpSecret(user: User): Promise<boolean> {
    const { id } = user;

    const dbUser = await this.prisma.user.findFirst({
      where: { id },
      select: {
        totpSecret: true,
      },
    });

    return (dbUser?.totpSecret ?? null) !== null;
  }
}
