<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InstantDBService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    private InstantDBService $instantDB;

    public function __construct(InstantDBService $instantDB)
    {
        $this->instantDB = $instantDB;
    }

    /**
     * Get sync events
     */
    public function getSyncEvents(Request $request): JsonResponse
    {
        try {
            $limit = $request->integer('limit', 50);
            $events = $this->instantDB->getSyncEvents($limit);

            return response()->json([
                'success' => true,
                'data' => $events,
                'count' => count($events),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new sync event
     */
    public function createSyncEvent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:write,conflict,resolved',
            'detail' => 'required|string|max:500',
            'metadata' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->instantDB->createSyncEvent(
                $request->string('type'),
                $request->string('detail'),
                $request->array('metadata', [])
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Sync event created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Execute custom query
     */
    public function query(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->instantDB->query($request->array('query'));

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get bridge service health status
     */
    public function health(): JsonResponse
    {
        $isHealthy = $this->instantDB->healthCheck();

        return response()->json([
            'success' => true,
            'bridge_service_healthy' => $isHealthy,
            'timestamp' => now()->toISOString(),
        ], $isHealthy ? 200 : 503);
    }

    /**
     * Create authentication token for InstantDB
     */
    public function createAuthToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $token = $this->instantDB->createAuthToken($request->string('email'));

            return response()->json([
                'success' => true,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
