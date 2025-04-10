<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'categoryId';
    
    protected $fillable = [
        'categoryName'
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'category', 'categoryId');
    }

    public static function findByName($name)
    {
        return static::where('categoryName', $name)->first();
    }
}