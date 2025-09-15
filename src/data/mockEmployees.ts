// --- Types ---
export interface Skill {
  name: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
}

export interface Employee {
  id: number
  name: string
  county: string
  skills: Skill[]
}

// --- Mock Data ---
export const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Alice Mwangi",
    county: "Nairobi",
    skills: [
      { name: "React", level: "Advanced" },
      { name: "Node.js", level: "Intermediate" },
    ],
  },
  {
    id: 2,
    name: "John Otieno",
    county: "Kisumu",
    skills: [
      { name: "HR Management", level: "Expert" },
      { name: "Communication", level: "Advanced" },
    ],
  },
  {
    id: 3,
    name: "Grace Kamau",
    county: "Nairobi",
    skills: [
      { name: "Data Analysis", level: "Advanced" },
      { name: "SQL", level: "Intermediate" },
    ],
  },
  {
    id: 4,
    name: "Peter Njoroge",
    county: "Mombasa",
    skills: [
      { name: "Marketing Strategy", level: "Expert" },
      { name: "SEO", level: "Intermediate" },
    ],
  },
  {
    id: 5,
    name: "Sarah Wambui",
    county: "Kiambu",
    skills: [
      { name: "Recruitment", level: "Advanced" },
      { name: "Interviewing", level: "Advanced" },
    ],
  },
  {
    id: 6,
    name: "Kevin Kiptoo",
    county: "Uasin Gishu",
    skills: [
      { name: "Software Engineering", level: "Intermediate" },
      { name: "Python", level: "Advanced" },
    ],
  },
  {
    id: 7,
    name: "Esther Nduta",
    county: "Nakuru",
    skills: [
      { name: "UI/UX Design", level: "Advanced" },
      { name: "Figma", level: "Intermediate" },
    ],
  },
  {
    id: 8,
    name: "Michael Ochieng",
    county: "Kisumu",
    skills: [
      { name: "Operations Management", level: "Advanced" },
      { name: "Logistics", level: "Intermediate" },
    ],
  },
]
