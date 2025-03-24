import { UpdateMovieDto } from '../dto/update-movie.dto';

export class Movie {
  id: number;
  name: string;
  character: string[];

  constructor(data: { id: number; name: string; character: string[] }) {
    this.id = data.id;
    this.name = data.name;
    this.character = data.character;
  }

  updateMovie(updateMovieDto: UpdateMovieDto) {
    Object.assign(this, {
      ...this,
      ...updateMovieDto,
    });
  }
}
