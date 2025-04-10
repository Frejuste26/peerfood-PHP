<?php

namespace Peerfood\Configs;

use Dotenv\Dotenv;
use InvalidArgumentException;

class Config
{
    public const APP_NAME = 'APP_NAME';
    public const APP_ENV = 'APP_ENV';
    public const APP_DEBUG = 'APP_DEBUG';
    public const APP_TIMEZONE = 'APP_TIMEZONE';
    public const APP_URL = 'APP_URL';
    
    public const DB_HOST = 'DB_HOST';
    public const DB_PORT = 'DB_PORT';
    public const DB_USER = 'DB_USER';
    public const DB_PASS = 'DB_PASS';
    public const DB_NAME = 'DB_NAME';
    public const DB_CHARSET = 'DB_CHARSET';
    public const DB_COLLATION = 'DB_COLLATION';
    
    public const JWT_SECRET = 'JWT_SECRET';
    public const JWT_ALGORITHM = 'JWT_ALGORITHM';
    public const JWT_EXPIRATION = 'JWT_EXPIRATION';
    public const JWT_ISSUER = 'JWT_ISSUER';

    private static array $config = [];

    /**
     * Charge et valide les configurations
     * 
     * @throws InvalidArgumentException Si les variables requises sont manquantes
     */
    public static function load(): void
    {
        $dotenv = Dotenv::createImmutable(__DIR__.'/../');
        $dotenv->safeLoad();

        // Validation des variables requises
        $dotenv->required([
            self::DB_HOST,
            self::DB_NAME,
            self::DB_USER,
            self::JWT_SECRET
        ])->notEmpty();

        self::$config = [
            // Application
            self::APP_NAME => $_ENV[self::APP_NAME] ?? 'PeerFood',
            self::APP_ENV => $_ENV[self::APP_ENV] ?? 'production',
            self::APP_DEBUG => self::parseBool($_ENV[self::APP_DEBUG] ?? false),
            self::APP_TIMEZONE => $_ENV[self::APP_TIMEZONE] ?? 'UTC',
            self::APP_URL => rtrim($_ENV[self::APP_URL] ?? '', '/'),

            // Database
            self::DB_HOST => $_ENV[self::DB_HOST],
            self::DB_PORT => (int)($_ENV[self::DB_PORT] ?? 3306),
            self::DB_USER => $_ENV[self::DB_USER],
            self::DB_PASS => $_ENV[self::DB_PASS] ?? '',
            self::DB_NAME => $_ENV[self::DB_NAME],
            self::DB_CHARSET => $_ENV[self::DB_CHARSET] ?? 'utf8mb4',
            self::DB_COLLATION => $_ENV[self::DB_COLLATION] ?? 'utf8mb4_unicode_ci',

            // JWT
            self::JWT_SECRET => $_ENV[self::JWT_SECRET],
            self::JWT_ALGORITHM => $_ENV[self::JWT_ALGORITHM] ?? 'HS256',
            self::JWT_EXPIRATION => (int)($_ENV[self::JWT_EXPIRATION] ?? 3600),
            self::JWT_ISSUER => $_ENV[self::JWT_ISSUER] ?? $_ENV[self::APP_NAME] ?? 'PeerFood',
        ];

        // Configuration de la timezone
        date_default_timezone_set(self::$config[self::APP_TIMEZONE]);
    }

    /**
     * Récupère une valeur de configuration
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        if (!array_key_exists($key, self::$config)) {
            throw new InvalidArgumentException("Configuration key {$key} does not exist");
        }

        return self::$config[$key] ?? $default;
    }

    /**
     * Vérifie si l'application est en mode debug
     */
    public static function isDebug(): bool
    {
        return self::$config[self::APP_DEBUG];
    }

    /**
     * Vérifie si l'application est en environnement de développement
     */
    public static function isDev(): bool
    {
        return self::$config[self::APP_ENV] === 'development';
    }

    /**
     * Parse une valeur en booléen
     */
    private static function parseBool(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Empêche l'instanciation de la classe
     */
    private function __construct()
    {
    }
}