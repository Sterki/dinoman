<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\Patient;
use App\Domain\Entity\User;
use Symfony\Component\Uid\Uuid;

interface PatientRepositoryInterface
{
    public function findByIdAndUser(Uuid $id, User $user): ?Patient;

    /** @return Patient[] */
    public function findByUser(User $user): array;

    public function save(Patient $patient): void;

    public function delete(Patient $patient): void;
}
