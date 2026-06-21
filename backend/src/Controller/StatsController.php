<?php

declare(strict_types=1);

namespace App\Controller;

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

#[Route('/api/patients/{patientId}/stats')]
final class StatsController
{
    public function __construct(
        private readonly PatientRepositoryInterface $patientRepository,
        private readonly MealRepositoryInterface $mealRepository,
        private readonly Security $security,
    ) {}

    #[Route('', name: 'api_stats', methods: ['GET'])]
    public function stats(string $patientId, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($patientId), $this->user());
        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $period = $request->query->get('period', '7d');
        $days   = $period === '30d' ? 30 : 7;

        $from  = new \DateTimeImmutable("-{$days} days midnight");
        $to    = new \DateTimeImmutable('tomorrow midnight');
        $meals = $this->mealRepository->findByPatientAndDateRange($patient, $from, $to);

        $byDay = [];
        foreach ($meals as $meal) {
            $day = $meal->getEatenAt()->format('Y-m-d');
            if (!isset($byDay[$day])) {
                $byDay[$day] = ['date' => $day, 'totalCarbs' => 0.0, 'mealCount' => 0];
            }
            $byDay[$day]['totalCarbs'] += $meal->getTotalCarbs();
            $byDay[$day]['mealCount']++;
        }

        $dailyData = array_values($byDay);
        foreach ($dailyData as &$d) {
            $d['totalCarbs'] = round($d['totalCarbs'], 2);
        }

        $carbValues = array_column($dailyData, 'totalCarbs');
        $avgCarbs   = count($carbValues) > 0 ? round(array_sum($carbValues) / count($carbValues), 2) : 0;
        $maxCarbs   = count($carbValues) > 0 ? max($carbValues) : 0;
        $minCarbs   = count($carbValues) > 0 ? min($carbValues) : 0;

        $maxDay = count($dailyData) > 0
            ? $dailyData[array_search($maxCarbs, array_column($dailyData, 'totalCarbs'))]
            : null;
        $minDay = count($dailyData) > 0
            ? $dailyData[array_search($minCarbs, array_column($dailyData, 'totalCarbs'))]
            : null;

        return new JsonResponse([
            'period'    => $period,
            'avgCarbs'  => $avgCarbs,
            'maxDay'    => $maxDay,
            'minDay'    => $minDay,
            'dailyData' => $dailyData,
        ]);
    }

    private function user(): User
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $user;
    }
}
