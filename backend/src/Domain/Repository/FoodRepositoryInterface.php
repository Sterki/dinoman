<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Food;
use App\Domain\Entity\User;
use Symfony\Component\Uid\Uuid;

interface FoodRepositoryInterface
{
    public function findByIdAndUser(Uuid $id, User $user): ?Food;

    /** @return Food[] */
    public function findByUser(User $user): array;

    /** @return Food[] */
    public function searchByUser(string $query, User $user): array;

    public function save(Food $food): void;

    public function delete(Food $food): void;
}
