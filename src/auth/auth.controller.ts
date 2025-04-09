import {
  ClassSerializerInterceptor,
  Controller,
  Get,
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
import { JwtAuthGuard } from './strategy/jwt.strategy';

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
  async loginPassport(@Request() request: LocalStrategyRequest) {
    return {
      refreshToken: await this.authService.issueToken(request.user, true),
      accessToken: await this.authService.issueToken(request.user, false),
    };
  }

  /* validation fail -> 요청을 튕김(Guard) */
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() request) {
    return request.user;
  }
}

interface LocalStrategyRequest extends Request {
  user: User;
}
