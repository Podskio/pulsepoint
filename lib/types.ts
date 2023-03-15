import type { CALL_TYPES, UNIT_STATUS } from "./constants"

export interface APIData {
  ct: string
  iv: string
  s: string
}

export interface APIUnit {
  UnitID: string
  PulsePointDispatchStatus: string
  UnitClearedDateTime?: string
}

export interface APIIncident {
  ID: string
  AgencyID: string
  Latitude: string
  Longitude: string
  PulsePointIncidentCallType: string
  CallReceivedDateTime: string
  ClosedDateTime?: string
  FullDisplayAddress: string
  Unit?: APIUnit[]
}

export interface APISearchAgencies {
  searchagencies: { Display1: string; id: string }[] | null
}

interface APILiveRadio {
  URL: string
  Name: string
  Description: string
}

interface APICityServed {
  City: string
  StateProv: string
  Country: string
}

export interface APIAgency {
  id: string
  agencyid: string
  agencyname: string
  short_agencyname: string
  agency_initials: string
  agency_description: string
  agencytype: string
  city: string
  state: string
  country: string
  agency_latitude: string
  agency_longitude: string
  timezone: string
  psap: string
  twittername?: string
  facebookname?: string
  instagramname?: string
  youtubeURL?: string
  linkedinname?: string
  public_email?: string
  agency_website?: string
  boundary: string
  boundary_centroid: string
  live_radio: APILiveRadio[]
  cities_served: APICityServed[]
}

export type UnitStatus = (typeof UNIT_STATUS)[keyof typeof UNIT_STATUS]

export interface ActiveUnit {
  id: string
  status: UnitStatus
}

export interface RecentUnit extends ActiveUnit {
  clearedTime?: Date
}

export interface IncidentImages {
  active: string
  recent: string
}

export type CallType = (typeof CALL_TYPES)[keyof typeof CALL_TYPES]

export interface ActiveIncident {
  id: string
  agencyId: string
  type: CallType
  coordinates: [number, number]
  address: string
  receivedTime: Date
  units: ActiveUnit[]
  images: IncidentImages
}

export interface RecentIncident extends ActiveIncident {
  clearedTime: Date
  units: RecentUnit[]
}

export interface AgencyIncidents {
  active: ActiveIncident[]
  recent: RecentIncident[]
}

export interface AgencySearchData {
  agencyKey: string
  name: string
}

interface RadioFeed {
  url: string
  name: string
  description: string
}

interface CityServed {
  city: string
  state: string
  country: string
}

export interface Agency {
  agencyId: string
  agencyKey: string
  name: string
  shortName: string
  initials: string
  description: string
  email?: string
  website?: string
  type: string
  city: string
  state: string
  country: string
  coordinates: [number, number]
  timezone: string
  psap: string
  social: {
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  serviceArea: {
    boundary: string
    centroid: string
  }
  radioFeeds: RadioFeed[]
  citiesServed: CityServed[]
}
