<?php

return [
    /*
    |--------------------------------------------------------------------------
    | InstantDB Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the InstantDB bridge service integration
    |
    */

    'instantdb' => [
        'bridge_url' => env('INSTANTDB_BRIDGE_URL', 'http://localhost:3001'),
        'api_key' => env('INSTANTDB_API_KEY'),
        'timeout' => env('INSTANTDB_TIMEOUT', 30),
        'connect_timeout' => env('INSTANTDB_CONNECT_TIMEOUT', 10),
    ],
];
