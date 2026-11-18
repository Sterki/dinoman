<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'meals')]
#[ORM\HasLifecycleCallbacks]
class Meal
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: Patient::class, inversedBy: 'meals')]
    #[ORM\JoinColumn(name: 'patient_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Patient $patient;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $eatenAt;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $photo = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2, options: ['default' => 0])]
    private float $totalCarbs = 0.0;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isFavorite = false;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToMany(targetEntity: MealFood::class, mappedBy: 'meal', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $mealFoods;

    public function __construct(Patient $patient, string $name, \DateTimeImmutable $eatenAt)
    {
        $this->id = Uuid::v7();
        $this->patient = $patient;
        $this->name = $name;
        $this->eatenAt = $eatenAt;
        $this->mealFoods = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function recalculateTotalCarbs(): void
    {
        $this->totalCarbs = array_sum(
            $this->mealFoods->map(fn (MealFood $mf) => $mf->getCarbsCalculated())->toArray()
        );
    }

    public function getId(): Uuid { return $this->id; }
    public function getPatient(): Patient { return $this->patient; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }
    public function getEatenAt(): \DateTimeImmutable { return $this->eatenAt; }
    public function setEatenAt(\DateTimeImmutable $eatenAt): void { $this->eatenAt = $eatenAt; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }
    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $notes): void { $this->notes = $notes; }
    public function getTotalCarbs(): float { return (float) $this->totalCarbs; }
    public function setTotalCarbs(float $totalCarbs): void { $this->totalCarbs = $totalCarbs; }
    public function isFavorite(): bool { return $this->isFavorite; }
    public function setFavorite(bool $isFavorite): void { $this->isFavorite = $isFavorite; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    /** @return Collection<int, MealFood> */
    public function getMealFoods(): Collection { return $this->mealFoods; }

    public function toArray(): array
    {
        return [
            'id'         => (string) $this->id,
            'patientId'  => (string) $this->patient->getId(),
            'name'       => $this->name,
            'eatenAt'    => $this->eatenAt->format(\DateTimeInterface::ATOM),
            'photo'      => $this->photo,
            'notes'      => $this->notes,
            'totalCarbs' => (float) $this->totalCarbs,
            'isFavorite' => $this->isFavorite,
            'foods'      => $this->mealFoods->map(fn (MealFood $mf) => $mf->toArray())->toArray(),
            'createdAt'  => $this->createdAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
