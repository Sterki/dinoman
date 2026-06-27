<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'meal_foods')]
class MealFood
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: Meal::class, inversedBy: 'mealFoods')]
    #[ORM\JoinColumn(name: 'meal_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Meal $meal;

    #[ORM\ManyToOne(targetEntity: Food::class)]
    #[ORM\JoinColumn(name: 'food_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private Food $food;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private float $gramsConsumed;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private float $carbsCalculated;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct(Meal $meal, Food $food, float $gramsConsumed)
    {
        $this->id = Uuid::v7();
        $this->meal = $meal;
        $this->food = $food;
        $this->gramsConsumed = $gramsConsumed;
        $this->carbsCalculated = ($food->getCarbsPer100g() / 100) * $gramsConsumed;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): Uuid { return $this->id; }
    public function getMeal(): Meal { return $this->meal; }
    public function getFood(): Food { return $this->food; }
    public function getGramsConsumed(): float { return (float) $this->gramsConsumed; }
    public function getCarbsCalculated(): float { return (float) $this->carbsCalculated; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function updateGrams(float $gramsConsumed): void
    {
        $this->gramsConsumed = $gramsConsumed;
        $this->carbsCalculated = ($this->food->getCarbsPer100g() / 100) * $gramsConsumed;
    }

    public function toArray(): array
    {
        return [
            'id'              => (string) $this->id,
            'mealId'          => (string) $this->meal->getId(),
            'food'            => $this->food->toArray(),
            'gramsConsumed'   => (float) $this->gramsConsumed,
            'carbsCalculated' => (float) $this->carbsCalculated,
            'createdAt'       => $this->createdAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
