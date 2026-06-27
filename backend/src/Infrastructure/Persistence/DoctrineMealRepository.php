<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Meal;
use App\Domain\Entity\Patient;
use App\Domain\Entity\User;
use App\Domain\Repository\MealRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

final class DoctrineMealRepository implements MealRepositoryInterface
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    public function findByIdAndUser(Uuid $id, User $user): ?Meal
    {
        return $this->em->createQueryBuilder()
            ->select('m')
            ->from(Meal::class, 'm')
            ->join('m.patient', 'p')
            ->where('m.id = :id')
            ->andWhere('p.user = :user')
            ->setParameter('id', $id, 'uuid')
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByPatient(Patient $patient): array
    {
        return $this->em->createQueryBuilder()
            ->select('m')
            ->from(Meal::class, 'm')
            ->where('m.patient = :patient')
            ->setParameter('patient', $patient)
            ->orderBy('m.eatenAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findTodayByPatient(Patient $patient): array
    {
        $start = new \DateTimeImmutable('today midnight');
        $end   = new \DateTimeImmutable('tomorrow midnight');

        return $this->findByPatientAndDateRange($patient, $start, $end);
    }

    public function findByPatientAndDateRange(Patient $patient, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->em->createQueryBuilder()
            ->select('m')
            ->from(Meal::class, 'm')
            ->where('m.patient = :patient')
            ->andWhere('m.eatenAt >= :from')
            ->andWhere('m.eatenAt < :to')
            ->setParameter('patient', $patient)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('m.eatenAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getDailyStatsByPatient(Patient $patient, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->em->createQueryBuilder()
            ->select(
                "DATE_TRUNC('day', m.eatenAt) AS day",
                'SUM(m.totalCarbs) AS totalCarbs',
                'COUNT(m.id) AS mealCount'
            )
            ->from(Meal::class, 'm')
            ->where('m.patient = :patient')
            ->andWhere('m.eatenAt >= :from')
            ->andWhere('m.eatenAt < :to')
            ->setParameter('patient', $patient)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('day')
            ->orderBy('day', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function save(Meal $meal): void
    {
        $this->em->persist($meal);
        $this->em->flush();
    }

    public function delete(Meal $meal): void
    {
        $this->em->remove($meal);
        $this->em->flush();
    }
}
