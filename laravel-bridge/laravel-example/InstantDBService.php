<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class InstantDBService
{
    private Client $client;
    private string $bridgeUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);

        $this->bridgeUrl = config('services.instantdb.bridge_url', 'http://localhost:3001');
        $this->apiKey = config('services.instantdb.api_key');
    }

    /**
     * Query data from InstantDB
     */
    public function query(array $query): array
    {
        try {
            $response = $this->client->post("{$this->bridgeUrl}/query", [
                'headers' => $this->getHeaders(),
                'json' => ['query' => $query],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data['success']) {
                throw new \Exception('Query failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            return $data['data'];
        } catch (RequestException $e) {
            Log::error('InstantDB query failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Failed to query InstantDB: ' . $e->getMessage());
        }
    }

    /**
     * Create or update data in InstantDB
     */
    public function transact(array $operations): array
    {
        try {
            $response = $this->client->post("{$this->bridgeUrl}/transact", [
                'headers' => $this->getHeaders(),
                'json' => ['operations' => $operations],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data['success']) {
                throw new \Exception('Transaction failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            return $data['data'];
        } catch (RequestException $e) {
            Log::error('InstantDB transaction failed', [
                'operations' => $operations,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Failed to execute transaction: ' . $e->getMessage());
        }
    }

    /**
     * Create a sync event
     */
    public function createSyncEvent(string $type, string $detail, array $metadata = []): array
    {
        $eventData = [
            'timestamp' => now()->timestamp * 1000, // Convert to milliseconds
            'type' => $type,
            'detail' => $detail,
            'metadata' => $metadata,
            'source' => 'laravel',
        ];

        return $this->transact([
            [
                'table' => 'syncEvents',
                'action' => 'update',
                'data' => $eventData,
            ],
        ]);
    }

    /**
     * Get all sync events
     */
    public function getSyncEvents(int $limit = 100): array
    {
        $cacheKey = "instantdb_sync_events_{$limit}";

        return Cache::remember($cacheKey, 60, function () use ($limit) {
            $result = $this->query(['syncEvents' => []]);

            $events = collect($result['syncEvents'] ?? [])
                ->sortByDesc('timestamp')
                ->take($limit)
                ->values()
                ->all();

            return $events;
        });
    }

    /**
     * Create authentication token
     */
    public function createAuthToken(string $email): string
    {
        try {
            $response = $this->client->post("{$this->bridgeUrl}/auth/create-token", [
                'headers' => $this->getHeaders(),
                'json' => ['email' => $email],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data['success']) {
                throw new \Exception('Token creation failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            return $data['token'];
        } catch (RequestException $e) {
            Log::error('InstantDB auth token creation failed', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Failed to create auth token: ' . $e->getMessage());
        }
    }

    /**
     * Sign out user
     */
    public function signOut(array $params): bool
    {
        try {
            $response = $this->client->post("{$this->bridgeUrl}/auth/sign-out", [
                'headers' => $this->getHeaders(),
                'json' => $params,
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return $data['success'] ?? false;
        } catch (RequestException $e) {
            Log::error('InstantDB sign out failed', [
                'params' => $params,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get presence data for a room
     */
    public function getPresence(string $namespace, string $room): array
    {
        try {
            $response = $this->client->post("{$this->bridgeUrl}/presence", [
                'headers' => $this->getHeaders(),
                'json' => [
                    'namespace' => $namespace,
                    'room' => $room,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data['success']) {
                throw new \Exception('Presence query failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            return $data['data'];
        } catch (RequestException $e) {
            Log::error('InstantDB presence query failed', [
                'namespace' => $namespace,
                'room' => $room,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Health check for the bridge service
     */
    public function healthCheck(): bool
    {
        try {
            $response = $this->client->get("{$this->bridgeUrl}/health", [
                'headers' => $this->getHeaders(),
            ]);

            return $response->getStatusCode() === 200;
        } catch (RequestException $e) {
            Log::warning('InstantDB bridge health check failed', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get request headers
     */
    private function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        if ($this->apiKey) {
            $headers['X-API-Key'] = $this->apiKey;
        }

        return $headers;
    }
}
