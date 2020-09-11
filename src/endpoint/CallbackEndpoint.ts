import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest } from '@rocket.chat/apps-engine/definition/api';
import { IApiResponse } from '@rocket.chat/apps-engine/definition/api/IResponse';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';

export class CallbackEndpoint extends ApiEndpoint {

    public path = 'callback';

    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const roomId = request.query.meetingID;
        const room = await read.getRoomReader().getById(roomId);
        if (!room) {
            return this.json({ status: HttpStatusCode.NOT_FOUND, content: {error: 'Room not found'}});
        }

        if (room.type === RoomType.LIVE_CHAT) {
            const endMessage = await read.getEnvironmentReader().getSettings().getValueById('DEFAULT_END_MESSAGE');

            const messageBuilder = modify.getCreator().startMessage();
            messageBuilder.setSender(room['servedBy']);
            messageBuilder.setText(endMessage);
            messageBuilder.setRoom(room);

            await modify.getCreator().finish(messageBuilder);
        }

        return this.json({ status: HttpStatusCode.OK });
    }
}
