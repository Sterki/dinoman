<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\MealService;
use App\Domain\Entity\Meal;
use App\Domain\Entity\User;
use App\Domain\Repository\MealRepositoryInterface;
use App\Domain\Repository\PatientRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/patients/{patientId}/meals')]
final class MealController
{
    public function __construct(
        private readonly PatientRepositoryInterface $patientRepository,
        private readonly MealRepositoryInterface $mealRepository,
        private readonly MealService $mealService,
        private readonly Security $security,
    ) {}

    #[Route('', name: 'api_meals_list', methods: ['GET'])]
    public function list(string $patientId, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($patientId), $this->user());
        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $period = $request->query->get('period', 'all');

        $meals = match ($period) {
            'today' => $this->mealRepository->findTodayByPatient($patient),
            '7d'    => $this->mealRepository->findByPatientAndDateRange(
                $patient,
                new \DateTimeImmutable('-7 days midnight'),
                new \DateTimeImmutable('tomorrow midnight')
            ),
            '30d'   => $this->mealRepository->findByPatientAndDateRange(
                $patient,
                new \DateTimeImmutable('-30 days midnight'),
                new \DateTimeImmutable('tomorrow midnight')
            ),
            default => $this->mealRepository->findByPatient($patient),
        };

        return new JsonResponse(array_map(fn (Meal $m) => $m->toArray(), $meals));
    }

    #[Route('/today-summary', name: 'api_meals_today_summary', methods: ['GET'])]
    public function todaySummary(string $patientId): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($patientId), $this->user());
        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $meals     = $this->mealRepository->findTodayByPatient($patient);
        $totalCarbs = array_sum(array_map(fn (Meal $m) => $m->getTotalCarbs(), $meals));
        $lastMeal   = count($meals) > 0 ? $meals[0]->toArray() : null;

        return new JsonResponse([
            'totalCarbs'    => round($totalCarbs, 2),
            'mealCount'     => count($meals),
            'lastMeal'      => $lastMeal,
            'dailyCarbGoal' => $patient->getDailyCarbGoal(),
        ]);
    }

    #[Route('', name: 'api_meals_create', methods: ['POST'])]
    public function create(string $patientId, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($patientId), $this->user());
        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['name'])) {
            return new JsonResponse(['error' => 'El nombre de la comida es obligatorio.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $eatenAt = !empty($data['eatenAt']) ? new \DateTimeImmutable($data['eatenAt']) : new \DateTimeImmutable();
        $meal    = new Meal($patient, $data['name'], $eatenAt);

        if (isset($data['photo'])) { $meal->setPhoto($data['photo']); }
        if (isset($data['notes'])) { $meal->setNotes($data['notes']); }

        $this->mealRepository->save($meal);

        return new JsonResponse($meal->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{mealId}', name: 'api_meals_show', methods: ['GET'])]
    public function show(string $patientId, string $mealId): JsonResponse
    {
        $meal = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());

        if ($meal === null || (string) $meal->getPatient()->getId() !== $patientId) {
            return new JsonResponse(['error' => 'Comida no encontrada.'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($meal->toArray());
    }

    #[Route('/{mealId}', name: 'api_meals_update', methods: ['PUT', 'PATCH'])]
    public function update(string $patientId, string $mealId, Request $request): JsonResponse
    {
        $meal = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());

        if ($meal === null || (string) $meal->getPatient()->getId() !== $patientId) {
            return new JsonResponse(['error' => 'Comida no encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (!empty($data['name'])) { $meal->setName($data['name']); }
        if (!empty($data['eatenAt'])) { $meal->setEatenAt(new \DateTimeImmutable($data['eatenAt'])); }
        if (array_key_exists('photo', $data)) { $meal->setPhoto($data['photo']); }
        if (array_key_exists('notes', $data)) { $meal->setNotes($data['notes']); }
        if (array_key_exists('isFavorite', $data)) { $meal->setFavorite((bool) $data['isFavorite']); }

        $this->mealRepository->save($meal);

        return new JsonResponse($meal->toArray());
    }

    #[Route('/{mealId}', name: 'api_meals_delete', methods: ['DELETE'])]
    public function delete(string $patientId, string $mealId): JsonResponse
    {
        $meal = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());

        if ($meal === null || (string) $meal->getPatient()->getId() !== $patientId) {
            return new JsonResponse(['error' => 'Comida no encontrada.'], Response::HTTP_NOT_FOUND);
        }

        $this->mealRepository->delete($meal);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{mealId}/duplicate', name: 'api_meals_duplicate', methods: ['POST'])]
    public function duplicate(string $patientId, string $mealId, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($patientId), $this->user());
        $meal    = $this->mealRepository->findByIdAndUser(Uuid::fromString($mealId), $this->user());

        if ($patient === null || $meal === null) {
            return new JsonResponse(['error' => 'Recurso no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $data    = json_decode($request->getContent(), true) ?? [];
        $eatenAt = !empty($data['eatenAt']) ? new \DateTimeImmutable($data['eatenAt']) : new \DateTimeImmutable();

        $duplicate = $this->mealService->duplicateMeal($meal, $patient, $eatenAt);

        return new JsonResponse($duplicate->toArray(), Response::HTTP_CREATED);
    }

    private function user(): User
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $user;
    }
}
