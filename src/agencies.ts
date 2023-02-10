import axios from "axios"
import { decodeJson } from "./crypto"
import type {
  Agency,
  AgencySearchData,
  APIAgency,
  APISearchAgencies,
} from "./typings"

const coordsLookupEndpoint = "https://web.pulsepoint.org/DB/gabc.php"
const agencyDataEndpoint = "https://web.pulsepoint.org/DB/GeolocationAgency.php?id="

/**
 * Fetches the "key" and name for all agencies covering the given coordinates. `agencyKey` can be passed to `getAgencyData` to retrieve detailed information.
 * @param coordinates Array of two numbers representing a set of coordinates.
 */
export const getAgencyByLatLng = async (
  coordinates: [number, number],
): Promise<AgencySearchData[]> => {
  const response = await axios.get(coordsLookupEndpoint, {
    params: {
      lat: coordinates[0],
      lng: coordinates[1],
    },
  })

  if (response.status !== 200) throw new Error("Failed to fetch agency data")

  const agencies = decodeJson(response.data) as APISearchAgencies

  if (!agencies.searchagencies) return []

  return agencies.searchagencies.map((agency) => ({
    agencyKey: agency.id,
    name: agency.Display1,
  }))
}

type AgencySocial = keyof Agency["social"]

const socialLinks: Record<AgencySocial, string> = {
  twitter: "https://twitter.com/",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/channel/",
  linkedin: "https://www.linkedin.com/company/",
}

const convertSocials = (agency: APIAgency) => {
  const socials: Record<AgencySocial, string | undefined> = {
    twitter: agency.twittername,
    facebook: agency.facebookname,
    instagram: agency.instagramname,
    youtube: agency.youtubeURL,
    linkedin: agency.linkedinname,
  }

  // Create full url if the social exists
  for (const [social, path] of Object.entries(socials)) {
    if (path)
      socials[social as AgencySocial] = socialLinks[social as AgencySocial] + path
  }

  return socials
}

const convertAgency = (agency: APIAgency): Agency => ({
  agencyId: agency.agencyid,
  agencyKey: agency.id,
  name: agency.agencyname,
  shortName: agency.short_agencyname,
  initials: agency.agency_initials,
  description: agency.agency_description,
  email: agency.public_email,
  website: agency.agency_website,
  type: agency.agencytype,
  city: agency.city,
  state: agency.state,
  country: agency.country,
  coordinates: [Number(agency.agency_latitude), Number(agency.agency_longitude)],
  timezone: agency.timezone,
  psap: agency.psap, // Public Safety Answering Point
  social: convertSocials(agency),
  serviceArea: {
    boundary: agency.boundary,
    centroid: agency.boundary_centroid,
  },
  radioFeeds: agency.live_radio
    ? agency.live_radio.map((feed) => ({
        url: feed.URL,
        name: feed.Name,
        description: feed.Description,
      }))
    : [],
  citiesServed: agency.cities_served.map((city) => ({
    city: city.City,
    state: city.StateProv,
    country: city.Country,
  })),
})

/**
 * Fetches detailed information about an agency.
 * @param agencyKey Obtained from `getAgencyFromLatLng`.
 */
export const getAgencyData = async (agencyKey: string): Promise<Agency> => {
  const response = await axios.get(agencyDataEndpoint + agencyKey)

  if (response.status !== 200) throw new Error("Failed to fetch agency details")

  const agency = response.data

  return convertAgency(agency)
}
