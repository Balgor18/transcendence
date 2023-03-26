import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebsocketsService } from 'src/websockets/websockets.service';
import { giveAchievementService } from 'src/achievement/utils/giveachievement.service';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';
@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly achievement: giveAchievementService,
  ) {}

  async getAllFriendsFromUser(user: User) {
    return this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        friends: true,
      },
    });
  }

  async addFriendsByNickname(user: User, nickname: string) {
    const userToAdd: User | null = await this.prisma.user.findUnique({
      where: {
        nickname: nickname,
      },
    });
    if (!userToAdd) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        friends: {
          connect: {
            nickname: nickname,
          },
        },
      },
    });
    this.achievement.getAchievement(user);
  }

  async removeFriendsByNickname(user: User, nickname: string) {
    const userToRemove: User | null = await this.prisma.user.findUnique({
      where: {
        nickname: nickname,
      },
    });
    if (!userToRemove) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        friends: {
          disconnect: {
            nickname: nickname,
          },
        },
      },
    });
  }
}
