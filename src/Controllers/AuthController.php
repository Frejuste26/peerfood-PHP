<?php

namespace Peerfood\Controllers;

use Peerfood\Models\User;
use Respect\Validation\Validator as v;
use Twig\Environment;

class AuthController {
    private $user;
    private $customer;
    private $twig;

    public function __construct() {
        $this->user = new User();
        $this->twig = require __DIR__ . '/../Configs/twig.php';
    }

    public function showRegistrationForm() {
        return $this->twig->render('auth/register.twig');
    }

    public function getUsers() {
        try {
            $users = $this->user->findAll();
            return ['data' => $users];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function register($request) {
        try {
          //vérifier si la table users est vide
          $users = $this->user->findAll();  
          if (empty($users)) {
              $satut = 'Adminstrator'; 
          }else {
              $satut = 'Manager';
          }
          $validator = v::key('username', v::stringType()->notEmpty())
                       ->key('password', v::stringType()->notEmpty())
                       ->key('email', v::email()->notEmpty());

          $validator->assert($request);

          $request['password'] = password_hash($request['password'], PASSWORD_DEFAULT);
          $request['statut'] = $satut;

          $userId = $this->user->create($request);

          return $this->twig->render('auth/register.twig', [
              'success' => 'Utilisateur enregistré avec succès',
              'userId' => $userId
          ]);
        } catch (\Exception $e) {
            return $this->twig->render('auth/register.twig', [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function login($request) {
        try {
            $validator = v::key('email', v::email())
                         ->key('password', v::stringType()->notEmpty());

            $validator->assert($request);

            $user = $this->user->findByEmail($request['email']);

            if (!$user || !password_verify($request['password'], $user['password'])) {
                return $this->twig->render('auth/login.twig', [
                'error' => 'Email ou mot de passe incorrect'
            ]);
            }

            // Créer la session
            $_SESSION['user'] = [
                'id' => $user['userId'],
                'email' => $user['email'],
                'role' => $user['satut']
            ];

            return $this->twig->render('auth/login.twig', [
                'success' => 'Connexion réussie'
            ]);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function logout() {
        session_destroy();
        return ['success' => 'Déconnexion réussie'];
    }

    public function getProfile($userId) {
        try {
            $user = $this->user->findById($userId);
            if (!$user) {
                return ['error' => 'Utilisateur non trouvé'];
            }

            if ($user['role'] === 'customer') {
                $customer = $this->customer->findByUserId($userId);
                $user['customer_details'] = $customer;
            }

            unset($user['password']); // Ne pas renvoyer le mot de passe
            return ['data' => $user];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function updateProfile($userId, $request) {
        try {
            $validator = v::key('name', v::stringType()->notEmpty());
            $validator->assert($request);

            $this->user->update($userId, $request);

            if (isset($request['customer_details'])) {
                $this->customer->updateByUserId($userId, $request['customer_details']);
            }

            return ['success' => 'Profil mis à jour avec succès'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}