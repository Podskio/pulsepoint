import type {
  APIData,
  APIIncident,
  APIUnit,
  AgencyIncidents,
  Incident,
  Unit,
  UnitStatus,
} from "./types"

import callTypes from "./callTypes"
import { decodeJson } from "./crypto"

const endpoint = "https://web.pulsepoint.org/DB/giba.php?agency_id="

const getIncidentsEncoded = async (agencyId: string): Promise<APIData> => {
  const response = await fetch(endpoint + agencyId)

  if (!response.ok) throw new Error("Failed to fetch incidents")

  return await response.json()
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

const convertIncident = (incident: APIIncident): Incident => ({
  id: incident.ID,
  type: getIncidentType(incident.PulsePointIncidentCallType),
  coordinates: [incident.Latitude, incident.Longitude],
  address: incident.FullDisplayAddress,
  receivedTime: new Date(incident.CallReceivedDateTime),
  clearedTime: incident.ClosedDateTime
    ? new Date(incident.ClosedDateTime)
    : undefined,
  units: convertUnits(incident.Unit || []),
})

/**
 * Fetches active and recent incidents for a given agency.
 * @param agencyId String representing the agency id, can be obtained from [PulsePoint Web](https://web.pulsepoint.org) using developer tools.
 */
export const getIncidents = async (
  agencyId: string,
): Promise<AgencyIncidents> => {
  const rawData = await getIncidentsEncoded(agencyId)
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
