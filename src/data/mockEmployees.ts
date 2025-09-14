export interface Employee {
  id: number;
  name: string;
  designation: string;
  county: string;
}

export const mockEmployees: Employee[] = [
  { id: 1, name: "Alice Mwangi", designation: "Software Engineer", county: "Nairobi" },
  { id: 2, name: "John Otieno", designation: "HR Manager", county: "Kisumu" },
  { id: 3, name: "Grace Kamau", designation: "Data Analyst", county: "Nairobi" },
  { id: 4, name: "Peter Njoroge", designation: "Marketing Lead", county: "Mombasa" },
  { id: 5, name: "Sarah Wambui", designation: "Recruiter", county: "Kiambu" },
  { id: 6, name: "Kevin Kiptoo", designation: "Software Engineer", county: "Uasin Gishu" },
  { id: 7, name: "Esther Nduta", designation: "Designer", county: "Nakuru" },
  { id: 8, name: "Michael Ochieng", designation: "Operations Officer", county: "Kisumu" },
];
