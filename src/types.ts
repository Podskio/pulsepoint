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
  Latitude: string
  Longitude: string
  PulsePointIncidentCallType: string
  CallReceivedDateTime: string
  ClosedDateTime?: string
  FullDisplayAddress: string
  Unit?: APIUnit[]
}

export type UnitStatus =
  | "Dispatched"
  | "Acknowledged"
  | "Enroute"
  | "On Scene"
  | "Available on Scene"
  | "Transport"
  | "Transport Arrived"
  | "Cleared"

export interface Unit {
  id: string
  status: UnitStatus
  clearedTime?: Date
}

export interface Incident {
  id: string
  type: string
  coordinates: [string, string]
  address: string
  receivedTime: Date
  clearedTime?: Date
  units: Unit[]
}

export interface AgencyIncidents {
  active: Incident[]
  recent: Incident[]
}