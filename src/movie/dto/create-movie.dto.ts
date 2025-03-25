import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({ message: '영화 이름은 비어있을 수 없습니다.' })
  name: string;

  @IsNotEmpty({ message: '장르는 비어있을 수 없습니다.' })
  @IsIn(['fantasy', 'action'], {
    message: '장르는 action, 혹은 fantasy 여야 합니다.',
  })
  genre: string;

  @IsNotEmpty()
  character: string[];
}
