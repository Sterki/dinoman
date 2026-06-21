<?php

declare(strict_types=1);

namespace App\Controller;

use App\Domain\Entity\Patient;
use App\Domain\Entity\User;
use App\Domain\Repository\PatientRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/patients')]
final class PatientController
{
    public function __construct(
        private readonly PatientRepositoryInterface $patientRepository,
        private readonly Security $security,
    ) {}

    #[Route('', name: 'api_patients_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $patients = $this->patientRepository->findByUser($this->user());

        return new JsonResponse(array_map(fn (Patient $p) => $p->toArray(), $patients));
    }

    #[Route('', name: 'api_patients_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['name'])) {
            return new JsonResponse(['error' => 'El nombre es obligatorio.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $patient = new Patient($data['name'], $this->user());

        if (!empty($data['birthDate'])) {
            $patient->setBirthDate(new \DateTimeImmutable($data['birthDate']));
        }
        if (isset($data['photo'])) {
            $patient->setPhoto($data['photo']);
        }
        if (isset($data['dailyCarbGoal'])) {
            $patient->setDailyCarbGoal((float) $data['dailyCarbGoal']);
        }

        $this->patientRepository->save($patient);

        return new JsonResponse($patient->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_patients_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($patient->toArray());
    }

    #[Route('/{id}', name: 'api_patients_update', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (!empty($data['name'])) {
            $patient->setName($data['name']);
        }
        if (array_key_exists('birthDate', $data)) {
            $patient->setBirthDate($data['birthDate'] ? new \DateTimeImmutable($data['birthDate']) : null);
        }
        if (array_key_exists('photo', $data)) {
            $patient->setPhoto($data['photo']);
        }
        if (array_key_exists('dailyCarbGoal', $data)) {
            $patient->setDailyCarbGoal($data['dailyCarbGoal'] !== null ? (float) $data['dailyCarbGoal'] : null);
        }

        $this->patientRepository->save($patient);

        return new JsonResponse($patient->toArray());
    }

    #[Route('/{id}', name: 'api_patients_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByIdAndUser(Uuid::fromString($id), $this->user());

        if ($patient === null) {
            return new JsonResponse(['error' => 'Paciente no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $this->patientRepository->delete($patient);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    private function user(): User
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $user;
    }
}
