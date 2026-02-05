/**
 * Inflation Calculator Utility
 * Calculates purchasing power over time based on historical and projected inflation rates.
 */

// Historical German inflation rates (sources: Destatis, Länderdaten.info, Finanz-Tools.de)
export const INFLATION_RATES: Record<number, number> = {
    1970: 3.45, 1971: 5.24, 1972: 5.48, 1973: 7.03, 1974: 6.99,
    1975: 5.91, 1976: 4.25, 1977: 3.73, 1978: 2.72, 1979: 4.04,
    1980: 5.40, 1981: 6.30, 1982: 5.30, 1983: 3.30, 1984: 2.40,
    1985: 2.10, 1986: -0.10, 1987: 0.20, 1988: 1.30, 1989: 2.80,
    1990: 2.70, 1991: 3.50, 1992: 5.00, 1993: 4.50, 1994: 2.70,
    1995: 1.90, 1996: 1.40, 1997: 1.90, 1998: 0.80, 1999: 0.70,
    2000: 1.30, 2001: 2.00, 2002: 1.40, 2003: 1.00, 2004: 1.60,
    2005: 1.60, 2006: 1.60, 2007: 2.30, 2008: 2.60, 2009: 0.30,
    2010: 1.00, 2011: 2.20, 2012: 1.90, 2013: 1.50, 2014: 1.00,
    2015: 0.50, 2016: 0.50, 2017: 1.50, 2018: 1.80, 2019: 1.40,
    2020: 0.50, 2021: 3.10, 2022: 6.90, 2023: 5.90, 2024: 2.20,
    2025: 2.20,
};

// Assumed future inflation rate (EZB target)
export const FUTURE_INFLATION = 2.0;

// Current reference year for calculations
export const CURRENT_YEAR = 2026;

export interface ChartDataPoint {
    year: number;
    kaufkraft?: number;
    kaufkraftFuture?: number;
    inflationRate: number;
}

/**
 * Builds chart data showing purchasing power over time.
 * Past years show what current salary would have been worth.
 * Future years show projected purchasing power loss due to inflation.
 */
export function buildChartData(annualGross: number, startYear = 2000, endYear = 2055): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];

    for (let year = startYear; year <= endYear; year++) {
        let cumulativeFactor = 1.0;

        if (year < CURRENT_YEAR) {
            // Past: Calculate what today's salary would have been worth
            for (let y = year; y < CURRENT_YEAR; y++) {
                const rate = INFLATION_RATES[y] ?? FUTURE_INFLATION;
                cumulativeFactor *= (1 + rate / 100);
            }
            data.push({
                year,
                kaufkraft: Math.round(annualGross * cumulativeFactor),
                inflationRate: INFLATION_RATES[year] ?? FUTURE_INFLATION,
            });
        } else if (year === CURRENT_YEAR) {
            // Present: Current value
            data.push({
                year,
                kaufkraft: annualGross,
                kaufkraftFuture: annualGross,
                inflationRate: INFLATION_RATES[year] ?? FUTURE_INFLATION,
            });
        } else {
            // Future: Calculate projected purchasing power loss
            for (let y = CURRENT_YEAR; y < year; y++) {
                const rate = INFLATION_RATES[y] ?? FUTURE_INFLATION;
                cumulativeFactor *= (1 + rate / 100);
            }
            data.push({
                year,
                kaufkraftFuture: Math.round(annualGross / cumulativeFactor),
                inflationRate: FUTURE_INFLATION,
            });
        }
    }

    return data;
}

/**
 * Calculates the purchasing power loss percentage for a given target year.
 * Returns a value between 0 and 100.
 */
export function calculatePurchasingPowerLoss(annualGross: number, targetYear: number): number {
    if (targetYear <= CURRENT_YEAR) {
        return 0;
    }

    const data = buildChartData(annualGross, CURRENT_YEAR, targetYear);
    const futurePoint = data.find(d => d.year === targetYear);

    if (!futurePoint?.kaufkraftFuture) {
        return 0;
    }

    return Math.round((1 - futurePoint.kaufkraftFuture / annualGross) * 100);
}

/**
 * Calculates the cumulative inflation factor between two years.
 * A factor of 1.5 means prices have increased by 50%.
 */
export function calculateInflationFactor(fromYear: number, toYear: number): number {
    if (fromYear >= toYear) {
        return 1.0;
    }

    let factor = 1.0;
    for (let y = fromYear; y < toYear; y++) {
        const rate = INFLATION_RATES[y] ?? FUTURE_INFLATION;
        factor *= (1 + rate / 100);
    }

    return factor;
}
