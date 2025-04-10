<?php

namespace PeerFood\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'customers';
    protected $primaryKey = 'customerId';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'customerId',
        'lastname',
        'firstname',
        'phone',
        'email'
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function account()
    {
        return $this->hasOne(Account::class, 'customer', 'customerId');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer', 'customerId');
    }

    public function getFullNameAttribute()
    {
        return $this->firstname . ' ' . $this->lastname;
    }
}