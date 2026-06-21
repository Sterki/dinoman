<?php

declare(strict_types=1);

namespace App\Controller;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
final class AuthController
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly Security $security,
    ) {}

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email    = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(
                ['error' => 'El email no es válido.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (strlen($password) < 8) {
            return new JsonResponse(
                ['error' => 'La contraseña debe tener al menos 8 caracteres.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($this->userRepository->findByEmail($email) !== null) {
            return new JsonResponse(
                ['error' => 'Este email ya está registrado.'],
                Response::HTTP_CONFLICT
            );
        }

        $user = new User($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $this->userRepository->save($user);

        return new JsonResponse(
            ['token' => $user->getApiToken(), 'user' => $user->toArray()],
            Response::HTTP_CREATED
        );
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email    = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        $user = $this->userRepository->findByEmail($email);

        if ($user === null || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(
                ['error' => 'Email o contraseña incorrectos.'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $user->regenerateToken();
        $this->userRepository->save($user);

        return new JsonResponse([
            'token' => $user->getApiToken(),
            'user'  => $user->toArray(),
        ]);
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();

        return new JsonResponse($user->toArray());
    }
}
