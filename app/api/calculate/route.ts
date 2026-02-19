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

        const taxResult = ScenarioEngine.calculateTaxRequest(result.data);

        return NextResponse.json(taxResult);
    } catch (error) {
        console.error('Calculation Error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate tax' },
            { status: 400 }
        );
    }
}
