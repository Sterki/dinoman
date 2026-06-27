<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Meal;
use App\Domain\Entity\Patient;
use App\Domain\Entity\User;
use Symfony\Component\Uid\Uuid;

interface MealRepositoryInterface
{
    public function findByIdAndUser(Uuid $id, User $user): ?Meal;

    /** @return Meal[] */
    public function findByPatient(Patient $patient): array;

    /** @return Meal[] */
    public function findTodayByPatient(Patient $patient): array;

    /** @return Meal[] */
    public function findByPatientAndDateRange(Patient $patient, \DateTimeImmutable $from, \DateTimeImmutable $to): array;

    /** @return array<string, mixed> Daily stats grouped by date */
    public function getDailyStatsByPatient(Patient $patient, \DateTimeImmutable $from, \DateTimeImmutable $to): array;

    public function save(Meal $meal): void;

    public function delete(Meal $meal): void;
}
