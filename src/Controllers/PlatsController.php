<?php

namespace Peerfood\Controllers;

use Peerfood\Models\Plat;
use Peerfood\Models\Category;
use Peerfood\Models\Ingredient;
use Respect\Validation\Validator as v;

class PlatsController {
    private $plat;
    private $category;
    private $ingredient;

    public function __construct() {
        $this->plat = new Plat();
        $this->category = new Category();
        $this->ingredient = new Ingredient();
    }

    public function getAllPlats() {
        try {
            $plats = $this->plat->getAll();
            foreach ($plats as &$plat) {
                $plat['category'] = $this->category->findById($plat['category_id']);
                $plat['ingredients'] = $this->ingredient->getByPlatId($plat['id']);
            }
            return ['data' => $plats];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getPlatById($id) {
        try {
            $plat = $this->plat->findById($id);
            if (!$plat) {
                return ['error' => 'Plat non trouvé'];
            }
            $plat['category'] = $this->category->findById($plat['category_id']);
            $plat['ingredients'] = $this->ingredient->getByPlatId($plat['id']);
            return ['data' => $plat];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function createPlat($request) {
        try {
            $validator = v::key('name', v::stringType()->notEmpty())
                         ->key('description', v::stringType())
                         ->key('price', v::numeric()->positive())
                         ->key('category_id', v::numeric()->positive())
                         ->key('ingredients', v::arrayVal()->notEmpty());

            $validator->assert($request);

            // Vérifier si la catégorie existe
            if (!$this->category->findById($request['category_id'])) {
                return ['error' => 'Catégorie non trouvée'];
            }

            // Créer le plat
            $platId = $this->plat->create([
                'name' => $request['name'],
                'description' => $request['description'],
                'price' => $request['price'],
                'category_id' => $request['category_id']
            ]);

            // Ajouter les ingrédients
            foreach ($request['ingredients'] as $ingredient) {
                $this->ingredient->create([
                    'plat_id' => $platId,
                    'name' => $ingredient['name'],
                    'quantity' => $ingredient['quantity'] ?? null
                ]);
            }

            return ['success' => 'Plat créé avec succès', 'id' => $platId];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function updatePlat($id, $request) {
        try {
            if (!$this->plat->findById($id)) {
                return ['error' => 'Plat non trouvé'];
            }

            $validator = v::key('name', v::stringType()->notEmpty())
                         ->key('description', v::stringType())
                         ->key('price', v::numeric()->positive())
                         ->key('category_id', v::numeric()->positive());

            $validator->assert($request);

            $this->plat->update($id, $request);

            if (isset($request['ingredients'])) {
                // Supprimer les anciens ingrédients
                $this->ingredient->deleteByPlatId($id);
                
                // Ajouter les nouveaux ingrédients
                foreach ($request['ingredients'] as $ingredient) {
                    $this->ingredient->create([
                        'plat_id' => $id,
                        'name' => $ingredient['name'],
                        'quantity' => $ingredient['quantity'] ?? null
                    ]);
                }
            }

            return ['success' => 'Plat mis à jour avec succès'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function deletePlat($id) {
        try {
            if (!$this->plat->findById($id)) {
                return ['error' => 'Plat non trouvé'];
            }

            // Supprimer d'abord les ingrédients associés
            $this->ingredient->deleteByPlatId($id);
            
            // Supprimer le plat
            $this->plat->delete($id);

            return ['success' => 'Plat supprimé avec succès'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getPlatsByCategory($categoryId) {
        try {
            if (!$this->category->findById($categoryId)) {
                return ['error' => 'Catégorie non trouvée'];
            }

            $plats = $this->plat->findByCategory($categoryId);
            foreach ($plats as &$plat) {
                $plat['ingredients'] = $this->ingredient->getByPlatId($plat['id']);
            }

            return ['data' => $plats];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}