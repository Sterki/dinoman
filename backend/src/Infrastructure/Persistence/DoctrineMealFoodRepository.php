<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\MealFood;
use App\Domain\Repository\MealFoodRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

final class DoctrineMealFoodRepository implements MealFoodRepositoryInterface
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    public function findById(Uuid $id): ?MealFood
    {
        return $this->em->find(MealFood::class, $id);
    }

    public function save(MealFood $mealFood): void
    {
        $this->em->persist($mealFood);
        $this->em->flush();
    }

    public function delete(MealFood $mealFood): void
    {
        $this->em->remove($mealFood);
        $this->em->flush();
    }
}
