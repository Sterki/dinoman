<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'foods')]
#[ORM\HasLifecycleCallbacks]
class Food
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true, onDelete: 'CASCADE')]
    private ?User $user;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(name: 'carbs_per_100g', type: 'decimal', precision: 8, scale: 2)]
    private float $carbsPer100g;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $photo = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct(string $name, float $carbsPer100g, ?User $user = null)
    {
        $this->id = Uuid::v7();
        $this->name = $name;
        $this->carbsPer100g = $carbsPer100g;
        $this->user = $user;
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
    public function getCarbsPer100g(): float { return $this->carbsPer100g; }
    public function setCarbsPer100g(float $carbsPer100g): void { $this->carbsPer100g = $carbsPer100g; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id'           => (string) $this->id,
            'name'         => $this->name,
            'carbsPer100g' => (float) $this->carbsPer100g,
            'photo'        => $this->photo,
            'createdAt'    => $this->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt'    => $this->updatedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
