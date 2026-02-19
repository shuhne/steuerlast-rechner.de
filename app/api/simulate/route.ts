import { NextRequest, NextResponse } from 'next/server';
import { ScenarioEngine } from '../../../lib/tax/scenario_engine';
import { TaxRequestSchema } from '../../../lib/tax/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = TaxRequestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Ungültige Eingabe', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const simulationResult = ScenarioEngine.runScenarios(result.data);

        return NextResponse.json(simulationResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV !== 'production') {
            console.error('Simulation Error:', error);
        } else {
            console.error('Simulation Error:', message);
        }
        return NextResponse.json(
            { error: 'Failed to run simulation' },
            { status: 500 }
        );
    }
}
