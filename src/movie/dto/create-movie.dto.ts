import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional, IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({ message: '영화 이름은 비어있을 수 없습니다.' })
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genres: string[];

  @IsNotEmpty()
  character: string[];

  @IsOptional()
  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  directorId: number;
}
