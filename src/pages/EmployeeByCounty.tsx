import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockEmployees } from "@/data/mockEmployees"; // adjust to your data source

// Pick some chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF4444"];

export const EmployeeByCounty: React.FC = () => {
  // Group employees by county
  const countyCounts: Record<string, number> = {};
  mockEmployees.forEach(emp => {
    const county = emp.county || "Unknown";
    countyCounts[county] = (countyCounts[county] || 0) + 1;
  });

  // Convert to chart data
  const data = Object.entries(countyCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Employees by County</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-gray-500">No employee data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
