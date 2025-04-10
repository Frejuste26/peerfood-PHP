<?php

namespace Peerfood\Configs;

use Illuminate\Database\Capsule\Manager as Capsule;

class Database
{
    /**
     * Initialise la connexion à la base de données et configure Eloquent ORM.
     *
     * @throws \RuntimeException Si la configuration de la base de données est manquante ou incorrecte.
     */
    public static function init(): void
    {
        // Vérifie que les variables d'environnement requises sont définies
        if (!Config::get('DB_HOST') || !Config::get('DB_NAME') || !Config::get('DB_USER')) {
            throw new \RuntimeException('Missing required database configuration in .env file.');
        }

        $capsule = new Capsule;

        // Configuration de la connexion à la base de données
        $capsule->addConnection([
            'driver'    => 'mysql',
            'host'      => Config::get('DB_HOST'),
            'database'  => Config::get('DB_NAME'),
            'username'  => Config::get('DB_USER'),
            'password'  => Config::get('DB_PASS'),
            'charset'   => Config::get('DB_CHARSET'),
            'collation' => Config::get('DB_COLLATION'),
            'port'      => Config::get('DB_PORT'),
            'prefix'    => ''
        ]);

        try {
            // Rendre la capsule disponible globalement
            $capsule->setAsGlobal();

            // Démarrer Eloquent ORM
            $capsule->bootEloquent();
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to connect to the database: ' . $e->getMessage());
        }
    }
}