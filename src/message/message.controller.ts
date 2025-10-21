import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly service: MessageService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get(':senderId/:receiverId')
  findConversation(@Param('senderId') senderId: number, @Param('receiverId') receiverId: number) {
    return this.service.findConversation(senderId, receiverId);
  }
}
