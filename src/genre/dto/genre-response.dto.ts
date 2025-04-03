import { Genre } from '../entities/genre.entity';

export class GenreResponse {
  name: string;

  private constructor(genre: Genre) {
    this.name = genre.name;
  }

  static fromGenre(genre: Genre) {
    return new GenreResponse(genre);
  }
}
