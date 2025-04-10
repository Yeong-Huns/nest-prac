import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Role } from '../user/type/user.role';
import { envVariables } from '../common/const/env.const';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  parseBasicToken(rawToken: string) {
    const tokenSplit = rawToken.split(' ');
    if (tokenSplit.length !== 2)
      throw new BadRequestException('올바르지않은 토큰 포맷');

    /* 추출한 토큰을 base64 디코딩으로 이메일, 비밀번호 나눔 */
    const [basic, token] = tokenSplit;
    if (basic.toLowerCase() !== 'basic')
      throw new BadRequestException('올바르지않은 토큰 포맷');

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const decodedTokenSplit = decoded.split(':');
    if (decodedTokenSplit.length !== 2)
      throw new BadRequestException('올바르지않은 토큰 포맷');

    /* 이메일, 패스워드 추출 */
    const [email, password] = decodedTokenSplit;

    return { email, password };
  }

  async parseBearerToken(authHeader: string, isRefreshToken: boolean) {
    /* 헤더 형식 검증 */
    const tokenSplit = authHeader.split(' ');
    if (tokenSplit.length !== 2 || tokenSplit[0].toLowerCase() !== 'bearer') {
      throw new BadRequestException('Bearer 토큰 형식이 올바르지 않습니다');
    }

    /* SECRET 선택 */
    const secret = isRefreshToken
      ? this.configService.get<string>(envVariables.refreshTokenSecret)
      : this.configService.get<string>(envVariables.accessTokenSecret);

    try {
      /* 토큰 검증 */
      const token = tokenSplit[1];
      const payload = await this.jwtService.verifyAsync(token, { secret });

      /* 토큰 타입 검증 */
      const expectedType = isRefreshToken ? 'refresh' : 'access';
      if (payload.type !== expectedType) {
        throw new BadRequestException(`${expectedType} 토큰이 필요합니다`);
      }

      return payload;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('만료된 토큰');
      }
      throw new UnauthorizedException('유효하지 않은 토큰');
    }
  }

  async registerUser(rawToken: string) {
    /* rawToken -> Basic $token */
    const { email, password } = this.parseBasicToken(rawToken);
    const isExist = await this.userRepository.existsBy({ email });
    if (isExist)
      throw new BadRequestException('해당 이메일로 가입된 계정이 존재합니다.');

    /* 비밀번호 암호화! */
    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>(envVariables.hashRounds),
    );

    /* DB 저장 */
    await this.userRepository.save({
      email,
      password: hash,
    });

    /* 생성 유저 반환 */
    return await this.userRepository.findOneBy({ email });
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new BadRequestException('잘못된 로그인 정보입니다.');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      throw new BadRequestException('잘못된 비밀번호 입니다.');

    return user;
  }

  async issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(
      envVariables.accessTokenSecret,
    );
    const refreshTokenSecret = this.configService.get<string>(
      envVariables.refreshTokenSecret,
    );
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    /* validation*/
    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }
}
