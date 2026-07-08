import { LocationType } from '@prisma/client';

export interface Location {
  id: number;
  title: string;
  type: LocationType;
  priceValue: number;
  isFree: boolean;
  shortContext: string;
  loreContext: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
}

import { LocationTag } from '@prisma/client';

export interface PointGeometry {
  lng: number; // долгота (longitude)
  lat: number; // широта (latitude)
}

// Правильные типы для всего остального
export interface LocationInterface {
  id: number;
  title: string;
  type: LocationType;
  priceValue: number;
  isFree: boolean;
  tags: LocationTag[];
  shortContext: string;
  loreContext: string;
  embedding?: number[] | null;
  lat: number;
  lng: number;
  routes?: any[];
  createdAt: Date;
  updatedAt: Date;
}

// только для работы с $queryRaw!!!
export interface RawLocationRow {
   id: number;
  title: string;
  type: LocationType;
  priceValue: number;
  isFree: boolean;
  tags: string[]| string | LocationTag[];
  shortContext: string;
  loreContext: string;
  embedding?: number[] | null;
  lat: number;
  lng: number;
  routes?: any[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Интерфейс для сырого ответа pgvector + PostGIS из базы данных
 */
export interface RawLocationQueryResult {
  id: number;
  title: string;
  type: LocationType;
  priceValue: number;
  isFree: boolean;
  shortContext: string;
  loreContext: string;
  tags: string | string[] | LocationTag[];
  lat: number;  
  lng: number; 
  distance: number;
  createdAt: Date | string;        
  updatedAt: Date | string;         
}
