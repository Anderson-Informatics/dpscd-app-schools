export type School = {
  _id: string;
  SchoolID: number;
  SchoolName: string;
  Lat: number;
  Lng: number;
  Type: string;
  ShortName: string;
  Capacity: { [key: string]: number };
  stage?: string;
  action?: string;
};

export type SchoolGrade = {
  _id?: string;
  SchoolID: number;
  School: string;
  Grade: string;
  SeatsFilled: number;
  OnWaitingList: number;
  Capacity: number;
  SeatsAvailable: number;
  stage?: string;
  action?: string;
};

export type Count = {
  _id: {
    SchoolID: number;
    School: string;
    Grade: string;
  };
  SeatsFilled: number;
  OnWaitingList: number;
};
