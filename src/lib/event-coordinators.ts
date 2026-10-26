export type EventCoordinator = {
  name: string;
  whatsapp: string;
};

export const EVENT_COORDINATORS: Record<string, EventCoordinator[]> = {
  engifusion: [
    { name: "Mr. Rajnish Kumar", whatsapp: "917488382273" },
    { name: "Mr. Abhishek Raj Vats", whatsapp: "917004258416" },
  ],
  "art-and-craft": [
    { name: "Mrs. Shikha Singh", whatsapp: "916201437589" },
    { name: "Mrs. Ekadashi Kumari", whatsapp: "917654158153" },
  ],
  "tug-of-war": [
    { name: "Mr. Kanhaiya Singh Chaudhary", whatsapp: "919123231270" },
    { name: "Mr. Avanish Kumar Singh", whatsapp: "919003757958" },
  ],
  "fashion-fiesta": [
    { name: "Mrs. Shikha Singh", whatsapp: "916201437589" },
    { name: "Miss Garima Kumari", whatsapp: "919304584865" },
    { name: "Dr. Sharif Iqbal", whatsapp: "919897750366" },
  ],
  "dance-competition": [
    { name: "Mrs. Sarita Kumari Ojha (Head)", whatsapp: "918210078889" },
    { name: "Mrs. Gulnaz Parween", whatsapp: "917557076863" },
    { name: "Mr. Animesh Rana", whatsapp: "919123413033" },
    { name: "Mr. Avanish Kumar Singh", whatsapp: "919003757958" },
  ],
  "singing-competition": [
    { name: "Mrs. Sarita Kumari Ojha (Head)", whatsapp: "918210078889" },
    { name: "Mrs. Gulnaz Parween", whatsapp: "917557076863" },
    { name: "Mr. Animesh Rana", whatsapp: "919123413033" },
    { name: "Mr. Avanish Kumar Singh", whatsapp: "919003757958" },
  ],
  "bgmi-cup": [
    { name: "Mr. Ajay Verma", whatsapp: "919113313966" },
    { name: "Mr. Sagar Bauri", whatsapp: "919304833852" },
  ],
  "free-fire-cup": [
    { name: "Mr. Ajay Verma", whatsapp: "919113313966" },
    { name: "Mr. Sagar Bauri", whatsapp: "919304833852" },
  ],
  "road-art": [
    { name: "Mrs. Sarita Kumari Ojha (Head)", whatsapp: "918210078889" },
    { name: "Mr. Manoj Kumar", whatsapp: "918757507987" },
    { name: "Mr. Md. Shafique", whatsapp: "919255991396" },
  ],
  "wall-art": [{ name: "Miss Akriti Kumari", whatsapp: "" }],
  "treasure-hunt": [{ name: "Mr. Ajay Kumar", whatsapp: "919798887166" }],
  "volleyball-league": [{ name: "Mr. Kanhaiya Singh Chaudhary", whatsapp: "919123231270" }],
  "basketball-league": [
    { name: "Mr. Amit Kumar Ojha", whatsapp: "917091193008" },
    { name: "Mr. Amrita Biswas", whatsapp: "918972165984" },
  ],
  "badminton-league": [
    { name: "Miss Indu Kumari", whatsapp: "916205498079" },
    { name: "Mrs. Chaaya Kumari", whatsapp: "919934845094" },
    { name: "Mrs. Chandani Kumari", whatsapp: "919523150603" },
    { name: "Mr. Meraj Alam", whatsapp: "919304786522" },
  ],
  sprint: [
    { name: "Mr. Keshav Kumar Sahay", whatsapp: "919110196624" },
    { name: "Mr. Surendra Kumar", whatsapp: "919661166218" },
    { name: "Mr. Amit Kumar Ojha", whatsapp: "917091193008" },
  ],
  "chess-championship": [
    { name: "Mr. Ajay Kumar", whatsapp: "919798887166" },
    { name: "Mr. Keshav Kumar Sahay", whatsapp: "919110196624" },
    { name: "Mr. Mehfooz Alam", whatsapp: "917091193027" },
  ],
  "rangoli-competition": [
    { name: "Mrs. Sarita Kumari Ojha (Head)", whatsapp: "918210078889" },
    { name: "Miss Aanchal Kumari", whatsapp: "916200713069" },
    { name: "Mrs. Pragaya Singh", whatsapp: "919455211170" },
  ],
};

export function getEventCoordinators(slug: string) {
  return (EVENT_COORDINATORS[slug] ?? []).filter((coordinator) => coordinator.whatsapp);
}
