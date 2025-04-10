<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Plat extends Model
{
    protected $table = 'plats';
    protected $primaryKey = 'platId';
    
    protected $fillable = [
        'platName',
        'description',
        'price',
        'availability',
        'imagePath'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'availability' => 'boolean',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'composer', 'plat', 'ingredient')
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'plat', 'platId');
    }

    public function scopeAvailable($query)
    {
        return $query->where('availability', true);
    }

    public function isAvailable()
    {
        return $this->availability === true;
    }
}