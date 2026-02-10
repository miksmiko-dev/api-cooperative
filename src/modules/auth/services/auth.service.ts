import { Injectable } from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';

@Injectable()
export class AuthService {
  login(login: AuthLoginDTO) {
    return {
      status: 'success',
    };
  }
}
