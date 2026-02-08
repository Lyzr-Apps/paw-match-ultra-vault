'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Home as HomeIcon,
  Heart,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { callAIAgent } from '@/lib/aiAgent'

// TypeScript interfaces based on test responses
interface CompatibilityBreakdownItem {
  score: number
  explanation: string
}

interface CompatibilityBreakdown {
  energy_match: CompatibilityBreakdownItem
  space_match: CompatibilityBreakdownItem
  experience_match: CompatibilityBreakdownItem
  schedule_match: CompatibilityBreakdownItem
  family_match: CompatibilityBreakdownItem
  medical_match: CompatibilityBreakdownItem
}

interface MatchRecommendation {
  animal_id: string
  animal_name: string
  compatibility_score: number
  match_rank: number
  compatibility_breakdown: CompatibilityBreakdown
  strengths: string[]
  considerations: string[]
  recommendation_summary: string
}

interface OverallInsights {
  best_match_explanation: string
  adopter_strengths: string[]
  important_considerations: string[]
  next_steps: string[]
}

interface MatchResult {
  assessment_summary: {
    adopter_profile_summary: string
    animals_evaluated: number
    timestamp: string
  }
  match_recommendations: MatchRecommendation[]
  overall_insights: OverallInsights
}

interface AnimalProfile {
  id: string
  name: string
  species: string
  age: number
  energy: string
  traits: string
  specialNeeds: string
}

interface LifestyleData {
  activityLevel: number
  workSchedule: string
  workHours: string
  availableTime: number
  travelFrequency: string
}

interface EnvironmentData {
  homeType: string
  hasYard: boolean
  spaceSize: number
  otherPets: boolean
  otherPetsDetails: string
  experienceLevel: number
  hasChildren: boolean
  childrenDetails: string
}

const AGENT_IDS = {
  MATCH_COORDINATOR: '6987f79df8f483cee28b9a5e',
  ADOPTER_PROFILE: '6987f74fe5513e27d5435bc6',
  ANIMAL_COMPATIBILITY: '6987f77866ea18a43a069b09'
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [lifestyleData, setLifestyleData] = useState<LifestyleData>({
    activityLevel: 5,
    workSchedule: '',
    workHours: '',
    availableTime: 2,
    travelFrequency: ''
  })
  const [environmentData, setEnvironmentData] = useState<EnvironmentData>({
    homeType: '',
    hasYard: false,
    spaceSize: 0,
    otherPets: false,
    otherPetsDetails: '',
    experienceLevel: 5,
    hasChildren: false,
    childrenDetails: ''
  })
  const [animals, setAnimals] = useState<AnimalProfile[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  const totalSteps = 5
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100

  const activityLabels = ['Sedentary', 'Low', 'Moderate', 'Active', 'Very Active']
  const experienceLabels = ['Beginner', 'Some Experience', 'Intermediate', 'Advanced', 'Expert']

  const getActivityLabel = (value: number) => {
    if (value <= 2) return activityLabels[0]
    if (value <= 4) return activityLabels[1]
    if (value <= 6) return activityLabels[2]
    if (value <= 8) return activityLabels[3]
    return activityLabels[4]
  }

  const getExperienceLabel = (value: number) => {
    if (value <= 2) return experienceLabels[0]
    if (value <= 4) return experienceLabels[1]
    if (value <= 6) return experienceLabels[2]
    if (value <= 8) return experienceLabels[3]
    return experienceLabels[4]
  }

  const handleAddAnimal = (animal: AnimalProfile) => {
    setAnimals([...animals, animal])
    setShowAnimalModal(false)
  }

  const handleRemoveAnimal = (id: string) => {
    setAnimals(animals.filter(a => a.id !== id))
  }

  const handleFindMatch = async () => {
    setLoading(true)

    // Build comprehensive message for Match Coordinator
    const animalDescriptions = animals.map((animal, idx) =>
      `${idx + 1}) ${animal.name} - ${animal.age} year old ${animal.species}, ${animal.energy} energy, ${animal.traits}${animal.specialNeeds ? `, special needs: ${animal.specialNeeds}` : ''}.`
    ).join(' ')

    const message = `I have a ${environmentData.spaceSize} sq ft ${environmentData.homeType}${environmentData.hasYard ? ' with a yard' : ''}. I work ${lifestyleData.workSchedule} (${lifestyleData.workHours}) and have time for ${lifestyleData.availableTime} hours of pet care daily. I'm ${getActivityLabel(lifestyleData.activityLevel).toLowerCase()} and travel ${lifestyleData.travelFrequency}. My experience level is ${getExperienceLabel(environmentData.experienceLevel).toLowerCase()}.${environmentData.otherPets ? ` I have other pets: ${environmentData.otherPetsDetails}.` : ''}${environmentData.hasChildren ? ` Children: ${environmentData.childrenDetails}.` : ' No children.'} I'm looking to match with these rescue animals: ${animalDescriptions}`

    const result = await callAIAgent(message, AGENT_IDS.MATCH_COORDINATOR)

    if (result.success && result.response.status === 'success') {
      setMatchResults(result.response.result as MatchResult)
      setCurrentStep(4)
    }

    setLoading(false)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setLifestyleData({
      activityLevel: 5,
      workSchedule: '',
      workHours: '',
      availableTime: 2,
      travelFrequency: ''
    })
    setEnvironmentData({
      homeType: '',
      hasYard: false,
      spaceSize: 0,
      otherPets: false,
      otherPetsDetails: '',
      experienceLevel: 5,
      hasChildren: false,
      childrenDetails: ''
    })
    setAnimals([])
    setMatchResults(null)
  }

  // Screen 1: Welcome
  const WelcomeScreen = () => (
    <div className="min-h-screen forest-gradient flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full glass-effect border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold">Find Your Perfect Companion</CardTitle>
          <CardDescription className="text-lg">
            Our compatibility-first matching system helps you discover the rescue animal that truly fits your lifestyle, home, and heart.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <p className="text-muted-foreground">
              We analyze your lifestyle, environment, and experience to match you with animals who will thrive in your care, creating lasting bonds built on genuine compatibility.
            </p>
          </div>
          <Button size="lg" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">
            Start Assessment <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Screen 2: Lifestyle Assessment
  const LifestyleAssessment = () => (
    <div className="min-h-screen forest-gradient p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps - 1}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="glass-effect border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Lifestyle Assessment</CardTitle>
            <CardDescription>Tell us about your daily routine and activity level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Activity Level</Label>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Sedentary</span>
                <span>Highly Active</span>
              </div>
              <Slider
                value={[lifestyleData.activityLevel]}
                onValueChange={(value) => setLifestyleData(prev => ({ ...prev, activityLevel: value[0] }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-primary">
                {getActivityLabel(lifestyleData.activityLevel)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Schedule</Label>
                <Select value={lifestyleData.workSchedule} onValueChange={(value) => setLifestyleData(prev => ({ ...prev, workSchedule: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote/Work from home</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="office">In-office</SelectItem>
                    <SelectItem value="varied">Varied schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Typical Work Hours</Label>
                <Select value={lifestyleData.workHours} onValueChange={(value) => setLifestyleData(prev => ({ ...prev, workHours: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="part-time">Part-time (4-6 hrs)</SelectItem>
                    <SelectItem value="standard">Standard (8 hrs)</SelectItem>
                    <SelectItem value="extended">Extended (10+ hrs)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Time for Pet Care (hours per day)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[lifestyleData.availableTime]}
                  onValueChange={(value) => setLifestyleData(prev => ({ ...prev, availableTime: value[0] }))}
                  min={1}
                  max={8}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-lg font-semibold min-w-[3rem] text-center">{lifestyleData.availableTime}h</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Travel Frequency</Label>
              <Select value={lifestyleData.travelFrequency} onValueChange={(value) => setLifestyleData(prev => ({ ...prev, travelFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How often do you travel?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarely">Rarely (0-1 times/year)</SelectItem>
                  <SelectItem value="occasionally">Occasionally (2-4 times/year)</SelectItem>
                  <SelectItem value="frequently">Frequently (5-8 times/year)</SelectItem>
                  <SelectItem value="very-frequently">Very frequently (9+ times/year)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(2)} className="flex-1">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Screen 3: Environment & Experience
  const EnvironmentAssessment = () => (
    <div className="min-h-screen forest-gradient p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps - 1}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="glass-effect border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Environment & Experience</CardTitle>
            <CardDescription>Share details about your home and pet experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Home Type</Label>
                <Select value={environmentData.homeType} onValueChange={(value) => setEnvironmentData(prev => ({ ...prev, homeType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Space Size (sq ft)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1200"
                  value={environmentData.spaceSize || ''}
                  onChange={(e) => setEnvironmentData(prev => ({ ...prev, spaceSize: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Outdoor Access</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={environmentData.hasYard ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, hasYard: true }))}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" /> Has Yard
                </Button>
                <Button
                  type="button"
                  variant={!environmentData.hasYard ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, hasYard: false }))}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" /> No Yard
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Other Pets</Label>
              <div className="flex gap-3 mb-2">
                <Button
                  type="button"
                  variant={environmentData.otherPets ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, otherPets: true }))}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" /> Yes
                </Button>
                <Button
                  type="button"
                  variant={!environmentData.otherPets ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, otherPets: false }))}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" /> No
                </Button>
              </div>
              {environmentData.otherPets && (
                <Input
                  placeholder="Describe your other pets (type, age, temperament)"
                  value={environmentData.otherPetsDetails}
                  onChange={(e) => setEnvironmentData(prev => ({ ...prev, otherPetsDetails: e.target.value }))}
                />
              )}
            </div>

            <div className="space-y-3">
              <Label>Pet Care Experience Level</Label>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
              <Slider
                value={[environmentData.experienceLevel]}
                onValueChange={(value) => setEnvironmentData(prev => ({ ...prev, experienceLevel: value[0] }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm font-medium text-primary">
                {getExperienceLabel(environmentData.experienceLevel)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Children in Household</Label>
              <div className="flex gap-3 mb-2">
                <Button
                  type="button"
                  variant={environmentData.hasChildren ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, hasChildren: true }))}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" /> Yes
                </Button>
                <Button
                  type="button"
                  variant={!environmentData.hasChildren ? 'default' : 'outline'}
                  onClick={() => setEnvironmentData(prev => ({ ...prev, hasChildren: false }))}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" /> No
                </Button>
              </div>
              {environmentData.hasChildren && (
                <Input
                  placeholder="Ages and number of children"
                  value={environmentData.childrenDetails}
                  onChange={(e) => setEnvironmentData(prev => ({ ...prev, childrenDetails: e.target.value }))}
                />
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Screen 4: Animal Profiles Input
  const AnimalProfilesInput = () => {
    const [newAnimal, setNewAnimal] = useState<AnimalProfile>({
      id: '',
      name: '',
      species: '',
      age: 0,
      energy: '',
      traits: '',
      specialNeeds: ''
    })

    return (
      <div className="min-h-screen forest-gradient p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps - 1}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Card className="glass-effect border-2 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Animal Profiles</CardTitle>
              <CardDescription>Add the animals you&apos;re considering for adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAnimalModal(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Animal Profile
              </Button>
            </CardContent>
          </Card>

          {animals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {animals.map((animal) => (
                <Card key={animal.id} className="glass-effect border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{animal.name}</CardTitle>
                        <CardDescription>{animal.age} year old {animal.species}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAnimal(animal.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{animal.energy} Energy</Badge>
                      {animal.specialNeeds && <Badge variant="outline">Special Needs</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{animal.traits}</p>
                    {animal.specialNeeds && (
                      <p className="text-sm text-muted-foreground italic">Special needs: {animal.specialNeeds}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleFindMatch}
              disabled={animals.length === 0 || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Matches...
                </>
              ) : (
                <>Find My Match <Heart className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Animal Modal */}
          {showAnimalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Add Animal Profile</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowAnimalModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., Max"
                        value={newAnimal.name}
                        onChange={(e) => setNewAnimal(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Species</Label>
                      <Select value={newAnimal.species} onValueChange={(value) => setNewAnimal(prev => ({ ...prev, species: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dog">Dog</SelectItem>
                          <SelectItem value="Cat">Cat</SelectItem>
                          <SelectItem value="Rabbit">Rabbit</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age (years)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 3"
                        value={newAnimal.age || ''}
                        onChange={(e) => setNewAnimal(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Energy Level</Label>
                      <Select value={newAnimal.energy} onValueChange={(value) => setNewAnimal(prev => ({ ...prev, energy: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select energy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Very High">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Traits & Behaviors</Label>
                    <Input
                      placeholder="e.g., friendly with people, needs daily exercise, knows basic commands"
                      value={newAnimal.traits}
                      onChange={(e) => setNewAnimal(prev => ({ ...prev, traits: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Special Needs (optional)</Label>
                    <Input
                      placeholder="e.g., medication for arthritis, requires special diet"
                      value={newAnimal.specialNeeds}
                      onChange={(e) => setNewAnimal(prev => ({ ...prev, specialNeeds: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (newAnimal.name && newAnimal.species && newAnimal.age && newAnimal.energy && newAnimal.traits) {
                        handleAddAnimal({
                          ...newAnimal,
                          id: `${newAnimal.name}_${Date.now()}`
                        })
                        setNewAnimal({
                          id: '',
                          name: '',
                          species: '',
                          age: 0,
                          energy: '',
                          traits: '',
                          specialNeeds: ''
                        })
                      }
                    }}
                    className="w-full"
                  >
                    Add Animal
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Screen 5: Match Results
  const MatchResults = () => {
    if (!matchResults) return null

    const sortedMatches = [...matchResults.match_recommendations].sort((a, b) => b.compatibility_score - a.compatibility_score)

    return (
      <div className="min-h-screen forest-gradient p-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="glass-effect border-2 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">Your Match Results</CardTitle>
                  <CardDescription className="text-base">
                    {matchResults.assessment_summary.animals_evaluated} animals evaluated based on your profile
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleRestart}>
                  Restart Assessment
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Overall Insights */}
          <Card className="glass-effect border-2 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Overall Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Best Match Explanation</h4>
                <p className="text-muted-foreground">{matchResults.overall_insights.best_match_explanation}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Strengths as an Adopter</h4>
                <ul className="list-disc list-inside space-y-1">
                  {matchResults.overall_insights.adopter_strengths.map((strength, idx) => (
                    <li key={idx} className="text-muted-foreground">{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Next Steps</h4>
                <ul className="list-disc list-inside space-y-1">
                  {matchResults.overall_insights.next_steps.map((step, idx) => (
                    <li key={idx} className="text-muted-foreground">{step}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Match Cards */}
          <div className="space-y-4">
            {sortedMatches.map((match) => (
              <Card key={match.animal_id} className="glass-effect border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{match.animal_name}</CardTitle>
                        <Badge variant={match.match_rank === 1 ? 'default' : 'secondary'}>
                          Rank #{match.match_rank}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {match.recommendation_summary}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - match.compatibility_score / 100)}`}
                            className="text-primary transition-all"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{match.compatibility_score}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">Compatibility</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Top 3 Factors */}
                  <div>
                    <h4 className="font-semibold mb-3">Top Compatibility Factors</h4>
                    <div className="space-y-2">
                      {Object.entries(match.compatibility_breakdown)
                        .sort(([, a], [, b]) => b.score - a.score)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{key.replace('_', ' ')}</span>
                              <span className="font-semibold">{value.score}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${value.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Strengths and Considerations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" /> Strengths
                      </h4>
                      <ul className="space-y-1">
                        {match.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {match.considerations.map((consideration, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            <span>{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setExpandedMatch(expandedMatch === match.animal_id ? null : match.animal_id)}
                      className="w-full"
                    >
                      {expandedMatch === match.animal_id ? (
                        <>
                          Hide Full Breakdown <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Show Full Breakdown <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {expandedMatch === match.animal_id && (
                      <div className="mt-4 space-y-3">
                        {Object.entries(match.compatibility_breakdown).map(([key, value]) => (
                          <div key={key} className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-semibold capitalize">{key.replace('_', ' ')}</h5>
                              <Badge variant="outline">{value.score}%</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{value.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen />
      case 1:
        return <LifestyleAssessment />
      case 2:
        return <EnvironmentAssessment />
      case 3:
        return <AnimalProfilesInput />
      case 4:
        return <MatchResults />
      default:
        return <WelcomeScreen />
    }
  }

  return renderStep()
}
