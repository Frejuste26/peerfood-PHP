<?php

namespace Peerfood\Routes;

use FastRoute\RouteCollector;
use Peerfood\Controllers\AuthController;
use Peerfood\Controllers\PlatsController;
use Peerfood\Controllers\OrderController;

return function (RouteCollector $r) {
    // Routes d'authentification
    $r->addRoute('GET', '/login', [AuthController::class, 'showLoginForm']);
    $r->addRoute('POST', '/login', [AuthController::class, 'login']);
    $r->addRoute('POST', '/logout', [AuthController::class, 'logout']);
    $r->addRoute('GET', '/register', [AuthController::class, 'showRegistrationForm']);
    $r->addRoute('POST', '/register', [AuthController::class, 'register']);

    // Routes pour la gestion des plats
    $r->addRoute('GET', '/plats', [PlatsController::class, 'index']);
    $r->addRoute('GET', '/plats/create', [PlatsController::class, 'create']);
    $r->addRoute('POST', '/plats', [PlatsController::class, 'store']);
    $r->addRoute('GET', '/plats/{id}', [PlatsController::class, 'show']);
    $r->addRoute('GET', '/plats/{id}/edit', [PlatsController::class, 'edit']);
    $r->addRoute('PUT', '/plats/{id}', [PlatsController::class, 'update']);
    $r->addRoute('DELETE', '/plats/{id}', [PlatsController::class, 'destroy']);

    // Routes pour les commandes
    $r->addRoute('GET', '/orders', [OrderController::class, 'index']);
    $r->addRoute('POST', '/orders', [OrderController::class, 'store']);
    $r->addRoute('GET', '/orders/{id}', [OrderController::class, 'show']);
    $r->addRoute('PUT', '/orders/{id}', [OrderController::class, 'update']);
    $r->addRoute('DELETE', '/orders/{id}', [OrderController::class, 'cancel']);
};