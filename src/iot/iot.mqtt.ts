// src/iot/iot.mqtt.ts
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
    const certDir = path.resolve(process.cwd(), 'certs'); // <-- root-level certs folder

    const options = {
      host: endpoint,
      port: 8883,
      protocol: 'mqtts',
      key: fs.readFileSync(path.join(certDir, 'private.pem.key')),
      cert: fs.readFileSync(path.join(certDir, 'certificate.pem.crt')),
      ca: fs.readFileSync(path.join(certDir, 'AmazonRootCA1.pem')),
      rejectUnauthorized: true,
    };

    this.client = connect(options);

    this.client.on('connect', () => {
      this.logger.log('✅ Connected securely to AWS IoT Core');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ AWS IoT MQTT error: ' + err.message);
    });
  }

  /** Generic publisher */
  publish(topic: string, message: any) {
    if (!this.client.connected) {
      this.logger.warn(`⚠️ MQTT not connected, skipping publish to ${topic}`);
      return;
    }
    this.client.publish(topic, JSON.stringify(message));
  }

  /** Specialized publisher for toggling devices */
  publishToggle(deviceId: string, isOn: boolean) {
    const topic = `devices/${deviceId}/toggle`;
    const message = { isOn };
    this.publish(topic, message);
  }

  /** Example: publish metadata updates */
  publishMetadata(deviceId: string, metadata: Record<string, any>) {
    const topic = `devices/${deviceId}/metadata`;
    this.publish(topic, metadata);
  }
}