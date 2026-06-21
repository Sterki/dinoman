<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\MealService;
use App\Domain\Entity\User;
use App\Domain\Repository\FoodRepositoryInterface;
use App\Domain\Repository\MealFoodRepositoryInterface;
use App\Domain\Repository\MealRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/meals/{mealId}')]
final class MealFoodController
{
    public function __construct(
        private readonly MealRepositoryInterface $mealRepository,
        private readonly FoodRepositoryInterface $foodRepository,
        private readonly MealFoodRepositoryInterface $mealFoodRepository,
        private readonly MealService $mealService,
        private readonly Security $security,
    ) {}

    #[Route('/foods', name: 'api_meal_foods_add', methods: ['POST'])]
    public function add(string $mealId, Request $request): JsonResponse
    {
        $meal = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());
        if ($meal === null) {
            return new JsonResponse(['error' => 'Comida no encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['foodId'])) {
            return new JsonResponse(['error' => 'El alimento es obligatorio.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        if (!isset($data['gramsConsumed']) || $data['gramsConsumed'] <= 0) {
            return new JsonResponse(['error' => 'Los gramos consumidos deben ser > 0.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $food = $this->foodRepository->findByIdAndUser(Uuid::fromString($data['foodId']), $this->user());
        if ($food === null) {
            return new JsonResponse(['error' => 'Alimento no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $mealFood = $this->mealService->addFoodToMeal($meal, $food, (float) $data['gramsConsumed']);

        return new JsonResponse($mealFood->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/foods/{mealFoodId}', name: 'api_meal_foods_remove', methods: ['DELETE'])]
    public function remove(string $mealId, string $mealFoodId): JsonResponse
    {
        $mealFood = $this->mealFoodRepository->findById(Uuid::fromString($mealFoodId));

        if ($mealFood === null || (string) $mealFood->getMeal()->getId() !== $mealId) {
            return new JsonResponse(['error' => 'Registro no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        // Verify the meal belongs to the current user
        $meal = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());
        if ($meal === null) {
            return new JsonResponse(['error' => 'Acceso denegado.'], Response::HTTP_FORBIDDEN);
        }

        $this->mealService->removeFoodFromMeal($mealFood);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    private function user(): User
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $user;
    }
}
