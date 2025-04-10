<?php

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

// Création du loader Twig
$loader = new FilesystemLoader(__DIR__ . '/../Views');

// Configuration de l'environnement Twig
$twig = new Environment($loader, [
    'cache' => __DIR__ . '/../../cache/twig',
    'debug' => true,
    'auto_reload' => true
]);

// Ajout de variables globales
$twig->addGlobal('base_url', '/PROJECTS/PeerFood/Public');

// Ajout de fonctions personnalisées si nécessaire
$twig->addFunction(new \Twig\TwigFunction('asset', function ($path) {
    return '/PROJECTS/PeerFood/Public/' . ltrim($path, '/');
}));

return $twig;