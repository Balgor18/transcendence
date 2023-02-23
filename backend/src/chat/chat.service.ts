import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { MessageDto, ChatRoomDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  // Array containing all chatrooms
  chatRooms: ChatRoomDto[] = [];

  identify(roomName: string, nick: string, modes: string) {
    const room = this.getChatRoomByName(roomName);
    if (room) room.users[nick].modes = modes;
    throw new WsException('identify: unknown room name!');
  }

  quitRoom(roomName: string, userName: string, clientId: string) {
    const room = this.getChatRoomByName(roomName);
    if (room) delete room.users[clientId];
    throw new WsException('quitRoom: unknown room name!');
  }

  getChatRoomByName(name: string) {
    for (let i = 0; i < this.chatRooms.length; ++i)
      if (this.chatRooms[i].name === name) return this.chatRooms[i];
    throw new WsException('getChatRoomByName: unknown room name!');
  }

  getUserById(roomName: string, clientId: string) {
    const room = this.getChatRoomByName(roomName);
    if (room) return room.users[clientId];
    throw new WsException('getUserById: unknown room name!');
  }

  // Create a new message object and push it to the messages array
  createMessage(roomName: string, msg: MessageDto) {
    const message = { ...MessageDto };
    const room = this.getChatRoomByName(roomName);
    if (room) {
      room.messages.push(msg);
      return message;
    }
    throw new WsException('createMessage: unknown room name!');
  }

  // Create a new chat room object and push it to the chat rooms array
  // the creator will get admin privileges
  createChatRoom(room: ChatRoomDto, nick: string) {
    const chatRoom = { ...ChatRoomDto };
    if (room) {
      // Add room to room array
      this.chatRooms.push(room);
      // Identify creator as the oper(=admin)
      this.identify(room.name, nick, 'o');
      return chatRoom;
    }
    throw new WsException("createChatRoom: 'room' argument is missing!");
  }

  // Return all messages from the chatroom
  findAllMessages(roomName: string) {
    const room = this.getChatRoomByName(roomName);
    if (room) return room.messages;
    throw new WsException('findAllMessages: unknown room name!');
  }

  findAllChatRooms() {
    return this.chatRooms;
  }
}
