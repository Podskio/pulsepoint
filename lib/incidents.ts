import axios from "axios"
import { CALL_TYPES, ENDPOINTS, UNIT_STATUS } from "./constants"
import { decodeJson } from "./crypto"
import type {
  AgencyIncidents,
  APIData,
  APIIncident,
  APIUnit,
  Incident,
  IncidentImages,
  Unit,
} from "./types"

const getIncidentsEncoded = async (
  agencyIds: string | string[],
): Promise<APIData> => {
  const agencies = Array.isArray(agencyIds) ? agencyIds.join(",") : agencyIds
  const response = await axios.get(ENDPOINTS.incidents + agencies)

  if (response.status !== 200) throw new Error("Failed to fetch incidents")

  return response.data
}

const getUnitStatus = (shortStatus: string) =>
  UNIT_STATUS[shortStatus as keyof typeof UNIT_STATUS] || "Unknown"

const convertUnits = (units: APIUnit[]): Unit[] =>
  units.map((unit) => ({
    id: unit.UnitID,
    status: getUnitStatus(unit.PulsePointDispatchStatus),
    clearedTime: unit.UnitClearedDateTime
      ? new Date(unit.UnitClearedDateTime)
      : undefined,
  }))

const getIncidentType = (shortType: string) =>
  CALL_TYPES[shortType as keyof typeof CALL_TYPES] || "Unknown"

const getIncidentImages = (type: string): IncidentImages => ({
  active: `https://web.pulsepoint.org/assets/images/msa/${type.toLowerCase()}_map_active.png`,
  recent: `https://web.pulsepoint.org/assets/images/msr/${type.toLowerCase()}_map_recent.png`,
})

const convertIncident = (incident: APIIncident): Incident => ({
  id: incident.ID,
  agencyId: incident.AgencyID,
  type: getIncidentType(incident.PulsePointIncidentCallType),
  coordinates: [Number(incident.Latitude), Number(incident.Longitude)],
  address: incident.FullDisplayAddress,
  receivedTime: new Date(incident.CallReceivedDateTime),
  clearedTime: incident.ClosedDateTime
    ? new Date(incident.ClosedDateTime)
    : undefined,
  units: convertUnits(incident.Unit || []),
  images: getIncidentImages(incident.PulsePointIncidentCallType),
})

/**
 * Fetches active and recent incidents for a given agency.
 * @param agencyIds String(s) representing the agency id(s), can be obtained from [PulsePoint Web](https://web.pulsepoint.org) using developer tools.
 */
export const getIncidents = async (
  agencyIds: string | string[],
): Promise<AgencyIncidents> => {
  const rawData = await getIncidentsEncoded(agencyIds)
  const { incidents: rawIncidents } = decodeJson(rawData)

  // Ensure an array is returned if the API returns null
  return {
    active: rawIncidents.active?.map(convertIncident) ?? [],
    recent: rawIncidents.recent?.map(convertIncident) ?? [],
  }
}

/**
 * Returns an array of incident types used by PulsePoint.
 */
export const getIncidentTypes = () => {
  return Object.values(CALL_TYPES)
}
