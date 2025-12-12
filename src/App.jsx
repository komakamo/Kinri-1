import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  DollarSign,
  Globe,
  Pause,
  Play,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyle =
    'px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200',
    secondary: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm',
    ghost: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Slider = ({ label, value, onChange, min, max, step, suffix = '%', color = 'indigo' }) => (
  <div className="mb-5 group">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{label}</span>
      <span
        className={`text-sm font-bold bg-${color}-50 text-${color}-600 px-2 py-0.5 rounded-md min-w-[3rem] text-right transition-colors`}
      >
        {value}
        {suffix}
      </span>
    </div>
    <div className="relative h-2 w-full rounded-full bg-slate-100">
      <div className={`absolute h-full rounded-full bg-${color}-500 opacity-20`} style={{ width: '100%' }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div
        className={`absolute h-full rounded-full bg-${color}-500 transition-all duration-75`}
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <div
        className={`absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-white border-2 border-${color}-500 shadow-sm transition-all duration-75 pointer-events-none`}
        style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
      />
    </div>
  </div>
);

const SimpleChart = ({ data, height = 150 }) => {
  if (!data || data.length < 2)
    return <div className="h-full flex items-center justify-center text-slate-400 text-sm">データ待機中...</div>;

  const maxVal = Math.max(...data) * 1.05;
  const minVal = Math.min(...data) * 0.95;
  const range = maxVal - minVal;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - minVal) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 ${points} L 100,100`} fill="url(#chartGradient)" stroke="none" />
        <polyline
          fill="none"
          stroke="#6366F1"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="100"
          cy={100 - ((data[data.length - 1] - minVal) / range) * 100}
          r="4"
          fill="#4F46E5"
          stroke="white"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default function InternationalFinanceSim() {
  const [isRunning, setIsRunning] = useState(true);
  const [domestic, setDomestic] = useState({
    name: '日本 (円)',
    interestRate: 0.1,
    inflation: 1.0,
    gdpGrowth: 1.0,
  });
  const [foreign, setForeign] = useState({
    name: '米国 (ドル)',
    interestRate: 4.5,
    inflation: 3.0,
    gdpGrowth: 2.0,
  });

  const [exchangeRate, setExchangeRate] = useState(100);
  const [history, setHistory] = useState([100]);
  const [capitalFlow, setCapitalFlow] = useState(0);
  const rateRef = useRef(100);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const interestDiff = domestic.interestRate - foreign.interestRate;
      const inflationDiff = domestic.inflation - foreign.inflation;
      const growthDiff = domestic.gdpGrowth - foreign.gdpGrowth;

      const interestPressure = -interestDiff * 0.05;
      const inflationPressure = inflationDiff * 0.05;
      const growthPressure = -growthDiff * 0.03;
      const totalPressure = interestPressure + inflationPressure + growthPressure;

      const noise = (Math.random() - 0.5) * 0.2;
      const currentRate = rateRef.current;
      const newRate = Math.max(50, Math.min(200, currentRate * (1 + (totalPressure + noise) * 0.1)));

      rateRef.current = newRate;
      setExchangeRate(newRate);
      setHistory((prev) => [...prev.slice(-49), newRate]);
      setCapitalFlow(totalPressure * 20);
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, domestic, foreign]);

  const applyScenario = (type) => {
    switch (type) {
      case 'tightening':
        setDomestic((prev) => ({ ...prev, interestRate: 4.0 }));
        setForeign((prev) => ({ ...prev, interestRate: 2.0 }));
        break;
      case 'crisis':
        setDomestic((prev) => ({ ...prev, inflation: 10.0, gdpGrowth: -2.0 }));
        break;
      case 'flight_to_quality':
        setForeign((prev) => ({ ...prev, gdpGrowth: 5.0, interestRate: 5.0 }));
        setDomestic((prev) => ({ ...prev, interestRate: 0.1 }));
        break;
      case 'reset':
        setDomestic({ name: '日本 (円)', interestRate: 0.1, inflation: 1.0, gdpGrowth: 1.0 });
        setForeign({ name: '米国 (ドル)', interestRate: 4.5, inflation: 3.0, gdpGrowth: 2.0 });
        setExchangeRate(100);
        setHistory([100]);
        rateRef.current = 100;
        break;
      default:
        break;
    }
  };

  const getRateStatus = () => {
    if (exchangeRate > 110) return { text: '円安 (Depreciation)', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (exchangeRate < 90) return { text: '円高 (Appreciation)', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    return { text: '安定 (Stable)', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  };

  const status = getRateStatus();

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-600 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Globe className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Macro Sim</h1>
              <p className="text-slate-500 text-sm">国際金融市場ビジュアライザー</p>
            </div>
          </div>
          <div className="flex gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <Button onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'secondary' : 'primary'} className="!py-2 !px-4 !rounded-lg text-sm">
              {isRunning ? (
                <>
                  <Pause size={16} /> Pause
                </>
              ) : (
                <>
                  <Play size={16} /> Start
                </>
              )}
            </Button>
            <Button onClick={() => applyScenario('reset')} variant="ghost" className="!py-2 !px-4 !rounded-lg text-sm">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="!border-l-4 !border-l-indigo-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl bg-slate-50 rounded-lg p-1">🇯🇵</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{domestic.name}</h2>
                  <div className="text-xs text-slate-400 font-medium tracking-wider">DOMESTIC</div>
                </div>
              </div>
            </div>
            <Slider label="政策金利" value={domestic.interestRate} onChange={(v) => setDomestic({ ...domestic, interestRate: v })} min={-0.5} max={10} step={0.1} color="indigo" />
            <Slider label="インフレ率" value={domestic.inflation} onChange={(v) => setDomestic({ ...domestic, inflation: v })} min={-2} max={15} step={0.5} color="rose" />
            <Slider label="GDP成長率" value={domestic.gdpGrowth} onChange={(v) => setDomestic({ ...domestic, gdpGrowth: v })} min={-5} max={10} step={0.5} color="emerald" />
          </Card>

          <Card className="!border-l-4 !border-l-slate-400 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl bg-slate-50 rounded-lg p-1">🇺🇸</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{foreign.name}</h2>
                  <div className="text-xs text-slate-400 font-medium tracking-wider">FOREIGN</div>
                </div>
              </div>
            </div>
            <Slider label="政策金利" value={foreign.interestRate} onChange={(v) => setForeign({ ...foreign, interestRate: v })} min={-0.5} max={10} step={0.1} color="indigo" />
            <Slider label="インフレ率" value={foreign.inflation} onChange={(v) => setForeign({ ...foreign, inflation: v })} min={-2} max={15} step={0.5} color="rose" />
            <Slider label="GDP成長率" value={foreign.gdpGrowth} onChange={(v) => setForeign({ ...foreign, gdpGrowth: v })} min={-5} max={10} step={0.5} color="emerald" />
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Market Events</p>
            <button
              onClick={() => applyScenario('tightening')}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">日銀利上げ</div>
                <div className="text-xs text-slate-400 mt-0.5">金融引き締め政策の発動</div>
              </div>
              <Activity size={16} className="text-slate-300 group-hover:text-indigo-500" />
            </button>
            <button
              onClick={() => applyScenario('flight_to_quality')}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-emerald-600 transition-colors">有事のドル買い</div>
                <div className="text-xs text-slate-400 mt-0.5">米国経済への逃避</div>
              </div>
              <TrendingUp size={16} className="text-slate-300 group-hover:text-emerald-500" />
            </button>
            <button
              onClick={() => applyScenario('crisis')}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-rose-200 hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-rose-600 transition-colors">悪い円安</div>
                <div className="text-xs text-slate-400 mt-0.5">スタグフレーション</div>
              </div>
              <TrendingDown size={16} className="text-slate-300 group-hover:text-rose-500" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm font-medium tracking-wider uppercase">
                  <Activity size={14} /> Exchange Rate Index
                </div>
                <div className="text-7xl font-light tracking-tighter tabular-nums">{exchangeRate.toFixed(2)}</div>
                <div
                  className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md ${status.color} ${status.bg} border border-white/5`}
                >
                  {status.text}
                </div>
              </div>
              <div className="hidden md:block text-right space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5 inline-block min-w-[180px]">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Spread (JP - US)</p>
                  <p className={`text-2xl font-semibold tracking-tight ${(domestic.interestRate - foreign.interestRate) >= 0 ? 'text-indigo-300' : 'text-rose-300'}`}>
                    {(domestic.interestRate - foreign.interestRate).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 h-48 w-full bg-slate-900/50 rounded-xl border border-white/5 p-4 backdrop-blur-sm">
              <SimpleChart data={history} height={160} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign size={64} />
              </div>
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-1 h-4 bg-yellow-400 rounded-full" />
                Capital Flow
              </h3>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between px-2">
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">🇯🇵</div>
                    <div className="text-xs font-bold text-slate-400">JPY</div>
                  </div>

                  <div className="flex-1 mx-4 relative h-12 flex items-center justify-center">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />

                    {Math.abs(capitalFlow) < 0.5 ? (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full z-10">BALANCED</span>
                    ) : (
                      <div className="relative w-full flex items-center justify-center">
                        <ArrowRight
                          className={`text-slate-300 transition-all duration-500 ${capitalFlow < 0 ? 'rotate-180 text-indigo-500' : 'text-rose-500'}`}
                          size={24}
                          strokeWidth={3}
                        />
                        <div className={`absolute top-0 flex gap-2 transition-all duration-1000 ${capitalFlow > 0 ? 'left-[60%]' : 'right-[60%]'}`}>
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">🇺🇸</div>
                    <div className="text-xs font-bold text-slate-400">USD</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
                  {capitalFlow > 0
                    ? '金利の高い米国へ資金が流出中。円が売られやすくなります。'
                    : capitalFlow < 0
                      ? '日本への資金流入中。円が買われやすくなります。'
                      : '資金の流れは均衡しています。'}
                </p>
              </div>
            </Card>

            <Card className="flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingCart size={64} />
              </div>
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-1 h-4 bg-purple-400 rounded-full" />
                Purchasing Power
              </h3>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-around items-end h-24 mb-4">
                  <div className="flex flex-col items-center gap-2 group/item">
                    <div className="transition-all duration-500 relative" style={{ transform: `scale(${0.8 + domestic.inflation / 40})` }}>
                      <span className="text-4xl drop-shadow-sm filter grayscale-[0.2] group-hover/item:grayscale-0 transition-all">🍔</span>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">¥{Math.round(450 * (1 + domestic.inflation / 10))}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 group/item">
                    <div className="transition-all duration-500 relative" style={{ transform: `scale(${0.8 + foreign.inflation / 40})` }}>
                      <span className="text-4xl drop-shadow-sm filter grayscale-[0.2] group-hover/item:grayscale-0 transition-all">🍔</span>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">${(5.5 * (1 + foreign.inflation / 10)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-auto">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-rose-400 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, exchangeRate - 50))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                  <span>Export Adv.</span>
                  <span>Import Adv.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
