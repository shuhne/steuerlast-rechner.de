import { NextRequest, NextResponse } from 'next/server';
import { ScenarioEngine } from '../../../lib/tax/scenario_engine';
import { TaxRequest } from '../../../lib/tax/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const taxRequest = body as TaxRequest;

        const result = ScenarioEngine.calculateTaxRequest(taxRequest);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Calculation Error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate tax' },
            { status: 400 }
        );
    }
}
