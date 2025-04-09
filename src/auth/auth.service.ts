import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
    const [, token] = tokenSplit;
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const decodedTokenSplit = decoded.split(':');
    if (decodedTokenSplit.length !== 2)
      throw new BadRequestException('올바르지않은 토큰 포맷');

    /* 이메일, 패스워드 추출 */
    const [email, password] = decodedTokenSplit;

    return { email, password };
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
      this.configService.get<number>('HASH_ROUNDS'),
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

  async issueToken(user: User, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'user',
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
