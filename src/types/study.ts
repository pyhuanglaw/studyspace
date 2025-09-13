export interface StudySession {
  start: string;
  end: string;
  duration: number;
}

export interface DayData {
  morning: StudySession[];
  afternoon: StudySession[];
}

export interface StudySessions {
  [date: string]: DayData;
}

export type Period = 'morning' | 'afternoon';