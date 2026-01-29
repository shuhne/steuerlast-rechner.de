import salaryData from '../data/salary_stats_2025.json';

// Extend Math interface for the polyfill
declare global {
    interface Math {
        erf(x: number): number;
    }
}

interface ComparisonData {
    age: number;
    medianMale: number;
    medianFemale: number;
}

interface UserComparisonResult {
    percentile: number; // 0-100
    diffToMedian: number; // Absolute difference to relevant peer group median
    diffToMedianPercent: number; // Percentage difference
    peerGroupMedian: number;
    peerGroupUpperQuartile: number; // Estimated 75th percentile
}

const SIGMA_LOG_NORMAL = 0.5; // Assumed standard deviation for income distribution

/**
 * Returns the estimated annual gross median salary for a specific age and gender.
 */
function getEstimatedMedian(age: number, gender: 'male' | 'female' | 'all'): number {
    const anchors = salaryData.anchors;
    const factors = salaryData.curve_factors as Record<string, number>;

    // Linear interpolation between defined age points
    const ages = Object.keys(factors).map(Number).sort((a, b) => a - b);

    // Find surrounding age points
    let lowerAge = ages[0];
    let upperAge = ages[ages.length - 1];

    for (let i = 0; i < ages.length - 1; i++) {
        if (age >= ages[i] && age <= ages[i + 1]) {
            lowerAge = ages[i];
            upperAge = ages[i + 1];
            break;
        }
    }

    // Handle out of bounds (clamp)
    if (age < lowerAge) lowerAge = ages[0];
    if (age > upperAge) upperAge = ages[ages.length - 1];

    const lowerFactor = factors[lowerAge.toString()];
    const upperFactor = factors[upperAge.toString()];

    // Interpolate factor
    let currentFactor = lowerFactor;
    if (upperAge !== lowerAge) {
        const ratio = (age - lowerAge) / (upperAge - lowerAge);
        currentFactor = lowerFactor + ratio * (upperFactor - lowerFactor);
    }

    // Select base anchor
    let baseAnchor = anchors.median_all;
    if (gender === 'male') baseAnchor = anchors.median_male;
    if (gender === 'female') baseAnchor = anchors.median_female;

    return Math.round(baseAnchor * currentFactor);
}

/**
 * Generates data for the Dual-Line Chart (Male/Female trends over age range).
 */
export function getChartData(): ComparisonData[] {
    const data: ComparisonData[] = [];
    for (let age = 18; age <= 67; age++) {
        data.push({
            age,
            medianMale: getEstimatedMedian(age, 'male'),
            medianFemale: getEstimatedMedian(age, 'female')
        });
    }
    return data;
}

/**
 * Calculates user's position relative to their age/gender peer group.
 */
export function getUserComparison(
    annualGross: number,
    age: number,
    gender: 'male' | 'female' | 'all' = 'all'
): UserComparisonResult {

    const peerMedian = getEstimatedMedian(age, gender);

    // 2. Calculate Percentile using Log-Normal CDF approximation
    // mu = ln(median)
    // z = (ln(x) - mu) / sigma
    const mu = Math.log(peerMedian);
    const z = (Math.log(annualGross) - mu) / SIGMA_LOG_NORMAL;

    // Standard Normal CDF approximation
    // Note: Math.erf might not exist in all environments, so we polyfill it below and use the extended interface
    const erfVal = Math.erf ? Math.erf(z / Math.sqrt(2)) : polyfillErf(z / Math.sqrt(2));
    const percentile = (1 + erfVal) / 2 * 100;

    // 3. Estimate Top Quartile (75th percentile)
    // z(0.75) ≈ 0.675
    const q3 = Math.exp(mu + 0.675 * SIGMA_LOG_NORMAL);

    return {
        percentile: Math.min(99.9, Math.max(0.1, percentile)), // Clamp 0.1 - 99.9
        diffToMedian: annualGross - peerMedian,
        diffToMedianPercent: ((annualGross - peerMedian) / peerMedian) * 100,
        peerGroupMedian: peerMedian,
        peerGroupUpperQuartile: Math.round(q3)
    };
}

// Internal polyfill function to avoid runtime errors if Math.erf is missing even with declaration
function polyfillErf(x: number): number {
    const p = 0.3275911;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

// Apply polyfill globally if needed
if (typeof Math.erf === 'undefined') {
    Math.erf = polyfillErf;
}
