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
        console.error('Simulation Error:', error);
        return NextResponse.json(
            { error: 'Failed to run simulation' },
            { status: 400 }
        );
    }
}
