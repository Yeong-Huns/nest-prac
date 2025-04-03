import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty({ message: '영화 이름은 비어있을 수 없습니다.' })
  @IsOptional()
  name?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  genres: string[];

  @ArrayNotEmpty()
  @IsOptional()
  character?: string[];

  @IsNotEmpty({ message: 'detail 내용을 입력해주세요.' })
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsOptional()
  directorId: number;
}
