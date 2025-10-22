// src/iot/iot.test.ts
import { IotMqttService } from './iot.mqtt';

async function testPublish() {
  const mqtt = new IotMqttService();
  mqtt.publish('devices/test-device/toggle', { isOn: true });
  console.log('Message published to AWS IoT!');
}

testPublish();