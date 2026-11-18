<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'patients')]
#[ORM\HasLifecycleCallbacks]
class Patient
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true, onDelete: 'CASCADE')]
    private ?User $user;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $birthDate = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $photo = null;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2, nullable: true)]
    private ?float $dailyCarbGoal = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    #[ORM\OneToMany(targetEntity: Meal::class, mappedBy: 'patient', cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['eatenAt' => 'DESC'])]
    private Collection $meals;

    public function __construct(string $name, ?User $user = null)
    {
        $this->id = Uuid::v7();
        $this->name = $name;
        $this->user = $user;
        $this->meals = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): Uuid { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }
    public function getBirthDate(): ?\DateTimeImmutable { return $this->birthDate; }
    public function setBirthDate(?\DateTimeImmutable $birthDate): void { $this->birthDate = $birthDate; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }
    public function getDailyCarbGoal(): ?float { return $this->dailyCarbGoal; }
    public function setDailyCarbGoal(?float $dailyCarbGoal): void { $this->dailyCarbGoal = $dailyCarbGoal; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    /** @return Collection<int, Meal> */
    public function getMeals(): Collection { return $this->meals; }

    public function getAge(): ?int
    {
        if ($this->birthDate === null) {
            return null;
        }
        return $this->birthDate->diff(new \DateTimeImmutable())->y;
    }

    public function toArray(): array
    {
        return [
            'id'            => (string) $this->id,
            'name'          => $this->name,
            'birthDate'     => $this->birthDate?->format('Y-m-d'),
            'age'           => $this->getAge(),
            'photo'         => $this->photo,
            'dailyCarbGoal' => $this->dailyCarbGoal !== null ? (float) $this->dailyCarbGoal : null,
            'createdAt'     => $this->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt'     => $this->updatedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
