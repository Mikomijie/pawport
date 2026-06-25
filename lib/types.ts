export interface CatProfile {
  id: string;
  name: string;
  breed: string | null;
  color: string | null;
  age: number | null;
  photoUrl: string | null;
  microchipId: string | null;
  isLost: boolean;
  lostAt: string | null;
  createdAt: string;
  owner: {
    name: string;
    email: string;
    phone: string | null;
  };
  vaccinations: Vaccination[];
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue: string | null;
  vetName: string | null;
}

export interface Sighting {
  id: string;
  catId: string;
  latitude: number;
  longitude: number;
  message: string | null;
  createdAt: string;
}
