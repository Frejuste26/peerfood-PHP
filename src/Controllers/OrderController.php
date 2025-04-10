<?php

namespace Peerfood\Controllers;

use Peerfood\Models\Order;
use Peerfood\Models\Plat;
use Peerfood\Models\Customer;
use Respect\Validation\Validator as v;

class OrderController {
    private $order;
    private $plat;
    private $customer;

    public function __construct() {
        $this->order = new Order();
        $this->plat = new Plat();
        $this->customer = new Customer();
    }

    public function createOrder($request) {
        try {
            $validator = v::key('customer_id', v::numeric()->positive())
                         ->key('items', v::arrayVal()->notEmpty())
                         ->key('total_amount', v::numeric()->positive())
                         ->key('delivery_address', v::stringType()->notEmpty());

            $validator->assert($request);

            // Vérifier si le client existe
            if (!$this->customer->findById($request['customer_id'])) {
                return ['error' => 'Client non trouvé'];
            }

            // Vérifier la disponibilité des plats
            foreach ($request['items'] as $item) {
                $plat = $this->plat->findById($item['plat_id']);
                if (!$plat) {
                    return ['error' => 'Plat non trouvé: ' . $item['plat_id']];
                }
            }

            // Créer la commande
            $orderId = $this->order->create([
                'customer_id' => $request['customer_id'],
                'total_amount' => $request['total_amount'],
                'delivery_address' => $request['delivery_address'],
                'status' => 'pending',
                'created_at' => date('Y-m-d H:i:s')
            ]);

            // Ajouter les items de la commande
            foreach ($request['items'] as $item) {
                $this->order->addOrderItem([
                    'order_id' => $orderId,
                    'plat_id' => $item['plat_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);
            }

            return ['success' => 'Commande créée avec succès', 'order_id' => $orderId];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getOrderById($id) {
        try {
            $order = $this->order->findById($id);
            if (!$order) {
                return ['error' => 'Commande non trouvée'];
            }

            $order['items'] = $this->order->getOrderItems($id);
            $order['customer'] = $this->customer->findById($order['customer_id']);

            return ['data' => $order];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getCustomerOrders($customerId) {
        try {
            if (!$this->customer->findById($customerId)) {
                return ['error' => 'Client non trouvé'];
            }

            $orders = $this->order->findByCustomerId($customerId);
            foreach ($orders as &$order) {
                $order['items'] = $this->order->getOrderItems($order['id']);
            }

            return ['data' => $orders];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function updateOrderStatus($id, $request) {
        try {
            $validator = v::key('status', v::in(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']));
            $validator->assert($request);

            if (!$this->order->findById($id)) {
                return ['error' => 'Commande non trouvée'];
            }

            $this->order->update($id, [
                'status' => $request['status'],
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            return ['success' => 'Statut de la commande mis à jour'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function cancelOrder($id) {
        try {
            $order = $this->order->findById($id);
            if (!$order) {
                return ['error' => 'Commande non trouvée'];
            }

            if ($order['status'] === 'delivered') {
                return ['error' => 'Impossible d\'annuler une commande déjà livrée'];
            }

            $this->order->update($id, [
                'status' => 'cancelled',
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            return ['success' => 'Commande annulée avec succès'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getOrdersByStatus($status) {
        try {
            $validator = v::in(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']);
            $validator->assert($status);

            $orders = $this->order->findByStatus($status);
            foreach ($orders as &$order) {
                $order['items'] = $this->order->getOrderItems($order['id']);
                $order['customer'] = $this->customer->findById($order['customer_id']);
            }

            return ['data' => $orders];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}