
import React, { useEffect, useState } from 'react';
import { SimulationResult, UserData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, Share2, Copy, HeartPulse, Download, Activity, Send, ThumbsUp, AlertTriangle, Mail, Info, ChevronDown, ChevronUp, Check, X as XIcon, Twitter, MessageCircle, MoreHorizontal } from 'lucide-react';
import StomachCancerRisk from './StomachCancerRisk';

interface Props { result: SimulationResult; userData: UserData; }

// HR一覧表示用コンポーネント
const RiskFactorTable = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mt-4 border-t border-slate-100 pt-2">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors mx-auto">
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>エビデンスに基づくリスク強度(HR)を確認する</span>
            </button>
            {isOpen && (
                <div className="mt-3 overflow-x-auto animate-fade-in">
                    <table className="w-full text-xs text-left text-slate-600 border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr><th className="p-2">リスク因子</th><th className="p-2 text-center">強度(HR)</th><th className="p-2">備考</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr><td className="p-2 font-bold text-red-600">脳卒中既往</td><td className="p-2 text-center font-bold">2.00</td><td className="p-2">再発リスク大</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">心疾患既往</td><td className="p-2 text-center font-bold">1.80</td><td className="p-2">心不全リスク含む</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">低体重(フレイル)</td><td className="p-2 text-center font-bold">1.80</td><td className="p-2">75歳以上の場合</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">糖尿病</td><td className="p-2 text-center font-bold">1.75</td><td className="p-2">全死亡リスクへの影響大</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">現在喫煙</td><td className="p-2 text-center font-bold">1.70</td><td className="p-2">最大の予防可能因子</td></tr>
                            <tr><td className="p-2 text-amber-600">低体重</td><td className="p-2 text-center font-bold">1.60</td><td className="p-2">BMI 18.5未満</td></tr>
                            <tr><td className="p-2 text-amber-600">多量飲酒</td><td className="p-2 text-center font-bold">1.55</td><td className="p-2">週450g以上</td></tr>
                            <tr><td className="p-2 text-amber-600">がん既往</td><td className="p-2 text-center font-bold">1.40</td><td className="p-2">サバイバーリスク</td></tr>
                            <tr><td className="p-2 text-amber-600">過去喫煙</td><td className="p-2 text-center font-bold">1.35</td><td className="p-2">残存リスクあり</td></tr>
                            <tr><td className="p-2 text-amber-600">社会的孤立</td><td className="p-2 text-center font-bold">1.30</td><td className="p-2">喫煙に匹敵するリスク</td></tr>
                        </tbody>
                    </table>
                    <div className="text-[10px] text-slate-400 mt-2 text-right">出典: JPHC Study, JACC Study, JAGES等に基づく推計</div>
                </div>
            )}
        </div>
    );
};

// Custom Share Modal Component
const ShareModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    shareText: string;
    appUrl: string;
    onCopy: () => void;
}> = ({ isOpen, onClose, shareText, appUrl, onCopy }) => {
    if (!isOpen) return null;

    const encodedText = encodeURIComponent(shareText);
    const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // Check if Web Share API is available
    const canUseWebShare = typeof navigator !== 'undefined' && !!navigator.share;

    const handleWebShare = async () => {
        try {
            await navigator.share({
                title: 'Precision Health 診断結果',
                text: shareText,
                url: appUrl,
            });
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">診断結果をシェア</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-[#06c755] text-white rounded-lg hover:opacity-90 transition-opacity gap-2">
                        <MessageCircle className="w-8 h-8" />
                        <span className="font-bold text-sm">LINE</span>
                    </a>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-black text-white rounded-lg hover:opacity-90 transition-opacity gap-2">
                        <Twitter className="w-8 h-8" />
                        <span className="font-bold text-sm">X (Twitter)</span>
                    </a>
                    <button onClick={() => { onCopy(); onClose(); }} className="flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors gap-2">
                        <Copy className="w-8 h-8 text-slate-500" />
                        <span className="font-bold text-sm">コピー</span>
                    </button>
                    {canUseWebShare ? (
                        <button onClick={handleWebShare} className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors gap-2">
                            <MoreHorizontal className="w-8 h-8" />
                            <span className="font-bold text-sm">その他のアプリ</span>
                        </button>
                    ) : (
                         <div className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-lg gap-2 opacity-50 cursor-not-allowed">
                            <MoreHorizontal className="w-8 h-8 text-slate-300" />
                            <span className="font-bold text-xs text-slate-400">その他 (未対応)</span>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 text-xs text-slate-400 text-center border-t border-slate-100">
                    Precision Health Manager
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<Props> = ({ result, userData }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const formatMoney = (val: number) => `¥${Math.floor(val).toLocaleString()}`;
  const formatRange = (min: number, max: number) => `変動範囲: ${formatMoney(min)} 〜 ${formatMoney(max)}`;
  const dSign = result.diff >= 0 ? "+" : "";
  const shareText = `【Precision Health】診断結果\n年齢: ${userData.age}歳\n推定余命: ${result.le}年\n平均との差: ${dSign}${result.diff}年\n寿命中央値: ${result.median}歳\n#PrecisionHealth #健康資産`;
  const appUrl = "https://precision-health.netlify.app/";

  const showActionFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
      setActionFeedback({ msg, type });
      setTimeout(() => setActionFeedback(null), 3000);
  };

  const copyResult = async (silent = false) => {
    const text = `精密余命予測結果\n年齢: ${userData.age}歳\n推定余命: ${result.le}年\n寿命中央値: ${result.median}歳\n平均との差: ${dSign}${result.diff}年\n${appUrl}`;
    
    const success = () => !silent && showActionFeedback("クリップボードにコピーしました");
    const fail = () => !silent && showActionFeedback("コピーに失敗しました", 'error');

    // 1. Try Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            success();
            return;
        } catch (e) {
            console.warn("Clipboard API failed, trying fallback...", e);
        }
    }

    // 2. Fallback: execCommand
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Mobile/iOS friendly hidden style
        textArea.style.position = "fixed";
        textArea.style.left = "0";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";
        textArea.setAttribute("readonly", ""); // Prevent keyboard
        
        document.body.appendChild(textArea);
        
        // Select text
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // iOS fix
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            success();
        } else {
            fail();
        }
    } catch (err) {
        console.error("Copy fallback failed:", err);
        fail();
    }
  };

  const handleDownloadReport = () => {
    const dateStr = new Date().toLocaleDateString("ja-JP");
    const bmi = (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1);
    const reportContent = `
============================================
Precision Health Manager レポート
発行日: ${dateStr}
URL: https://precision-health.netlify.app/
============================================
[基本情報]
年齢: ${userData.age}歳 / 性別: ${userData.sex === 'male' ? '男性' : '女性'}
BMI: ${bmi}

[分析結果]
推定余命: ${result.le} 年 (寿命: ${result.lifespan} 歳)
平均差: ${dSign}${result.diff} 年

[経済的価値]
損失: ${result.economic.currentLoss.value === 0 ? 'なし' : '-' + formatMoney(result.economic.currentLoss.value)}
(範囲: ${formatMoney(result.economic.currentLoss.min)} - ${formatMoney(result.economic.currentLoss.max)})
改善余地: ${result.economic.potentialGain.value === 0 ? 'なし' : '+' + formatMoney(result.economic.potentialGain.value)}
(範囲: ${formatMoney(result.economic.potentialGain.min)} - ${formatMoney(result.economic.potentialGain.max)})

[詳細]
${result.factors.map(f => `・${f.label}: ${f.impact > 0 ? '+' : ''}${f.impact.toFixed(1)}年`).join('\n')}
============================================`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${dateStr.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFeedbackSubmit = () => {
    if(!feedbackText.trim()) return;
    console.log("Feedback collected (Simulated API):", feedbackText);
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackText(""); }, 3000);
  };

  useEffect(() => { document.getElementById('dashboard-root')?.scrollIntoView({ behavior: 'smooth' }); }, [result]);

  const getAiAdvice = () => {
    // リスク因子ごとの推奨アクション定義
    const adviceMap: Record<string, string> = {
      "現在喫煙": "禁煙",
      "運動不足": "運動習慣の定着",
      "多量飲酒": "節酒",
      "肥満(重)": "減量",
      "肥満(軽)": "体重コントロール",
      "野菜不足": "毎食の野菜摂取",
      "睡眠不足(<6h)": "睡眠時間の確保",
      "過眠(>9h)": "睡眠リズムの調整",
      "社会的孤立": "社会参加・交流",
      "ピロリ現感染": "ピロリ菌除菌",
      "糖尿病": "血糖コントロール",
      "高血圧": "血圧管理",
      "高脂血症": "脂質管理",
      "低体重": "栄養摂取",
      "低体重(フレイル)": "栄養摂取・筋力維持"
    };

    // 影響度がマイナスのものを抽出し、マイナス幅が大きい順（昇順）にソートして、上位のアクションを取得
    const riskFactors = result.factors
      .filter(f => f.impact < 0 && adviceMap[f.label])
      .sort((a, b) => a.impact - b.impact);

    // リスク因子がない場合は称賛（経済的損失の有無に関わらず、健康状態が良いとみなす）
    if (riskFactors.length === 0) {
         return <span>素晴らしい健康管理です！現在の生活習慣はあなたの強力な資産になっています。</span>;
    }

    const topRisks = riskFactors.slice(0, 2).map(f => adviceMap[f.label]);
    const uniqueRisks = Array.from(new Set(topRisks));
    const adviceList = uniqueRisks.join("・");

    if (result.economic.potentialGain.value > 0) {
        return <span>あなたの体にはまだ<span className="font-bold text-blue-600 text-lg mx-1">{formatMoney(result.economic.potentialGain.value)}</span>分の「伸びしろ」があります！特に「{adviceList}」に取り組むことで、健康資産を大きく取り戻せる可能性があります。</span>;
    } else {
        // 定年後などで経済的価値の算出対象外（または0）だが、リスクがある場合
        return <span>人生100年時代、健康こそが最大の資産です。健康寿命を延ばすために、特に「{adviceList}」の見直しをお勧めします。</span>;
    }
  };

  return (
    <div id="dashboard-root" className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 flex gap-4 items-start">
         <div className="bg-blue-200 p-3 rounded-full shrink-0 text-blue-700"><HeartPulse className="w-8 h-8" /></div>
         <div className="flex-1"><h4 className="font-bold text-blue-800 mb-1">AIヘルスコーチ</h4><div className="text-slate-800">{getAiAdvice()}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="推定余命 (あと何年)" value={result.le} unit="年" sub={`同年代平均: ${result.official}年`} />
        <MetricCard label="推定寿命" value={result.lifespan} unit="歳" sub={`生存確率50%到達年齢: ${result.median}歳`}/>
        <MetricCard label="平均との差 (健康ボーナス)" value={result.diff} unit="年" prefix={result.diff >= 0 ? "+" : ""} highlight={true} sub="生活習慣の積み重ねの結果"/>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> 寿命への影響因子（寄与年数）</div>
        <div className="space-y-3">
          {result.factors.map((f, i) => {
            const isPositive = f.impact >= 0;
            const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600';
            const barColor = isPositive ? 'bg-emerald-500' : 'bg-red-500';
            const width = Math.min(Math.abs(f.impact) * 8, 100);
            return (
              <div key={i} className="flex items-center text-sm">
                <div className="w-32 md:w-48 font-bold text-slate-600 truncate" title={f.label}>{f.label}</div>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${barColor} opacity-80`} style={{ width: `${width}%` }}/></div>
                <div className={`w-20 text-right font-mono font-bold ${colorClass}`}>{isPositive ? '+' : ''}{f.impact.toFixed(1)}年</div>
              </div>
            );
          })}
          {result.factors.length === 0 && <div className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded">特筆すべき影響因子はありません（標準的な健康状態です）</div>}
        </div>
        <RiskFactorTable />
        <div className="mt-4 text-xs text-slate-400 text-right">※各因子の平均寿命に対する単独影響度の目安です</div>
      </div>
      {userData.age >= 75 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
           <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-6 h-6 text-amber-600" /><h3 className="font-bold text-lg text-amber-800">後期高齢者の検診に関する重要なお知らせ</h3></div>
           <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>75歳以上の方に対するがん検診は、必ずしもすべてのケースで推奨されるわけではありません...</p>
              <div className="bg-white p-4 rounded border border-amber-100 shadow-sm">
                 <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">🌉 「老朽化した橋」の例え</h4>
                 <p className="text-slate-600 mb-2">75歳以上の検診は<strong>「老朽化した橋の交通規制」</strong>に似ています。</p>
                 <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                    <li><strong>現役世代（新しい橋）:</strong> 検診（通行）のメリットが大きく、修理をしてでも利用価値があります。</li>
                    <li><strong>後期高齢者（老朽化した橋）:</strong> 無理に検診（通行）を行うと、検査による事故や体への負担のリスクが高まる可能性があります。</li>
                 </ul>
                 <p className="mt-3 text-slate-600 bg-amber-50 p-2 rounded"><strong>結論:</strong> リスクを理解した上で、<strong>かかりつけ医と相談して決めること</strong>が重要です。</p>
              </div>
           </div>
        </div>
      )}
      {result.stomachRisk && <StomachCancerRisk result={result.stomachRisk} />}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-600" /> 経済的インパクト (65歳定年モデル)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-lg border ${result.economic.currentLoss.value === 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
             <div className={`font-bold text-sm mb-1 ${result.economic.currentLoss.value === 0 ? 'text-slate-600' : 'text-red-700'}`}>{result.economic.currentLoss.value === 0 ? '📊 労働価値損失なし' : '⚠️ 現在の推定労働価値損失'}</div>
             <div className={`text-3xl font-bold font-mono ${result.economic.currentLoss.value === 0 ? 'text-slate-600' : 'text-red-600'}`}>{result.economic.currentLoss.value === 0 ? '¥0' : `-${formatMoney(result.economic.currentLoss.value)}`}</div>
             {result.economic.currentLoss.value > 0 && <div className="text-[11px] text-red-500 mt-2 font-medium bg-red-100/50 p-1 rounded inline-block">📈 {formatRange(result.economic.currentLoss.min, result.economic.currentLoss.max)}</div>}
          </div>
          <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
             <div className="font-bold text-sm text-emerald-800 mb-1">💰 獲得可能な「追加ボーナス」</div>
             <div className="text-3xl font-bold font-mono text-emerald-600">+{formatMoney(result.economic.potentialGain.value)}</div>
             {result.economic.potentialGain.value > 0 && <div className="text-[11px] text-emerald-600 mt-2 font-medium bg-emerald-100/50 p-1 rounded inline-block">📈 {formatRange(result.economic.potentialGain.min, result.economic.potentialGain.max)}</div>}
          </div>
        </div>
        <div className="mt-3 text-[10px] text-slate-400 text-right">※平均年収(約460万円)と信頼区間(下限〜上限)に基づく確率的な時給換算値で算出</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> ライフコース・シミュレーション</div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.curve}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" unit="歳" />
              <YAxis domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} />
              <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '生存率']} labelFormatter={(l) => `${l}歳`} />
              <Legend />
              <ReferenceLine y={0.5} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: '50%', fontSize: 10 }} />
              <Line type="monotone" dataKey="survival" stroke="#2563eb" strokeWidth={3} dot={false} name="あなた" />
              <Line type="monotone" dataKey="avgSurvival" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="平均" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Feedback Section */}
      <div className="bg-slate-100 rounded-lg p-6 border border-slate-200">
         <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> この分析は役に立ちましたか？</h4>
         <p className="text-xs text-slate-500 mb-3">サービス改善のため、一言フィードバックを頂けると幸いです（アプリ内で送信されます）。</p>
         <div className="flex gap-2">
            <input type="text" className="flex-1 p-2 border border-slate-300 rounded text-sm" placeholder="気になった点や改善要望を入力..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}/>
            <button onClick={handleFeedbackSubmit} disabled={feedbackSent} className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${feedbackSent ? 'bg-green-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{feedbackSent ? <Send className="w-4 h-4" /> : '送信'}</button>
         </div>
         {feedbackSent && <span className="text-xs text-green-600 mt-2 block">フィードバックを送信しました。ありがとうございます！</span>}
      </div>

      {/* Action Buttons with Feedback */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors">
                <Share2 className="w-5 h-5" /> 結果をシェア
            </button>
            <button onClick={() => copyResult(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-600 text-white font-bold rounded-lg shadow hover:bg-slate-700 transition-colors">
                <Copy className="w-5 h-5" /> 結果をコピー
            </button>
            <button onClick={handleDownloadReport} className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl">Pro Feature</div>
                <Download className="w-5 h-5" /> レポート保存 (.txt)
            </button>
        </div>
        {/* Action Feedback Toast */}
        {actionFeedback && (
            <div className={`text-center text-sm font-bold py-2 rounded animate-fade-in ${actionFeedback.type === 'error' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                {actionFeedback.type === 'success' && <Check className="w-4 h-4 inline mr-1" />}
                {actionFeedback.msg}
            </div>
        )}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        shareText={shareText} 
        appUrl={appUrl}
        onCopy={() => copyResult(false)}
      />
      
      {/* Support Section */}
      <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-2">ご不明点や詳細なサポートが必要ですか？</p>
          <a href="mailto:support@precision-health.demo?subject=【Precision Health】お問い合わせ" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" />
              <span>メールサポート (Gmail等を起動)</span>
          </a>
      </div>
    </div>
  );
};
const MetricCard = ({ label, value, unit, sub, prefix = "", highlight }: any) => {
    return (
        <div className={`p-6 rounded-lg border text-center ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
           <div className="text-sm text-slate-500 mb-1">{label}</div>
           <div className="text-4xl font-black text-slate-800">{prefix}{value}<span className="text-lg font-bold ml-1">{unit}</span></div>
           <div className="text-xs text-slate-400 mt-2">{sub}</div>
        </div>
    )
}
export default Dashboard;
