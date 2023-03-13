import {
	OnGatewayConnection,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { WebsocketsService } from './websockets.service';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayConnection {
	constructor(private readonly websocketsService: WebsocketsService) {}

	@WebSocketServer() server: Server;
	async afterInit(serv: Server) {
		serv.on('connection', async (socket : any, req : Request) => {
			socket['request'] = req;
			await this.websocketsService.registerSocket(socket);
		});
	}

	async handleConnection(socket : any) {}

	async handleDisconnect(socket : any) {
		this.websocketsService.unregisterSocket(socket);
	}
}