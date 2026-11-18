<?php

declare(strict_types=1);

namespace App\Application;

use App\Domain\Entity\Food;
use App\Domain\Entity\Meal;
use App\Domain\Entity\MealFood;
use App\Domain\Entity\Patient;
use App\Domain\Repository\MealFoodRepositoryInterface;
use App\Domain\Repository\MealRepositoryInterface;

final class MealService
{
    public function __construct(
        private readonly MealRepositoryInterface $mealRepository,
        private readonly MealFoodRepositoryInterface $mealFoodRepository,
    ) {}

    public function addFoodToMeal(Meal $meal, Food $food, float $gramsConsumed): MealFood
    {
        $mealFood = new MealFood($meal, $food, $gramsConsumed);
        $this->mealFoodRepository->save($mealFood);

        $this->recalculateTotalCarbs($meal);

        return $mealFood;
    }

    public function removeFoodFromMeal(MealFood $mealFood): void
    {
        $meal = $mealFood->getMeal();
        $this->mealFoodRepository->delete($mealFood);
        $this->recalculateTotalCarbs($meal);
    }

    public function duplicateMeal(Meal $source, Patient $patient, \DateTimeImmutable $eatenAt): Meal
    {
        $duplicate = new Meal($patient, $source->getName(), $eatenAt);
        $duplicate->setPhoto($source->getPhoto());
        $duplicate->setNotes($source->getNotes());

        $this->mealRepository->save($duplicate);

        foreach ($source->getMealFoods() as $sourceMealFood) {
            $mealFood = new MealFood(
                $duplicate,
                $sourceMealFood->getFood(),
                $sourceMealFood->getGramsConsumed()
            );
            $this->mealFoodRepository->save($mealFood);
        }

        $this->recalculateTotalCarbs($duplicate);

        return $duplicate;
    }

    private function recalculateTotalCarbs(Meal $meal): void
    {
        // Reload the meal from DB to get the updated collection
        $total = array_sum(
            $meal->getMealFoods()
                ->map(fn (MealFood $mf) => $mf->getCarbsCalculated())
                ->toArray()
        );

        $meal->setTotalCarbs(round((float) $total, 2));
        $this->mealRepository->save($meal);
    }
}
