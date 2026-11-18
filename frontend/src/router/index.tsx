import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AddMealPage } from '../pages/AddMealPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FoodLibraryPage } from '../pages/FoodLibraryPage'
import { LoginPage } from '../pages/LoginPage'
import { MealDetailPage } from '../pages/MealDetailPage'
import { MealsPage } from '../pages/MealsPage'
import { PatientDetailPage } from '../pages/PatientDetailPage'
import { PatientsPage } from '../pages/PatientsPage'
import { StatsPage } from '../pages/StatsPage'

function guard(element: JSX.Element) {
  return <ProtectedRoute>{element}</ProtectedRoute>
}

export const router = createBrowserRouter([
  { path: '/login',                                         element: <LoginPage /> },
  { path: '/',                                              element: guard(<DashboardPage />) },
  { path: '/meals',                                         element: guard(<MealsPage />) },
  { path: '/patients',                                      element: guard(<PatientsPage />) },
  { path: '/patients/:patientId',                           element: guard(<PatientDetailPage />) },
  { path: '/patients/:patientId/meals/new',                 element: guard(<AddMealPage />) },
  { path: '/patients/:patientId/meals/:mealId',             element: guard(<MealDetailPage />) },
  { path: '/patients/:patientId/stats',                     element: guard(<StatsPage />) },
  { path: '/foods',                                         element: guard(<FoodLibraryPage />) },
])
