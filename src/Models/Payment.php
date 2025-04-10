<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    protected $primaryKey = 'payCode';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'payCode',
        'orderId',
        'method',
        'amount',
        'transactionNumber',
        'paymentDate',
        'statut'
    ];

    protected $attributes = [
        'statut' => 'Waiting'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paymentDate' => 'datetime',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'orderId', 'orderId');
    }

    public function isCompleted()
    {
        return $this->statut === 'Completed';
    }

    public function isFailed()
    {
        return $this->statut === 'Failed';
    }

    public function scopePending($query)
    {
        return $query->where('statut', 'Waiting');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('statut', 'Completed');
    }
}