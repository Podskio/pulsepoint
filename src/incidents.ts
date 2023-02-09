import axios from "axios"
import callTypes from "./callTypes"
import { decodeJson } from "./crypto"
import type {
  AgencyIncidents,
  APIData,
  APIIncident,
  APIUnit,
  Incident,
  IncidentImages,
  Unit,
  UnitStatus,
} from "./typings"

const endpoint = "https://web.pulsepoint.org/DB/giba.php?agency_id="

const getIncidentsEncoded = async (
  agencyIds: string | string[],
): Promise<APIData> => {
  const agencies = Array.isArray(agencyIds) ? agencyIds.join(",") : agencyIds
  const response = await axios.get(endpoint + agencies)

  if (response.status !== 200) throw new Error("Failed to fetch incidents")

  return response.data
}

const unitStatuses = new Map<string, UnitStatus>([
  ["DP", "Dispatched"],
  ["AK", "Acknowledged"],
  ["ER", "Enroute"],
  ["OS", "On Scene"],
  ["AE", "Available on Scene"],
  ["TR", "Transport"],
  ["TA", "Transport Arrived"],
])

const getUnitStatus = (shortStatus: string): UnitStatus => {
  return unitStatuses.get(shortStatus) || "Cleared"
}

const convertUnits = (units: APIUnit[]): Unit[] =>
  units.map((unit) => ({
    id: unit.UnitID,
    status: getUnitStatus(unit.PulsePointDispatchStatus),
    clearedTime: unit.UnitClearedDateTime
      ? new Date(unit.UnitClearedDateTime)
      : undefined,
  }))

const getIncidentType = (shortType: string) => {
  return callTypes.get(shortType) || "Unknown"
}

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
  return Array.from(callTypes.values())
}
