import React, { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockPositions } from "@/data/mockData"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Type for position form
type PositionFormData = {
  title: string
  department: string
  priority: "high" | "medium" | "low"
  status: "open" | "filled" | "closed"
  description: string
}

export const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState("positions")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPositions = mockPositions.filter(
    (position) =>
      position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openPositions = mockPositions.filter((pos) => pos.status === "open")
  const totalApplicants = mockPositions.reduce(
    (sum, pos) => sum + pos.applicants,
    0
  )

  // Mock interview data
  const interviews = [
    {
      id: "1",
      candidate: "Alice Johnson",
      position: "Senior Software Engineer",
      date: "2024-03-25",
      time: "10:00 AM",
      interviewer: "John Smith",
      status: "scheduled",
    },
    {
      id: "2",
      candidate: "Bob Wilson",
      position: "HR Assistant",
      date: "2024-03-25",
      time: "2:00 PM",
      interviewer: "Sarah Johnson",
      status: "completed",
    },
    {
      id: "3",
      candidate: "Carol Davis",
      position: "Marketing Manager",
      date: "2024-03-26",
      time: "11:00 AM",
      interviewer: "Emily Chen",
      status: "scheduled",
    },
  ]

  const candidates = [
    {
      id: "1",
      name: "Alice Johnson",
      position: "Senior Software Engineer",
      appliedDate: "2024-03-15",
      stage: "technical_interview",
      score: 85,
      experience: "5 years",
      education: "MS Computer Science",
    },
    {
      id: "2",
      name: "Bob Wilson",
      position: "HR Assistant",
      appliedDate: "2024-03-18",
      stage: "hr_review",
      score: 78,
      experience: "2 years",
      education: "BA Human Resources",
    },
    {
      id: "3",
      name: "Carol Davis",
      position: "Marketing Manager",
      appliedDate: "2024-03-20",
      stage: "final_interview",
      score: 92,
      experience: "7 years",
      education: "MBA Marketing",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recruitment & Positions</h1>
          <p className="text-muted-foreground">
            Manage job openings, candidates, and recruitment processes
          </p>
        </div>

        {/* New Position Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Position
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Position</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data: PositionFormData = {
                  title: (form.elements.namedItem("title") as HTMLInputElement)
                    .value,
                  department: (
                    form.elements.namedItem("department") as HTMLInputElement
                  ).value,
                  priority: "medium", // static for now
                  status: "open", // static for now
                  description: (
                    form.elements.namedItem("description") as HTMLTextAreaElement
                  ).value,
                }
                console.log("New Position:", data)
                alert(`New Position Added: ${data.title}`)
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input name="title" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                <Input name="department" placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  placeholder="Enter job description..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                Save Position
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Open Positions
                </p>
                <p className="text-2xl font-bold">{openPositions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applicants
                </p>
                <p className="text-2xl font-bold">{totalApplicants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Interviews This Week
                </p>
                <p className="text-2xl font-bold">
                  {interviews.filter((int) => int.status === "scheduled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Positions to Fill
                </p>
                <p className="text-2xl font-bold">
                  {mockPositions.filter((pos) => pos.status === "filled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 gap-2">
          <TabsTrigger
            value="positions"
            className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
          >
            Open Positions
          </TabsTrigger>
          <TabsTrigger
            value="candidates"
            className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
          >
            Candidates
          </TabsTrigger>
          <TabsTrigger
            value="interviews"
            className="bg-yellow-200 text-yellow-900 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
          >
            Interviews
          </TabsTrigger>
          <TabsTrigger
            value="pipeline"
            className="bg-purple-200 text-purple-900 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
          >
            Pipeline
          </TabsTrigger>
        </TabsList>

        {/* Open Positions */}
        <TabsContent value="positions">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search positions by title or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredPositions.map((position) => (
                <Card
                  key={position.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">
                            {position.title}
                          </h3>
                          <Badge
                            variant={
                              position.status === "open"
                                ? "default"
                                : position.status === "filled"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {position.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              position.priority === "high"
                                ? "border-destructive text-destructive"
                                : position.priority === "medium"
                                ? "border-warning text-warning"
                                : "border-muted-foreground"
                            }
                          >
                            {position.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {position.department}
                        </p>
                        <p className="text-sm mb-4">{position.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Applicants
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {position.applicants}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Posted Date
                            </p>
                            <p>
                              {new Date(position.postedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Closing Date
                            </p>
                            <p>
                              {new Date(position.closingDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Days Remaining
                            </p>
                            <p className="font-bold">
                              {Math.max(
                                0,
                                Math.ceil(
                                  (new Date(position.closingDate).getTime() -
                                    new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Candidates */}
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.position}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.experience} experience •{" "}
                          {candidate.education}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {candidate.stage.replace("_", " ")}
                        </Badge>
                        <span className="text-sm font-medium">
                          {candidate.score}%
                        </span>
                      </div>
                      <Progress value={candidate.score} className="w-24" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied{" "}
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interviews */}
        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Interview Schedule</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-warning/10 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-medium">{interview.candidate}</h4>
                        <p className="text-sm text-muted-foreground">
                          {interview.position}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Interviewer: {interview.interviewer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            interview.status === "scheduled"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {interview.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(interview.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              "Application Review",
              "Phone Screening",
              "Technical Interview",
              "Final Interview",
            ].map((stage, index) => (
              <Card key={stage}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidates
                      .filter((_, candidateIndex) => candidateIndex % 4 === index)
                      .map((candidate) => (
                        <div
                          key={candidate.id}
                          className="p-3 bg-muted/30 rounded-lg"
                        >
                          <p className="font-medium text-sm">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.position}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <Progress
                              value={candidate.score}
                              className="flex-1 mr-2"
                            />
                            <span className="text-xs">
                              {candidate.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
