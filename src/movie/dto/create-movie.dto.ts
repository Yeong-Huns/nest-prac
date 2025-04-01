import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({ message: '영화 이름은 비어있을 수 없습니다.' })
  name: string;

  @IsNotEmpty({ message: '장르는 비어있을 수 없습니다.' })
  genre: string;

  @IsNotEmpty()
  character: string[];

  @IsOptional()
  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  directorId: number;
}
