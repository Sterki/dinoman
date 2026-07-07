<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Food;
use App\Domain\Entity\User;
use App\Domain\Repository\FoodRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

final class DoctrineFoodRepository implements FoodRepositoryInterface
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    public function findByIdAndUser(Uuid $id, User $user): ?Food
    {
        return $this->em->getRepository(Food::class)->findOneBy([
            'id'   => $id,
            'user' => $user,
        ]);
    }

    public function findByUser(User $user): array
    {
        return $this->em->getRepository(Food::class)->findBy(
            ['user' => $user],
            ['name' => 'ASC']
        );
    }

    public function searchByUser(string $query, User $user): array
    {
        return $this->em->createQueryBuilder()
            ->select('f')
            ->from(Food::class, 'f')
            ->where('f.user = :user')
            ->andWhere('LOWER(f.name) LIKE LOWER(:query)')
            ->setParameter('user', $user)
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('f.name', 'ASC')
            ->setMaxResults(20)
            ->getQuery()
            ->getResult();
    }

    public function save(Food $food): void
    {
        $this->em->persist($food);
        $this->em->flush();
    }

    public function delete(Food $food): void
    {
        $this->em->remove($food);
        $this->em->flush();
    }
}
