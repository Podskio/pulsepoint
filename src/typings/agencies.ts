export interface APISearchAgencies {
  searchagencies: { Display1: string; id: string }[] | null
}

export interface AgencySearchData {
  agencyKey: string
  name: string
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
  live_radio: [
    {
      URL: string
      Name: string
      Description: string
    },
  ]
  cities_served: [{ City: string; StateProv: string; Country: string }]
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
