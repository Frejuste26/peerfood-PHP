<?php

namespace App\Routes;

use FastRoute\Dispatcher;
use FastRoute\RouteCollector;
use FastRoute\DataGenerator\GroupCountBased;
use FastRoute\RouteParser\Std;

class Router {
    private static $dispatcher = null;

    public static function init() {
        $routes = require __DIR__ . '/web.php';
        $routeCollector = new RouteCollector(new Std(), new GroupCountBased());
        $routes($routeCollector);
        self::$dispatcher = new Dispatcher\GroupCountBased($routeCollector->getData());
    }

    public static function dispatch($httpMethod, $uri) {
        if (self::$dispatcher === null) {
            self::init();
        }

        // Strip query string and decode URI
        if (false !== $pos = strpos($uri, '?')) {
            $uri = substr($uri, 0, $pos);
        }
        $uri = rawurldecode($uri);

        $routeInfo = self::$dispatcher->dispatch($httpMethod, $uri);

        switch ($routeInfo[0]) {
            case Dispatcher::NOT_FOUND:
                header("HTTP/1.0 404 Not Found");
                echo '404 - Page non trouvée';
                break;

            case Dispatcher::METHOD_NOT_ALLOWED:
                header("HTTP/1.0 405 Method Not Allowed");
                echo '405 - Méthode non autorisée';
                break;

            case Dispatcher::FOUND:
                $handler = $routeInfo[1];
                $vars = $routeInfo[2];
                
                // Instancier le contrôleur et appeler la méthode
                $controller = new $handler[0]();
                $method = $handler[1];
                echo $controller->$method(...array_values($vars));
                break;
        }
    }
}