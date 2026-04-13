import { CAST_BATCHES, GOVERNORS, NAVARASAS, TIMELINE } from "./legacyData.js";

const cloneNavarasas = () =>
  NAVARASAS.map((item) => ({
    id: item.id,
    name: item.name,
    subtitle: item.subtitle,
    glowColor: item.glowColor,
    textColor: item.textColor,
    plays: [...(item.plays || [])],
    icon: item.icon,
  }));

const cloneTimeline = () => TIMELINE.map((item) => ({ ...item }));
const cloneCastBatches = () =>
  CAST_BATCHES.map((item) => ({
    ...item,
    members: [...(item.members || [])],
    photos: [...(item.photos || [])],
  }));
const cloneGovernors = () => GOVERNORS.map((item) => ({ ...item }));

export const createDefaultSiteContent = () => ({
  gallery: {
    images: ["logo", "me", "bikash", "volli", "monish"],
  },
  timeline: cloneTimeline(),
  navarasas: cloneNavarasas(),
  castBatches: cloneCastBatches(),
  governors: cloneGovernors(),
  latestEvent: {
  title: "Evaru Ee Sundari. Annual Production 2026",
  poster: "logo",
  date: "07 April, 2026",
  time: "6:00 PM",
  venue: "Kalidas Auditorium, IIT Kharagpur",
  description: "Witness Prasthanam's latest stage production live.",
},
});
