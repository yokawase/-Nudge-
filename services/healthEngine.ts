import { UserData, SimulationResult, EconomicValue } from '../types';
import { CONST_EX_MALE, CONST_EX_FEMALE, CONST_QX_MALE, CONST_QX_FEMALE, ANNUAL_HOURS, RETIREMENT_AGE, WAGE_STATS } from '../constants';
import { calculateStomachRisk } from './stomachCancerEngine';

interface Factor { label: string; hr: number; }

const simulate = (startAge: number, sex: 'male' | 'female', hr: number) => {
    const qx_data = (sex === 'male') ? CONST_QX_MALE : CONST_QX_FEMALE;
    let lx = 1.0;
    let le = 0.0;
    const curve: number[] = [];
    const safeStartAge = Math.min(startAge, qx_data.length - 1);

    for (let t = safeStartAge; t < 115; t++) {
        let q_base = (t < qx_data.length) ? qx_data[t] : 1.0;
        let q_adj = 1 - Math.pow((1 - q_base), hr);
        if (q_adj > 1.0) q_adj = 1.0;
        const lx_next = lx * (1 - q_adj);
        le += (lx + lx_next) / 2.0;
        curve.push(lx);
        lx = lx_next;
        if (lx < 0.0001) break;
    }
    return { le, curve };
};

const calculateExpectedEarnings = (age: number, curve: number[]): EconomicValue => {
    let sumMean = 0;
    let sumMin = 0;
    let sumMax = 0;
    const yearsToWork = Math.max(0, RETIREMENT_AGE - age);
    
    for (let i = 0; i < yearsToWork; i++) {
        const probAlive = curve[i] || 0;
        const workHours = ANNUAL_HOURS;
        sumMean += probAlive * WAGE_STATS.MEAN * workHours;
        sumMin += probAlive * WAGE_STATS.LOWER * workHours;
        sumMax += probAlive * WAGE_STATS.UPPER * workHours;
    }
    return { value: sumMean, min: sumMin, max: sumMax };
};

export const runHealthAnalysis = (data: UserData): SimulationResult => {
    const { age, sex, height, weight } = data;
    const ex_table = (sex === 'male') ? CONST_EX_MALE : CONST_EX_FEMALE;
    const official_ex = (age < ex_table.length) ? ex_table[age] : 0;

    let factors: Factor[] = [];
    let hr_total = 1.0;

    // --- Evidence-Based HR Parameters Update (2025/12/04) ---
    // Based on JPHC, JACC, and other Japanese cohort studies.

    if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        if (bmi < 18.5) {
            // エンジニアリング・ノートに基づく実装:
            // 高齢者（>75歳）の場合、予備能欠如（フレイル）により感染症等の侵襲に対する抵抗力が下がるため、
            // 低体重のリスクを HR 1.6 -> 1.8 へ動的にブーストする。
            const isElderly = age >= 75;
            const hr = isElderly ? 1.8 : 1.6;
            const label = isElderly ? "低体重(フレイル)" : "低体重";
            factors.push({ label, hr });
        }
        else if (bmi >= 30) factors.push({ label: "肥満(重)", hr: 1.35 }); // Updated from 1.3
        else if (bmi >= 25) factors.push({ label: "肥満(軽)", hr: 1.1 }); // Validated
    }

    // Alcohol
    if (data.alcohol === 'moderate') factors.push({ label: "適度飲酒(Bonus)", hr: 0.9 });
    else if (data.alcohol === 'heavy') factors.push({ label: "多量飲酒", hr: 1.55 }); // Updated from 1.4 (J-curve ends)

    // Smoking (Updated with Count-based HR)
    if (data.smoking === 'never') factors.push({ label: "非喫煙(Bonus)", hr: 0.85 });
    else if (data.smoking === 'past') factors.push({ label: "過去喫煙", hr: 1.35 });
    else {
        // 現在喫煙: 本数によるリスク層別化
        const count = data.cigarettesPerDay || 20;
        let smokeHr = 1.7; // Default average
        let label = `現在喫煙(${count}本)`;
        
        if (count < 10) {
            smokeHr = 1.3;
            label = `現在喫煙(軽/${count}本)`;
        } else if (count >= 20) {
            smokeHr = 2.2;
            label = `現在喫煙(重/${count}本)`;
        }
        factors.push({ label, hr: smokeHr });
    }

    // Exercise
    if (data.exercise === 'yes') factors.push({ label: "運動習慣(Bonus)", hr: 0.85 });
    else factors.push({ label: "運動不足", hr: 1.2 }); // Updated from 1.1

    // Sleep
    if (data.sleep === 'short') factors.push({ label: "睡眠不足(<6h)", hr: 1.12 }); // Validated
    else if (data.sleep === 'long') factors.push({ label: "過眠(>9h)", hr: 1.25 }); // Validated

    // Social
    if (data.social === 'isolated') factors.push({ label: "社会的孤立", hr: 1.3 }); // Updated from 1.29
    else if (data.social === 'active') factors.push({ label: "活発な交流(Bonus)", hr: 0.95 });

    // Diet
    if (data.diet === 'poor') factors.push({ label: "野菜不足", hr: 1.15 }); // Updated from 1.1
    else if (data.diet === 'good') factors.push({ label: "食生活良好(Bonus)", hr: 0.95 });

    // Meds
    if (data.polypharmacy === '1-4') factors.push({ label: "内服薬あり", hr: 1.1 });
    else if (data.polypharmacy === '5+') factors.push({ label: "多剤併用", hr: 1.3 }); // Validated

    // Pylori (Major Update: All-cause mortality risk is low compared to stomach cancer risk)
    if (data.pylori === 'negative') factors.push({ label: "ピロリ未感染(Bonus)", hr: 0.98 });
    else if (data.pylori === 'current') factors.push({ label: "ピロリ現感染", hr: 1.05 }); // Updated from 1.28
    else if (data.pylori === 'eradicated') factors.push({ label: "ピロリ除菌済", hr: 1.0 }); // Neutral

    // Medical History
    if (data.fam_cancer) factors.push({ label: "がん家族歴", hr: 1.1 });
    if (data.parent_long) factors.push({ label: "親が長寿(Bonus)", hr: 0.85 });
    if (data.allergy) factors.push({ label: "アレルギー体質", hr: 1.0 }); // Neutral

    if (data.hist_cancer) factors.push({ label: "がん既往", hr: 1.4 }); // Validated
    if (data.hist_stroke) factors.push({ label: "脳卒中既往", hr: 2.0 }); // Validated
    if (data.hist_heart) factors.push({ label: "心疾患既往", hr: 1.8 }); // Validated

    if (data.dm) factors.push({ label: "糖尿病", hr: 1.75 }); // Updated from 1.3 (Critical update)
    if (data.htn) factors.push({ label: "高血圧", hr: 1.2 }); // Validated
    if (data.dl) factors.push({ label: "高脂血症", hr: 1.1 });
    if (data.inf_hep) factors.push({ label: "肝炎ウイルス", hr: 1.2 });
    if (data.inf_hpv) factors.push({ label: "HPV", hr: 1.05 });

    factors.forEach(f => hr_total *= f.hr);

    // --- Dampening & Cap Logic ---
    // If HR > 1.0, apply dampening to prevent unrealistic compounding (stacking) of risks
    if (hr_total > 1.0) {
        hr_total = 1.0 + (hr_total - 1.0) * 0.8;
    }

    // Safety caps
    hr_total = Math.min(hr_total, 2.8); // Slightly increased cap due to higher base HRs (e.g. Stroke + Diabetes)
    hr_total = Math.max(hr_total, 0.4);

    const sim_base = simulate(age, sex, 1.0);
    const bias = official_ex - sim_base.le;
    const sim_user = simulate(age, sex, hr_total);
    const final_le = Math.max(0.1, sim_user.le + bias);
    const diff = final_le - official_ex;

    let median_age = age + final_le;
    if (sim_user.curve && sim_user.curve.length > 0) {
        for (let i = 0; i < sim_user.curve.length; i++) {
            if (sim_user.curve[i] <= 0.5) {
                const prev = i > 0 ? sim_user.curve[i - 1] : 1.0;
                const curr = sim_user.curve[i];
                const frac = (prev - 0.5) / (prev - curr);
                median_age = (age + i - 1) + frac;
                break;
            }
        }
    }

    let hr_ideal = 1.0;
    const immutable_factors = ['がん家族歴', '親が長寿(Bonus)', 'がん既往', '脳卒中既往', '心疾患既往', '糖尿病', '高血圧', '高脂血症', 'アレルギー体質'];
    factors.forEach(f => {
        if (immutable_factors.includes(f.label)) hr_ideal *= f.hr;
        else if (f.label.includes("Bonus")) hr_ideal *= f.hr;
    });

    // Calculate potential gain by removing modifiable risks
    if (data.smoking !== 'never') hr_ideal *= 0.85; 
    if (data.exercise !== 'yes') hr_ideal *= 0.85; 
    if (data.alcohol === 'heavy') hr_ideal *= 0.9;
    if (data.sleep !== 'optimal') hr_ideal *= 0.95; 
    if (data.diet === 'poor') hr_ideal *= 0.95; 
    if (data.social === 'isolated') hr_ideal *= 0.9; 
    
    if (hr_ideal > 1.0) hr_ideal = 1.0 + (hr_ideal - 1.0) * 0.8;
    hr_ideal = Math.min(hr_ideal, 2.5);
    hr_ideal = Math.max(hr_ideal, 0.4);

    const sim_ideal = simulate(age, sex, hr_ideal);
    const earningsCurrent = calculateExpectedEarnings(age, sim_user.curve);
    const earningsAvg = calculateExpectedEarnings(age, sim_base.curve);
    const earningsIdeal = calculateExpectedEarnings(age, sim_ideal.curve);

    const currentLoss = {
        value: Math.max(0, earningsAvg.value - earningsCurrent.value),
        min: Math.max(0, earningsAvg.min - earningsCurrent.min),
        max: Math.max(0, earningsAvg.max - earningsCurrent.max)
    };
    const potentialGain = {
        value: Math.max(0, earningsIdeal.value - earningsCurrent.value),
        min: Math.max(0, earningsIdeal.min - earningsCurrent.min),
        max: Math.max(0, earningsIdeal.max - earningsCurrent.max)
    };

    const chartData = sim_user.curve.map((prob, i) => ({
        age: age + i,
        survival: prob,
        avgSurvival: sim_base.curve[i] || 0
    })).filter((_, i) => (age + i) <= 105);

    const factorImpacts = factors.map(f => {
        const sim_f = simulate(age, sex, f.hr);
        return { label: f.label, hr: f.hr, impact: (sim_f.le + bias) - official_ex };
    }).sort((a, b) => b.impact - a.impact);

    const stomachRisk = calculateStomachRisk(data);

    return {
        le: parseFloat(final_le.toFixed(2)),
        lifespan: parseFloat((age + final_le).toFixed(1)),
        median: parseFloat(median_age.toFixed(1)),
        diff: parseFloat(diff.toFixed(2)),
        official: parseFloat(official_ex.toFixed(2)),
        curve: chartData,
        economic: { currentLoss, potentialGain, workYearsAvg: 0, workYearsCurrent: 0 },
        factors: factorImpacts,
        stomachRisk
    };
};