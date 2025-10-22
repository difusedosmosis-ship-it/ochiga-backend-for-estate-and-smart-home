// src/message/message.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { AwsIotService } from './aws-iot.service';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly service: MessageService,
    private readonly awsIotService: AwsIotService,
  ) {}

  @Post()
  async create(@Body() data: any) {
    // Save message to DB
    const message = await this.service.create(data);

    // Publish message to AWS IoT Core
    await this.awsIotService.publishMessage('ochiga/messages', message);

    return {
      success: true,
      message: 'Message saved and published to AWS IoT Core',
      data: message,
    };
  }

  @Get(':senderId/:receiverId')
  findConversation(
    @Param('senderId') senderId: number,
    @Param('receiverId') receiverId: number,
  ) {
    return this.service.findConversation(senderId, receiverId);
  }

  // ✅ Test AWS IoT connection manually
  @Post('test')
  async testConnection() {
    await this.awsIotService.publishTestMessage();
    return { success: true, message: 'Test message published to AWS IoT Core' };
  }
}
