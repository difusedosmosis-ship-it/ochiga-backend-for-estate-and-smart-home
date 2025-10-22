// src/message/message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { AwsIotService } from './aws-iot.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, AwsIotService],
  controllers: [MessageController],
})
export class MessageModule {}
