<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Patient;
use App\Domain\Entity\User;
use App\Domain\Repository\PatientRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

final class DoctrinePatientRepository implements PatientRepositoryInterface
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    public function findByIdAndUser(Uuid $id, User $user): ?Patient
    {
        return $this->em->getRepository(Patient::class)->findOneBy([
            'id'   => $id,
            'user' => $user,
        ]);
    }

    public function findByUser(User $user): array
    {
        return $this->em->getRepository(Patient::class)->findBy(
            ['user' => $user],
            ['name' => 'ASC']
        );
    }

    public function save(Patient $patient): void
    {
        $this->em->persist($patient);
        $this->em->flush();
    }

    public function delete(Patient $patient): void
    {
        $this->em->remove($patient);
        $this->em->flush();
    }
}
