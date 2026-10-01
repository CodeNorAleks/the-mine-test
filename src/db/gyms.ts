import type { GymHours } from './types';

export interface Gym { id: string; chain: 'SATS' | 'EVO' | 'Fresh Fitness'; name: string; address: string; postcode: string; city: string; hours: GymHours[]; note?: string; url: string }

/** Gym register — SATS, EVO and Fresh Fitness in Oslo + nearest Bærum/Lørenskog/Follo. Hours as published 2026-10-01 (EVO and Fresh: 05–24 every day). */
export const GYMS: Gym[] = [
{
"chain": "SATS",
"name": "Adamstuen",
"address": "Kirkeveien 159",
"postcode": "0451",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "20:00"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/adamstuen",
"id": "sats-adamstuen"
},
{
"chain": "SATS",
"name": "Akersgata",
"address": "Akersgata 51",
"postcode": "0180",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "20:00"
},
{
"days": "Sat–Sun",
"open": "09:00",
"close": "18:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/akersgata",
"id": "sats-akersgata"
},
{
"chain": "SATS",
"name": "Bislett",
"address": "Bislettgata 6",
"postcode": "0170",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "23:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "07:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/bislett",
"id": "sats-bislett"
},
{
"chain": "SATS",
"name": "Bjørvika",
"address": "Dronning Eufemias gate 18",
"postcode": "0191",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/bjorvika",
"id": "sats-bjorvika"
},
{
"chain": "SATS",
"name": "Carl Berner",
"address": "Trondheimsveien 135",
"postcode": "0570",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "09:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/carl-berner",
"id": "sats-carl-berner"
},
{
"chain": "SATS",
"name": "CC Vest",
"address": "Lilleakerveien 14",
"postcode": "0283",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:15",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:15",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:30",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/cc-vest",
"id": "sats-cc-vest"
},
{
"chain": "SATS",
"name": "Colosseum",
"address": "Middelthunsgate 19",
"postcode": "0368",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "05:45",
"close": "22:30"
},
{
"days": "Fri",
"open": "05:45",
"close": "21:00"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/colosseum",
"id": "sats-colosseum"
},
{
"chain": "SATS",
"name": "Fagerborg",
"address": "Pilestredet 75 C",
"postcode": "0354",
"city": "Oslo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "23:59"
}
],
"note": "Extended access; staffed Mon–Thu 07–22:30, Fri 07–21, Sat 09–20, Sun 10–21",
"url": "https://www.sats.no/treningssenter/oslo/fagerborg",
"id": "sats-fagerborg"
},
{
"chain": "SATS",
"name": "Hasle",
"address": "Grenseveien 50",
"postcode": "0579",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/hasle",
"id": "sats-hasle"
},
{
"chain": "SATS",
"name": "Hellerud",
"address": "Tvetenveien 168-170",
"postcode": "0671",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/hellerud",
"id": "sats-hellerud"
},
{
"chain": "SATS",
"name": "Hoff",
"address": "Hoffsveien 10",
"postcode": "0278",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "19:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/hoff",
"id": "sats-hoff"
},
{
"chain": "SATS",
"name": "Ila",
"address": "Waldemar Thranes gate 86",
"postcode": "0175",
"city": "Oslo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "23:59"
}
],
"note": "Extended access; staffed Mon–Thu 06–22, Fri 06–21, Sat 08–19, Sun 08–20",
"url": "https://www.sats.no/treningssenter/oslo/ila",
"id": "sats-ila"
},
{
"chain": "SATS",
"name": "Kalbakken",
"address": "Kalbakkveien 6",
"postcode": "0953",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:15",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:15",
"close": "20:00"
},
{
"days": "Sat",
"open": "08:45",
"close": "19:00"
},
{
"days": "Sun",
"open": "08:45",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/kalbakken",
"id": "sats-kalbakken"
},
{
"chain": "SATS",
"name": "Kampen",
"address": "Østerdalsgata 1",
"postcode": "0658",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/kampen",
"id": "sats-kampen"
},
{
"chain": "SATS",
"name": "Karlsrud",
"address": "Cecilie Thoresens vei 3",
"postcode": "1153",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "20:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/karlsrud",
"id": "sats-karlsrud"
},
{
"chain": "SATS",
"name": "Lambertseter",
"address": "Langbølgen 5, Bygg C",
"postcode": "1153",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "20:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/lambertseter",
"id": "sats-lambertseter"
},
{
"chain": "SATS",
"name": "Linderud",
"address": "Erich Mogensøns vei 38",
"postcode": "0517",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "09:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/linderud",
"id": "sats-linderud"
},
{
"chain": "SATS",
"name": "Nationaltheatret",
"address": "Ruseløkkveien 6",
"postcode": "0251",
"city": "Oslo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "23:59"
}
],
"note": "Extended access; staffed Mon–Fri 06–21:30, Sat–Sun 14–20",
"url": "https://www.sats.no/treningssenter/oslo/nationaltheatret",
"id": "sats-nationaltheatret"
},
{
"chain": "SATS",
"name": "Njårdhallen",
"address": "Sørkedalsveien 106",
"postcode": "0378",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:15",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:15",
"close": "20:00"
},
{
"days": "Sat",
"open": "08:30",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/njardhallen",
"id": "sats-njardhallen"
},
{
"chain": "SATS",
"name": "Nydalen",
"address": "Sandakerveien 109-111",
"postcode": "0484",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "09:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/nydalen",
"id": "sats-nydalen"
},
{
"chain": "SATS",
"name": "Ringnes Park",
"address": "Sannergata 6b",
"postcode": "0557",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/ringnes-park",
"id": "sats-ringnes-park"
},
{
"chain": "SATS",
"name": "Ryen",
"address": "Ryensvingen 5",
"postcode": "0680",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/ryen",
"id": "sats-ryen"
},
{
"chain": "SATS",
"name": "Røa",
"address": "Tore Hals Mejdells vei 18",
"postcode": "0751",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/roa",
"id": "sats-roa"
},
{
"chain": "SATS",
"name": "Sagene",
"address": "Pontoppidans gate 7",
"postcode": "0462",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "09:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/sagene",
"id": "sats-sagene"
},
{
"chain": "SATS",
"name": "Schous Plass",
"address": "Trondheimsveien 2 D",
"postcode": "0560",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "05:45",
"close": "23:00"
},
{
"days": "Fri",
"open": "05:45",
"close": "21:30"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "21:30"
}
],
"url": "https://www.sats.no/treningssenter/oslo/schous-plass",
"id": "sats-schous-plass"
},
{
"chain": "SATS",
"name": "Sjølyst",
"address": "Karenslyst allé 7",
"postcode": "0278",
"city": "Oslo",
"hours": [
{
"days": "Mon–Fri",
"open": "06:00",
"close": "22:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "08:30",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/sjolyst",
"id": "sats-sjolyst"
},
{
"chain": "SATS",
"name": "Solli Plass",
"address": "Henrik Ibsens gate 100",
"postcode": "0254",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "23:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "08:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/solli-plass",
"id": "sats-solli-plass"
},
{
"chain": "SATS",
"name": "Storo",
"address": "Vitaminveien 7-9",
"postcode": "0485",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "23:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "22:00"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "19:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/storo",
"id": "sats-storo"
},
{
"chain": "SATS",
"name": "Ullevaal Stadion",
"address": "Sognsveien 75 E-F",
"postcode": "0855",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/ullevaal-stadion",
"id": "sats-ullevaal-stadion"
},
{
"chain": "SATS",
"name": "Vinderen",
"address": "Slemdalsveien 70",
"postcode": "0373",
"city": "Oslo",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "20:00"
},
{
"days": "Sat",
"open": "08:30",
"close": "18:00"
},
{
"days": "Sun",
"open": "08:30",
"close": "19:00"
}
],
"url": "https://www.sats.no/treningssenter/oslo/vinderen",
"id": "sats-vinderen"
},
{
"chain": "SATS",
"name": "Metro",
"address": "Kulturhusgata 2",
"postcode": "1473",
"city": "Lørenskog",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:30"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "21:00"
}
],
"url": "https://www.sats.no/treningssenter/metro",
"id": "sats-metro"
},
{
"chain": "SATS",
"name": "Triaden",
"address": "Gamleveien 88",
"postcode": "1461",
"city": "Lørenskog",
"hours": [
{
"days": "Mon–Thu",
"open": "06:15",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:15",
"close": "21:30"
},
{
"days": "Sat",
"open": "09:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/triaden",
"id": "sats-triaden"
},
{
"chain": "SATS",
"name": "Bekkestua",
"address": "Gamle Ringeriksvei 34c",
"postcode": "1357",
"city": "Bekkestua",
"hours": [
{
"days": "Mon–Thu",
"open": "06:15",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:15",
"close": "20:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/bekkestua",
"id": "sats-bekkestua"
},
{
"chain": "SATS",
"name": "Bekkestua Stasjon",
"address": "Bærumsveien 206",
"postcode": "1357",
"city": "Bekkestua",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "23:30"
}
],
"note": "Extended access, limited staffed hours",
"url": "https://www.sats.no/treningssenter/bekkestua-stasjon",
"id": "sats-bekkestua-stasjon"
},
{
"chain": "SATS",
"name": "Fornebu",
"address": "Forneburingen 209",
"postcode": "1364",
"city": "Fornebu",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "20:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "18:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/fornebu",
"id": "sats-fornebu"
},
{
"chain": "SATS",
"name": "Sandvika Panorama",
"address": "Sandviksveien 176",
"postcode": "1338",
"city": "Sandvika",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "19:00"
},
{
"days": "Sun",
"open": "09:00",
"close": "19:00"
}
],
"url": "https://www.sats.no/treningssenter/sandvika-panorama",
"id": "sats-sandvika-panorama"
},
{
"chain": "SATS",
"name": "Kolbotn",
"address": "Kolbotnveien 12",
"postcode": "1410",
"city": "Kolbotn",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:00"
},
{
"days": "Fri",
"open": "06:00",
"close": "20:00"
},
{
"days": "Sat–Sun",
"open": "08:00",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/kolbotn",
"id": "sats-kolbotn"
},
{
"chain": "SATS",
"name": "Lillestrøm",
"address": "Dampsagveien 12",
"postcode": "2000",
"city": "Lillestrøm",
"hours": [
{
"days": "Mon–Thu",
"open": "06:00",
"close": "22:30"
},
{
"days": "Fri",
"open": "06:00",
"close": "21:00"
},
{
"days": "Sat",
"open": "08:00",
"close": "20:00"
},
{
"days": "Sun",
"open": "08:30",
"close": "20:00"
}
],
"url": "https://www.sats.no/treningssenter/lillestrom",
"id": "sats-lillestrom"
},
{
"chain": "EVO",
"name": "Adamstuen",
"address": "Ullevålsveien 68",
"postcode": "0454",
"city": "Oslo",
"url": "https://evofitness.no/senter/adamstuen/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-adamstuen"
},
{
"chain": "EVO",
"name": "Årvoll",
"address": "Årvollveien 23",
"postcode": "0590",
"city": "Oslo",
"url": "https://evofitness.no/senter/arvoll/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-arvoll"
},
{
"chain": "EVO",
"name": "Bjølsen",
"address": "Moldegata 7",
"postcode": "0445",
"city": "Oslo",
"url": "https://evofitness.no/senter/bjolsen/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-bjolsen"
},
{
"chain": "EVO",
"name": "Bøler",
"address": "Utmarkveien 1",
"postcode": "0689",
"city": "Oslo",
"url": "https://evofitness.no/senter/boler/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-boler"
},
{
"chain": "EVO",
"name": "Bryn",
"address": "Østensjøveien 79",
"postcode": "0667",
"city": "Oslo",
"url": "https://evofitness.no/senter/bryn/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-bryn"
},
{
"chain": "EVO",
"name": "Frysja",
"address": "Frysjaveien 42",
"postcode": "0884",
"city": "Oslo",
"url": "https://evofitness.no/senter/frysja/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-frysja"
},
{
"chain": "EVO",
"name": "Grorud",
"address": "Rosenbergveien 15",
"postcode": "0963",
"city": "Oslo",
"url": "https://evofitness.no/senter/grorud/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-grorud"
},
{
"chain": "EVO",
"name": "Grünerløkka",
"address": "Thorvald Meyers gate 72",
"postcode": "0552",
"city": "Oslo",
"url": "https://evofitness.no/senter/grunerlokka/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-grunerlokka"
},
{
"chain": "EVO",
"name": "Holmlia",
"address": "Holmlia Senter vei 18",
"postcode": "1255",
"city": "Oslo",
"url": "https://evofitness.no/senter/holmlia/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-holmlia"
},
{
"chain": "EVO",
"name": "Ila",
"address": "Vøyensvingen 7",
"postcode": "0458",
"city": "Oslo",
"url": "https://evofitness.no/senter/ila/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-ila"
},
{
"chain": "EVO",
"name": "Lambertseter",
"address": "Cecilie Thoresens vei 17",
"postcode": "1153",
"city": "Oslo",
"url": "https://evofitness.no/senter/lambertseter/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-lambertseter"
},
{
"chain": "EVO",
"name": "Løren",
"address": "Lørenveien 37",
"postcode": "0585",
"city": "Oslo",
"url": "https://evofitness.no/senter/loren/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-loren"
},
{
"chain": "EVO",
"name": "Majorstua",
"address": "Sørkedalsveien 9",
"postcode": "0369",
"city": "Oslo",
"url": "https://evofitness.no/senter/majorstua/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-majorstua"
},
{
"chain": "EVO",
"name": "Nordberg",
"address": "Langmyrgrenda 1",
"postcode": "0861",
"city": "Oslo",
"url": "https://evofitness.no/senter/nordberg/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-nordberg"
},
{
"chain": "EVO",
"name": "Nordstrand",
"address": "Ekebergveien 233",
"postcode": "1162",
"city": "Oslo",
"url": "https://evofitness.no/senter/nordstrand/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-nordstrand"
},
{
"chain": "EVO",
"name": "Nydalen",
"address": "Nydalsveien",
"postcode": "",
"city": "Oslo",
"url": "https://evofitness.no/senter/nydalen/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-nydalen"
},
{
"chain": "EVO",
"name": "Oscarsgate",
"address": "Oscars gate 20",
"postcode": "0352",
"city": "Oslo",
"url": "https://evofitness.no/senter/oscarsgate/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-oscarsgate"
},
{
"chain": "EVO",
"name": "Røa",
"address": "Vækerøveien 207",
"postcode": "0751",
"city": "Oslo",
"url": "https://evofitness.no/senter/roa/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-roa"
},
{
"chain": "EVO",
"name": "Ryen",
"address": "Ryensvingen 3",
"postcode": "0680",
"city": "Oslo",
"url": "https://evofitness.no/senter/evo-ryen/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-ryen"
},
{
"chain": "EVO",
"name": "Sjølyst",
"address": "Karenslyst allé 12-14",
"postcode": "0278",
"city": "Oslo",
"url": "https://evofitness.no/senter/sjolyst/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-sjolyst"
},
{
"chain": "EVO",
"name": "Teisen",
"address": "Ole Deviks vei 6",
"postcode": "0666",
"city": "Oslo",
"url": "https://evofitness.no/senter/evo-teisen/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-teisen"
},
{
"chain": "EVO",
"name": "Vålerenga",
"address": "Østerdalsgata 7",
"postcode": "0658",
"city": "Oslo",
"url": "https://evofitness.no/senter/valerenga/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-valerenga"
},
{
"chain": "EVO",
"name": "Vika",
"address": "Munkedamsveien 20",
"postcode": "0250",
"city": "Oslo",
"url": "https://evofitness.no/senter/vika/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-vika"
},
{
"chain": "EVO",
"name": "Vollebekk",
"address": "Brobekkveien 53",
"postcode": "0598",
"city": "Oslo",
"url": "https://evofitness.no/senter/vollebekk/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-vollebekk"
},
{
"chain": "EVO",
"name": "Sandvika",
"address": "Leif Tronstads plass 7",
"postcode": "1337",
"city": "Sandvika",
"url": "https://evofitness.no/senter/sandvika/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-sandvika"
},
{
"chain": "EVO",
"name": "Stabekk",
"address": "Gamle Drammensvei 46a",
"postcode": "1369",
"city": "Stabekk",
"url": "https://evofitness.no/senter/stabekk/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-stabekk"
},
{
"chain": "EVO",
"name": "Østerås",
"address": "Grini Næringspark 1",
"postcode": "1361",
"city": "Østerås",
"url": "https://evofitness.no/senter/osteras/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-osteras"
},
{
"chain": "EVO",
"name": "SNØ Lørenskog",
"address": "Snøfonna 1",
"postcode": "1470",
"city": "Lørenskog",
"url": "https://evofitness.no/senter/sno/",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "evo-sno-lorenskog"
},
{
"chain": "Fresh Fitness",
"name": "Blindern",
"address": "Vestgrensa 2",
"postcode": "0851",
"city": "Oslo",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-blindern",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-blindern"
},
{
"chain": "Fresh Fitness",
"name": "Carl Berner",
"address": "Dælenenggata 4",
"postcode": "0567",
"city": "Oslo",
"note": "Staffed Mon–Thu 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-carl-berner",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-carl-berner"
},
{
"chain": "Fresh Fitness",
"name": "Ensjø",
"address": "Gladengveien 1",
"postcode": "0661",
"city": "Oslo",
"note": "Staffed Mon–Thu 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-ensjo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-ensjo"
},
{
"chain": "Fresh Fitness",
"name": "Grønland",
"address": "Grønlandsleiret 25",
"postcode": "0190",
"city": "Oslo",
"note": "Staffed Mon–Wed 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-gronland",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-gronland"
},
{
"chain": "Fresh Fitness",
"name": "Haugerud",
"address": "Haugerud Senter 1-7",
"postcode": "0673",
"city": "Oslo",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-haugerud",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-haugerud"
},
{
"chain": "Fresh Fitness",
"name": "Hauketo",
"address": "Hauketoveien 8",
"postcode": "1266",
"city": "Oslo",
"note": "Staffed Mon–Tue 17–21",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-hauketo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-hauketo"
},
{
"chain": "Fresh Fitness",
"name": "Kalbakken",
"address": "Trondheimsveien 391",
"postcode": "0953",
"city": "Oslo",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-kalbakken",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-kalbakken"
},
{
"chain": "Fresh Fitness",
"name": "Lindeberg",
"address": "Jerikoveien 28",
"postcode": "1067",
"city": "Oslo",
"note": "Staffed Mon–Tue 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-lindeberg",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-lindeberg"
},
{
"chain": "Fresh Fitness",
"name": "Majorstuen",
"address": "Bogstadveien 9",
"postcode": "0355",
"city": "Oslo",
"note": "Staffed Mon–Wed 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-majorstuen",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-majorstuen"
},
{
"chain": "Fresh Fitness",
"name": "Manglerud",
"address": "Plogveien 6",
"postcode": "0612",
"city": "Oslo",
"note": "Staffed Mon–Wed 16–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-manglerud",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-manglerud"
},
{
"chain": "Fresh Fitness",
"name": "Romsås",
"address": "Romsås Senter 1",
"postcode": "0970",
"city": "Oslo",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-romsas",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-romsas"
},
{
"chain": "Fresh Fitness",
"name": "Sandaker",
"address": "Sandakerveien 59",
"postcode": "0477",
"city": "Oslo",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-sandaker",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-sandaker"
},
{
"chain": "Fresh Fitness",
"name": "Sinsen",
"address": "Trondheimsveien 137",
"postcode": "0570",
"city": "Oslo",
"note": "Temporarily 1st floor only",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-sinsen",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-sinsen"
},
{
"chain": "Fresh Fitness",
"name": "St. Hanshaugen",
"address": "Waldemar Thranes gate 25",
"postcode": "0171",
"city": "Oslo",
"note": "Staffed Mon–Wed 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-st-hanshaugen",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-st-hanshaugen"
},
{
"chain": "Fresh Fitness",
"name": "Storo",
"address": "Sandakerveien 78",
"postcode": "0484",
"city": "Oslo",
"note": "Staffed Mon–Thu 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-storo",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-storo"
},
{
"chain": "Fresh Fitness",
"name": "Ulven",
"address": "Ulvenveien 82",
"postcode": "0581",
"city": "Oslo",
"note": "Opens 20 Oct 2026",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-ulven",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-ulven"
},
{
"chain": "Fresh Fitness",
"name": "Sandvika",
"address": "Industriveien 33",
"postcode": "1337",
"city": "Sandvika",
"note": "Staffed Tue 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-sandvika",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-sandvika"
},
{
"chain": "Fresh Fitness",
"name": "Østerås",
"address": "Otto Ruges vei 80",
"postcode": "1361",
"city": "Østerås",
"note": "Staffed Mon–Tue 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-osteras",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-osteras"
},
{
"chain": "Fresh Fitness",
"name": "Skårer",
"address": "Skårersletta 60",
"postcode": "1473",
"city": "Lørenskog",
"note": "Staffed Mon & Thu 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-skarer",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-skarer"
},
{
"chain": "Fresh Fitness",
"name": "Ski",
"address": "Kjeppestadveien 2",
"postcode": "1400",
"city": "Ski",
"note": "Staffed Mon 17–20",
"url": "https://www.freshfitness.no/treningssenter/treningssenter-ski",
"hours": [
{
"days": "Mon–Sun",
"open": "05:00",
"close": "24:00"
}
],
"id": "fresh-ski"
}
];

export const GYM = new Map(GYMS.map((g) => [g.id, g]));
