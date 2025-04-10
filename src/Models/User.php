<?php

namespace Peerfood\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'userId';

    protected $fillable = [
       'username',
       'password',
       'statut',
       'email',
       'last_login_at'
    ];

    protected $attributes = [
        'statut' => 'Manager',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'statut' => 'string',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
        'last_login_at' => 'datetime'
    ];

    private function HashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = $this->HashPassword($password);
    }

    public function verifyPassword($password)
    {
        return password_verify($password, $this->password);  
    }

    public function isManager()
    {
        return $this->statut === 'Manager';
    }

    public function isAdmin()
    {
        return $this->statut === 'Administrator';
    }

    public function updateLastLogin()
    {
        $this->last_login_at = now();
        $this->save();
    }
}