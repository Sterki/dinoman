export interface Patient {
  id: string
  name: string
  birthDate: string | null
  age: number | null
  photo: string | null
  dailyCarbGoal: number | null
  createdAt: string
  updatedAt: string
}

export interface Food {
  id: string
  name: string
  carbsPer100g: number
  photo: string | null
  createdAt: string
  updatedAt: string
}

export interface MealFood {
  id: string
  mealId: string
  food: Food
  gramsConsumed: number
  carbsCalculated: number
  createdAt: string
}

export interface Meal {
  id: string
  patientId: string
  name: string
  eatenAt: string
  photo: string | null
  notes: string | null
  totalCarbs: number
  isFavorite: boolean
  foods: MealFood[]
  createdAt: string
}

export interface TodaySummary {
  totalCarbs: number
  mealCount: number
  lastMeal: Meal | null
  dailyCarbGoal: number | null
}

export interface DailyDataPoint {
  date: string
  totalCarbs: number
  mealCount: number
}

export interface Stats {
  period: '7d' | '30d'
  avgCarbs: number
  maxDay: DailyDataPoint | null
  minDay: DailyDataPoint | null
  dailyData: DailyDataPoint[]
}

export interface ApiError {
  error: string
}

// For real-time carbs preview before saving
export interface CarbsPreview {
  carbsPer100g: number
  gramsConsumed: number
  carbsCalculated: number
}
