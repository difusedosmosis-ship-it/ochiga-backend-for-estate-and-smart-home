import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { connect, MqttClient } from 'mqtt';

@Injectable()
export class IotMqttService {
  private client!: MqttClient;
  private readonly logger = new Logger(IotMqttService.name);

  constructor() {
    try {
      const endpoint = process.env.AWS_IOT_ENDPOINT;
      if (!endpoint) {
        throw new Error('AWS_IOT_ENDPOINT environment variable is missing!');
      }

      // Works for both Docker and local environments
      const certDir = path.join(__dirname, '..', '..', 'certs');

      console.log('🔍 Cert directory:', certDir);
      console.log(
        '🔍 Files found:',
        fs.existsSync(certDir) ? fs.readdirSync(certDir) : '❌ No certs folder found',
      );

      const url = `mqtts://${endpoint}:8883`;

      const keyPath = path.join(certDir, 'private.pem.key');
      const certPath = path.join(certDir, 'certificate.pem.crt');
      const caPath = path.join(certDir, 'AmazonRootCA1.pem');

      // Ensure certificate files exist
      [keyPath, certPath, caPath].forEach((p) => {
        if (!fs.existsSync(p)) throw new Error(`Missing certificate file: ${p}`);
      });

      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true,
      };

      this.client = connect(url, options);

      this.client.on('connect', () => {
        this.logger.log('✅ Connected securely to AWS IoT Core');
      });

      this.client.on('error', (err: any) => {
        this.logger.error('❌ AWS IoT MQTT error: ' + (err?.message || err));
      });
    } catch (err: any) {
      this.logger.error('🚨 MQTT init failed: ' + (err?.message || err));
    }
  }

  publish(topic: string, message: any) {
    if (!this.client || !this.client.connected) {
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
