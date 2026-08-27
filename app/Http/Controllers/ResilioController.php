<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ResilioController extends Controller
{
    public function index()
    {
        return Inertia::render('Resilio/Dashboard', [
            'predicted_data' => session('predicted_data', null)
        ]);
    }

    public function predict(Request $request)
    {
        $validated = $request->validate([
            'disaster_type' => 'required|string',
            'affected_population' => 'required|integer|min:1',
            'severity_level' => 'required|integer|min:1|max:5',
        ]);

        try {
            // Forward request to Python Predictive Microservice
            $response = Http::timeout(10)->post('http://localhost:8001/api/v1/predict-logistics', $validated);
            
            if ($response->successful()) {
                return back()->with('predicted_data', $response->json()['data']);
            }
            
            return back()->withErrors(['api_error' => 'Gagal menghubungi layanan prediktif AI.']);
        } catch (\Exception $e) {
            return back()->withErrors(['api_error' => 'Kesalahan sistem internal: ' . $e->getMessage()]);
        }
    }
}
