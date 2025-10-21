import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'ok', message: 'Ochiga backend is alive' };
  }
}