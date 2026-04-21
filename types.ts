export type film = {
  id: string;
  title: string;
  poster_path: string;
  vote_average?: number;
};

export type filmDetail = film & {
  overview: string;
  vote_average: number;
  vote_count: number;
  backdrop_path?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  release_date?: string;
};
