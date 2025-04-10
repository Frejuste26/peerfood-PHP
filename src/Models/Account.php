<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $table = 'accounts';
    protected $primaryKey = 'accountId';
    
    protected $fillable = [
        'customer',
        'username',
        'mdpasse',
        'role',
        'statut',
        'codeVerif'
    ];

    protected $attributes = [
        'role' => 'Student',
        'statut' => 'Enabled'
    ];

    protected $casts = [
        'role' => 'string',
        'statut' => 'string',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer', 'customerId');
    }

    public function isTeacher()
    {
        return $this->role === 'Teacher';
    }

    public function isEnabled()
    {
        return $this->statut === 'Enabled';
    }
}