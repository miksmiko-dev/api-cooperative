import { Controller, Post, Body } from '@nestjs/common';
import { Public } from 'src/common/guards/public.decorator';
import { AuthService } from '../services/auth.service';
import { AuthLoginDTO } from '../dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(public readonly authService: AuthService) {}
  @Public()
  @Post('login')
  login(@Body() login: AuthLoginDTO) {
    return this.authService.login(login);
  }

  @Public()
  @Post('register')
  registr() {
    return;
  }
}
