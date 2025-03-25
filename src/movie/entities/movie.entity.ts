import { UpdateMovieDto } from '../dto/update-movie.dto';

export class Movie {
  id: number;
  name: string;
  genre: string;
  character: string[];

  constructor(data: {
    id: number;
    name: string;
    genre: string;
    character: string[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.genre = data.genre;
    this.character = data.character;
  }

  updateMovie(updateMovieDto: UpdateMovieDto) {
    Object.assign(this, {
      ...this,
      ...updateMovieDto,
    });
  }
}
