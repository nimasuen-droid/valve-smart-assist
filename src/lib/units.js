// Unit conversion and display helpers
// The engine always operates internally in metric (°C, barg, NPS inches)

export const UNIT_SYSTEMS = ["Metric", "Imperial"];

// Temperature
export function displayTemp(celsius, system) {
  if (system === "Imperial") return Math.round((celsius * 9) / 5 + 32);
  return celsius;
}
export function tempToMetric(value, system) {
  if (system === "Imperial") return ((parseFloat(value) - 32) * 5) / 9;
  return parseFloat(value);
}
export function tempUnit(system) {
  return system === "Imperial" ? "°F" : "°C";
}

// Pressure
export function displayPressure(barg, system) {
  if (system === "Imperial") return Math.round(barg * 14.5038 * 10) / 10; // psig
  return barg;
}
export function pressureToMetric(value, system) {
  if (system === "Imperial") return parseFloat(value) / 14.5038;
  return parseFloat(value);
}
export function pressureUnit(system) {
  return system === "Imperial" ? "psig" : "barg";
}

// NPS pipe sizes — always stored/used as NPS strings (industry standard)
// We show DN alongside for metric users
export const NPS_DN_MAP = {
  '1/2"':  "DN15",
  '3/4"':  "DN20",
  '1"':    "DN25",
  '1-1/2"': "DN40",
  '2"':    "DN50",
  '3"':    "DN80",
  '4"':    "DN100",
  '6"':    "DN150",
  '8"':    "DN200",
  '10"':   "DN250",
  '12"':   "DN300",
  '14"':   "DN350",
  '16"':   "DN400",
  '18"':   "DN450",
  '20"':   "DN500",
  '24"':   "DN600",
  '30"':   "DN750",
  '36"':   "DN900",
  '42"':   "DN1050",
  '48"':   "DN1200",
};

export function pipeSizeLabel(nps, system) {
  const dn = NPS_DN_MAP[nps] || "";
  if (system === "Metric" && dn) return `${nps} (${dn})`;
  return nps;
}
