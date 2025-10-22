import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { connect, MqttClient } from 'mqtt';

@Injectable()
export class IotMqttService {
  private client: MqttClient;
  private readonly logger = new Logger(IotMqttService.name);

  constructor() {
    const endpoint = process.env.AWS_IOT_ENDPOINT;
    const certDir = path.resolve(process.cwd(), 'certs');

    const url = `mqtts://${endpoint}:8883`; // 👈 clean approach

    const options = {
      key: fs.readFileSync(path.join(certDir, 'private.pem.key')),
      cert: fs.readFileSync(path.join(certDir, 'certificate.pem.crt')),
      ca: fs.readFileSync(path.join(certDir, 'AmazonRootCA1.pem')),
      rejectUnauthorized: true,
    };

    this.client = connect(url, options);

    this.client.on('connect', () => {
      this.logger.log('✅ Connected securely to AWS IoT Core');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ AWS IoT MQTT error: ' + err.message);
    });
  }

  publish(topic: string, message: any) {
    if (!this.client.connected) {
      this.logger.warn(`⚠️ MQTT not connected, skipping publish to ${topic}`);
      return;
    }
    this.client.publish(topic, JSON.stringify(message));
  }

  publishToggle(deviceId: string, isOn: boolean) {
    this.publish(`devices/${deviceId}/toggle`, { isOn });
  }

  publishMetadata(deviceId: string, metadata: Record<string, any>) {
    this.publish(`devices/${deviceId}/metadata`, metadata);
  }
}