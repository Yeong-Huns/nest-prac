import { ArrayNotEmpty, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty({ message: '영화 이름은 비어있을 수 없습니다.' })
  @IsOptional()
  name?: string;

  @IsNotEmpty({ message: '장르는 비어있을 수 없습니다.' })
  @IsIn(['fantasy', 'action'], {
    message: '장르는 action, 혹은 fantasy 여야 합니다.',
  })
  @IsOptional()
  genre?: string;

  @ArrayNotEmpty()
  @IsOptional()
  character?: string[];
}
