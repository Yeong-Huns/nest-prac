import {
  ClassSerializerInterceptor,
  Controller,
  Headers,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { LocalAuthGuard } from './strategy/local.strategy';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    /* authorization: Basic $token */
    return this.authService.registerUser(token);
  }

  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    /* authorization: Basic $token */
    return this.authService.login(token);
  }

  /* Passport test */
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  loginPassport(@Request() request: PassportStrategyRequest) {
    return request.user;
  }
}

interface PassportStrategyRequest extends Request {
  user: User;
}
