import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) return value; /* MovieTitle 검색이 아닌 경우 */
    if (value.length <= 2) {
      throw new BadRequestException(`영화의 제목은 3글자 이상이여야 합니다. `);
    }
    return value;
  }
}
