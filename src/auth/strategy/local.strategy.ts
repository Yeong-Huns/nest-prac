import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

/* class 명으로 Guard 를 적용하도록 export */
export class LocalAuthGuard extends AuthGuard('로컬') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, '로컬') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /*
   * LocalStrategy
   * validate : email, password
   * return : Request()
   * */
  async validate(email: string, password: string) {
    return await this.authService.authenticate(email, password);
  }
}
