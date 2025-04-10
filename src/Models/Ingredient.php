<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $table = 'ingredient';
    protected $primaryKey = 'ingredientId';
    
    protected $fillable = [
        'ingredientName'
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function plats()
    {
        return $this->belongsToMany(Plat::class, 'composer', 'ingredient', 'plat')
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }

    public static function findByName($name)
    {
        return static::where('ingredientName', $name)->first();
    }
}