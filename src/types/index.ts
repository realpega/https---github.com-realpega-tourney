export interface Tournament {
  id: number;
  game: string;
  players: number;
  prize: number;
  entryFee: number;
  date: string;
  time: string;
  map: string;
}

export interface UserData {
  uid: string;
  email: string;
  name: string;
  wallet: number;
  points: number;
}