<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\MealFood;
use Symfony\Component\Uid\Uuid;

interface MealFoodRepositoryInterface
{
    public function findById(Uuid $id): ?MealFood;

    public function save(MealFood $mealFood): void;

    public function delete(MealFood $mealFood): void;
}
