import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatRoomDto, MessageDto } from './dto/chat.dto';


// Allow requests from the frontend port
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:' + process.env.FRONTEND_PORT],
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('createMessage')
  createMessage(
    @MessageBody('roomName') roomName: string,
    @MessageBody('message') msg: MessageDto,
  ) {
    // Create a message object using the create method from chat.service
    this.chatService.createMessage(roomName, msg);
    console.log('message emitted: ' + Object.entries(msg));
    // Broadcast received message to all users
    this.server.emit('createMessage', msg);
  }

  @SubscribeMessage('createChatRoom')
  createChatRoom(
    @MessageBody('room') room: ChatRoomDto,
    @MessageBody('nick') nick: string,
    @MessageBody('mode') mode: string,
  ) {
    // Set 'password protected' mode
    if (room.password) room.modes = 'p';
    // Set 'private' mode. This is a conversation between
    // 2 users, which is basically a chat room with 2 users
    if (mode === 'priv') room.modes = 'i';
    // Create a chat room and set user as admin
    this.chatService.createChatRoom(room, nick);
    console.log('chatRoom emitted: ' + Object.entries(room));
    // Broadcast newly created room to all users
    this.server.emit('createChatRoom', room.name);
  }

  @SubscribeMessage('findAllMessages')
  findAllMessages(@MessageBody('roomName') roomName: string) {
    return this.chatService.findAllMessages(roomName);
  }

  @SubscribeMessage('findAllChatRooms')
  findAllChatRooms() {
    return this.chatService.findAllChatRooms();
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nickName') nick: string,
  ) {
    const room = this.chatService.getChatRoomByName(roomName);
    room?.bannedNicks.forEach((nickname) => {
      if (nickname === nick)
        throw new WsException('joinRoom: User is banned.');
    });
    this.chatService.identify(roomName, nick, '', true);
    console.log(room.users);

    return roomName;
  }

  @SubscribeMessage('quitRoom')
  quitRoom(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nick') nick: string,
  ) {
    this.chatService.quitRoom(roomName, nick);
    this.server.emit('quitRoom', nick);
  }

  // @SubscribeMessage('ping')
  // ping() {
  //   const rooms = this.chatService.getChatRooms();
  //   for (const room in rooms)
  //   {
  //     for (const user in rooms[room])
  //       this.server.emit('ping',
  //         { rooms[room].name, user },
  //       )
  //   }
  // }

  @SubscribeMessage('typingMessage')
  typingMessage(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nickname') nick: string,
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('typingMessage', { roomName, nick, isTyping });
  }

  @SubscribeMessage('isPasswordProtected')
  isPasswordProtected(@MessageBody('roomName') roomName: string) {
    const room = this.chatService.getChatRoomByName(roomName);
    return room?.password ? true : false;
  }

  @SubscribeMessage('checkPassword')
  checkPassword(
    @MessageBody('roomName') roomName: string,
    @MessageBody('password') password: string,
  ) {
    const room = this.chatService.getChatRoomByName(roomName);
    return room?.password === password ? true : false;
  }

  @SubscribeMessage('changePassword')
  changePassword(
    @MessageBody('roomName') roomName: string,
    @MessageBody('currentPassword') currentPassword: string,
    @MessageBody('newPassword') newPassword: string,
  ) {
    // First, check the current password
    if (this.checkPassword(roomName, currentPassword) === false)
      throw new WsException('changePassword: wrong password!');
    this.chatService.changePassword(roomName, newPassword);
  }

  @SubscribeMessage('removePassword')
  removePassword(@MessageBody('roomName') roomName: string) {
    this.chatService.removePassword(roomName);
    this.server.emit('removePassword', roomName);
  }

  @SubscribeMessage('isUserOper')
  isUserOper(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nick') nick: string,
  ) {
    return this.chatService.isUserOper(roomName, nick);
  }

  // Give a target user the oper status
  @SubscribeMessage('makeOper')
  makeOper(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nick') nick: string,
    @MessageBody('target') target: string,
  ) {
    // First, check if the user has the admin rights
    if (this.isUserOper(roomName, nick) === false)
      throw new WsException('makeOper: user is not oper!');
    this.chatService.makeOper(roomName, target);
    this.server.emit('makeOper', roomName, target);
  }

  @SubscribeMessage('banUser')
  banUser(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nick') nick: string,
    @MessageBody('target') target: string,
  ) {
    // First, check if the user has the admin rights
    if (this.isUserOper(roomName, nick) === false)
      throw new WsException('banUser: user is not oper!');  
    this.chatService.banUser(roomName, target);
    this.server.emit('banUser', roomName, target);
  }

  @SubscribeMessage('kickUser')
  kickUser(
    @MessageBody('roomName') roomName: string,
    @MessageBody('nick') nick: string,
    @MessageBody('target') target: string,
  ) {
    // First, check if the user has the admin rights
    if (this.isUserOper(roomName, nick) === false)
      throw new WsException('kickUser: user is not oper!');
    this.chatService.quitRoom(roomName, target);
    this.server.emit('kickUser', roomName, target);
  }
}
