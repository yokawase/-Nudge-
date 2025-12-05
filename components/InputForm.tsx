import React from 'react';
import { UserData, Sleep, Social, Diet, Pylori, AtrophicGastritis, Polypharmacy } from '../types';
import { User, Activity, FileText, Calculator, HelpCircle, Cigarette } from 'lucide-react';

interface Props {
  data: UserData;
  onChange: (data: UserData) => void;
  onAnalyze: () => void;
}

const TooltipLabel: React.FC<{ label: string; tooltip: string; color?: string }> = ({ label, tooltip, color = "text-slate-600" }) => (
  <div className="flex items-center gap-2 mb-2 group relative">
    <label className={`block text-sm font-bold ${color}`}>{label}</label>
    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-10 leading-relaxed">
      {tooltip}
      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const InputForm: React.FC<Props> = ({ data, onChange, onAnalyze }) => {
  const handleChange = <K extends keyof UserData>(key: K, value: UserData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const getBMI = () => {
    if (data.height > 0 && data.weight > 0) return (data.weight / Math.pow(data.height / 100, 2)).toFixed(1);
    return "--";
  };

  const bmi = parseFloat(getBMI());
  let bmiLabel = "(標準)", bmiColor = "text-emerald-600";
  if (bmi < 18.5) { bmiLabel = "(低体重)"; bmiColor = "text-red-500"; }
  else if (bmi >= 25 && bmi < 30) { bmiLabel = "(肥満 1度)"; bmiColor = "text-amber-500"; }
  else if (bmi >= 30) { bmiLabel = "(肥満 2度以上)"; bmiColor = "text-red-600"; }

  const historyItems: { k: keyof UserData; l: string; risk?: boolean }[] = [
    { k: 'hist_cancer', l: 'がん既往(手術歴)', risk: true },
    { k: 'hist_stroke', l: '脳卒中', risk: true },
    { k: 'hist_heart', l: '心筋梗塞/狭心症', risk: true },
    { k: 'dm', l: '糖尿病' },
    { k: 'htn', l: '高血圧' },
    { k: 'dl', l: '高脂血症' },
    { k: 'inf_hep', l: '肝炎ウイルス(B/C)' },
    { k: 'inf_hpv', l: 'HPV(ヒトパピローマ)' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <User className="w-5 h-5 text-blue-600" /> 基本プロフィール
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">年齢</label>
            <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.age} onChange={(e) => handleChange('age', parseInt(e.target.value))}>
              {Array.from({ length: 81 }, (_, i) => i + 20).map(age => <option key={age} value={age}>{age} 歳</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">性別</label>
            <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.sex} onChange={(e) => handleChange('sex', e.target.value as any)}>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">身長 (cm)</label>
            <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={data.height || ''} onChange={(e) => handleChange('height', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="例: 170" />
          </div>
          <div className="form-group">
            <label className="block text-sm font-bold text-slate-600 mb-2">体重 (kg)</label>
            <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={data.weight || ''} onChange={(e) => handleChange('weight', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="例: 65" />
          </div>
        </div>
        <div className="text-right mt-2 text-sm text-slate-500">BMI: <span className="font-bold text-slate-800">{getBMI()}</span> <span className={bmiColor}>{bmiLabel}</span></div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <Activity className="w-5 h-5 text-blue-600" /> 生活習慣・社会的因子
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">飲酒習慣</label>
              <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.alcohol} onChange={(e) => handleChange('alcohol', e.target.value as any)}><option value="none">飲まない</option><option value="moderate">適度 (1日1合程度)</option><option value="heavy">多量 (週450g以上)</option></select>
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">喫煙歴</label>
              <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.smoking} onChange={(e) => handleChange('smoking', e.target.value as any)}><option value="never">吸わない (生涯非喫煙)</option><option value="past">過去に吸っていた</option><option value="current">吸っている</option></select>
              {data.smoking === 'current' && (
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <div className="flex items-center gap-1"><Cigarette className="w-3 h-3" /> 1日の本数</div>
                    <span className="text-blue-600 text-base">{data.cigarettesPerDay}本</span>
                  </label>
                  <input type="range" min="1" max="60" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={data.cigarettesPerDay} onChange={(e) => handleChange('cigarettesPerDay', parseInt(e.target.value))} />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>1本</span><span>30本</span><span>60本</span></div>
                </div>
              )}
           </div>
           <div><label className="block text-sm font-bold text-slate-600 mb-2">運動習慣 (週2回以上)</label><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.exercise} onChange={(e) => handleChange('exercise', e.target.value as any)}><option value="yes">あり</option><option value="no">なし</option></select></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
           <div><TooltipLabel label="睡眠時間" tooltip="平均的な睡眠時間です。6時間未満や9時間以上は健康リスクを高める可能性があります。" /><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.sleep} onChange={(e) => handleChange('sleep', e.target.value as Sleep)}><option value="optimal">6〜8時間 (最適)</option><option value="short">6時間未満 (不足)</option><option value="long">9時間以上 (過多)</option></select></div>
           <div><TooltipLabel label="社会的つながり" tooltip="家族や友人との交流頻度や、孤独感の有無です。社会的孤立は喫煙と同等のリスクがあるとされています。" /><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.social} onChange={(e) => handleChange('social', e.target.value as Social)}><option value="active">活発 (毎日交流あり)</option><option value="moderate">普通 (週数回程度)</option><option value="isolated">孤立気味 (ほとんどない)</option></select></div>
           <div><TooltipLabel label="野菜摂取" tooltip="バランスの良い食事の指標です。1日350g以上の野菜摂取が推奨されています。" /><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.diet} onChange={(e) => handleChange('diet', e.target.value as Diet)}><option value="good">十分 (1日350g以上)</option><option value="average">普通</option><option value="poor">不足 (野菜をあまり食べない)</option></select></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"><input type="checkbox" className="w-4 h-4 mr-2" checked={data.fam_cancer} onChange={(e) => handleChange('fam_cancer', e.target.checked)} /><span className="text-sm">がん家族歴(第1近親)</span></label>
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"><input type="checkbox" className="w-4 h-4 mr-2" checked={data.parent_long} onChange={(e) => handleChange('parent_long', e.target.checked)} /><span className="text-sm">親が長寿(90歳~)</span></label>
           <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"><input type="checkbox" className="w-4 h-4 mr-2" checked={data.allergy} onChange={(e) => handleChange('allergy', e.target.checked)} /><span className="text-sm">アレルギー体質</span></label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
          <FileText className="w-5 h-5 text-blue-600" /> 既往歴・感染症・内服
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div><TooltipLabel label="ピロリ菌検査" tooltip="胃がんの最大のリスク要因です。未検査の場合は「不明」を選択してください。" color="text-rose-600"/><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.pylori} onChange={(e) => handleChange('pylori', e.target.value as Pylori)}><option value="unknown">検査未実施 / 不明</option><option value="negative">陰性 (未感染)</option><option value="eradicated">除菌済み</option><option value="current">陽性 (現感染)</option></select></div>
           <div><TooltipLabel label="萎縮性胃炎 (胃カメラ)" tooltip="胃粘膜が薄くなる現象で、胃がん発生の母地となります。胃カメラ検査で指摘されたことがありますか？" color="text-rose-600"/><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.atrophic_gastritis} onChange={(e) => handleChange('atrophic_gastritis', e.target.value as AtrophicGastritis)}><option value="unknown">検査未実施 / 不明</option><option value="yes">あり (要経過観察)</option><option value="no">なし</option></select></div>
           <div><TooltipLabel label="内服薬 (ポリファーマシー)" tooltip="5種類以上の薬を服用している状態（多剤併用）は、副作用や転倒のリスクを高める可能性があります。" /><select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={data.polypharmacy} onChange={(e) => handleChange('polypharmacy', e.target.value as Polypharmacy)}><option value="0">なし</option><option value="1-4">1〜4種類</option><option value="5+">5種類以上 (多剤併用)</option></select></div>
        </div>
        <label className="block font-bold text-slate-600 mb-2 text-sm">既往歴・感染症 (該当するものにチェック)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {historyItems.map((item) => (
             <label key={item.k} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${item.risk ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white border-slate-200 hover:bg-slate-50'}`}><input type="checkbox" className="w-4 h-4 mr-2" checked={!!(data as any)[item.k]} onChange={(e) => handleChange(item.k, e.target.checked)} /><span className="text-sm font-medium">{item.l}</span></label>
          ))}
        </div>
      </div>
      <button onClick={onAnalyze} className="w-full py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2"><Calculator className="w-5 h-5" /><span>健康資産と余命を分析する</span></button>
    </div>
  );
};
export default InputForm;