<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'orderId';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'orderId',
        'plat',
        'customer',
        'category',
        'orderDate',
        'orderTime',
        'price',
        'paymentPhone',
        'statut',
        'paymentDeadline',
        'deliveryDate',
        'payMethod'
    ];

    protected $casts = [
        'orderDate' => 'date',
        'orderTime' => 'datetime',
        'price' => 'decimal:2',
        'paymentDeadline' => 'datetime',
        'deliveryDate' => 'date',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    protected $attributes = [
        'statut' => 'Unpaid'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer', 'customerId');
    }

    public function plat()
    {
        return $this->belongsTo(Plat::class, 'plat', 'platId');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'categoryId');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'orderId', 'orderId');
    }

    public function isPaid()
    {
        return $this->statut === 'Paid';
    }

    public function isCancelled()
    {
        return $this->statut === 'Cancelled';
    }

    public function scopeUnpaid($query)
    {
        return $query->where('statut', 'Unpaid');
    }

    public function scopePending($query)
    {
        return $query->where('deliveryDate', '>=', now());
    }
}