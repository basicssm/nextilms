export type film = {
    id: string;
    title: string;
    poster_path: string;
  };

export type filmDetail = film & {
  overview: string
  vote_average: number,
  vote_count: number
}