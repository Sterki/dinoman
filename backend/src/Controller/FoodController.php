<?php

declare(strict_types=1);

namespace App\Controller;

use App\Domain\Entity\Food;
use App\Domain\Entity\User;
use App\Domain\Repository\FoodRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/foods')]
final class FoodController
{
    public function __construct(
        private readonly FoodRepositoryInterface $foodRepository,
        private readonly Security $security,
    ) {}

    #[Route('', name: 'api_foods_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $search = $request->query->get('search', '');
        $user   = $this->user();

        $foods = $search
            ? $this->foodRepository->searchByUser($search, $user)
            : $this->foodRepository->findByUser($user);

        return new JsonResponse(array_map(fn (Food $f) => $f->toArray(), $foods));
    }

    #[Route('', name: 'api_foods_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['name'])) {
            return new JsonResponse(['error' => 'El nombre es obligatorio.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        if (!isset($data['carbsPer100g']) || $data['carbsPer100g'] < 0) {
            return new JsonResponse(['error' => 'Los carbohidratos por 100g son obligatorios.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $food = new Food($data['name'], (float) $data['carbsPer100g'], $this->user());

        if (isset($data['photo'])) {
            $food->setPhoto($data['photo']);
        }

        $this->foodRepository->save($food);

        return new JsonResponse($food->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_foods_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $food = $this->foodRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($food === null) {
            return new JsonResponse(['error' => 'Alimento no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($food->toArray());
    }

    #[Route('/{id}', name: 'api_foods_update', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $food = $this->foodRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($food === null) {
            return new JsonResponse(['error' => 'Alimento no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (!empty($data['name'])) {
            $food->setName($data['name']);
        }
        if (isset($data['carbsPer100g']) && $data['carbsPer100g'] >= 0) {
            $food->setCarbsPer100g((float) $data['carbsPer100g']);
        }
        if (array_key_exists('photo', $data)) {
            $food->setPhoto($data['photo']);
        }

        $this->foodRepository->save($food);

        return new JsonResponse($food->toArray());
    }

    #[Route('/{id}', name: 'api_foods_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $food = $this->foodRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($food === null) {
            return new JsonResponse(['error' => 'Alimento no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $this->foodRepository->delete($food);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    private function user(): User
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $user;
    }
}
