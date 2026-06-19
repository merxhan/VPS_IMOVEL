import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.phone, body.password);
  }

  @Get('users')
  async getUsers() {
    return this.authService.findAll();
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.authService.update(id, body);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.delete(id);
  }
}
