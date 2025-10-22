// src/message/aws-iot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as awsIot from 'aws-iot-device-sdk';

@Injectable()
export class AwsIotService {
  private readonly logger = new Logger(AwsIotService.name);
  private readonly device: awsIot.device;

  constructor() {
    // Create IoT device connection
    this.device = new awsIot.device({
      keyPath: path.resolve(__dirname, '../../certs/private.pem.key'),
      certPath: path.resolve(__dirname, '../../certs/certificate.pem.crt'),
      caPath: path.resolve(__dirname, '../../certs/AmazonRootCA1.pem'),
      clientId: 'OchigaBackendClient',
      host: 'a3m9h28ikfvc7r-ats.iot.us-east-1.amazonaws.com',
      protocol: 'mqtts',
    });

    // Connection event
    this.device.on('connect', () => {
      this.logger.log('✅ Connected to AWS IoT Core');
      this.device.subscribe('ochiga/messages');
    });

    // Message received event
    this.device.on('message', (topic: string, payload: Buffer) => {
      this.logger.log(`📩 Received from ${topic}: ${payload.toString()}`);
    });

    // Error handling
    this.device.on('error', (error: Error) => {
      this.logger.error(`❌ AWS IoT Error: ${error.message}`);
    });
  }

  /** Publish a message to a topic */
  async publishMessage(topic: string, payload: Record<string, any>): Promise<void> {
    this.device.publish(topic, JSON.stringify(payload));
    this.logger.log(`📤 Published to ${topic}: ${JSON.stringify(payload)}`);
  }

  /** Simple test publisher for debugging */
  async publishTestMessage(): Promise<void> {
    const payload = {
      message: 'Hello from Ochiga Backend!',
      timestamp: new Date().toISOString(),
    };
    await this.publishMessage('ochiga/test/topic', payload);
  }
}
