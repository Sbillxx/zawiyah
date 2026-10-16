export interface BoroughData {
  borough: string;
  hives: number;
  sites: number;
  description: string;
}

export interface RooftopSite {
  id: string;
  name: string;
  borough: string;
  buildingType: string;
  hives: number;
  wildflowerAreaSqM: number;
  honeyHarvestKg: number;
  jarsDonated: number;
  rainwaterL: number;
  x: number; // percentage coordinate 0-100 on map viewBox
  y: number; // percentage coordinate 0-100 on map viewBox
  isKeyStory?: boolean;
  storyNote?: string;
  addressSnippet?: string;
}

export interface SectorImpact {
  buildingType: string;
  sites: number;
  hives: number;
  wildflowerArea: number; // sq m
  honeyHarvestKg: number; // kg
  jarsDonated: number;
  corporateSponsorship: number; // GBP
  primaryRole: string;
}

export interface StrategicGoal {
  title: string;
  pillar: string;
  metric: string;
  description: string;
  targetDate: string;
}

export interface NarrativeStory {
  title: string;
  location: string;
  borough: string;
  heroStat: string;
  statLabel: string;
  body: string;
  quote?: string;
  quoteAuthor?: string;
}
