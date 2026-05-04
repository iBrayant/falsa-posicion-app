"use client";

import { useState, useMemo } from "react";
import { evaluate, parse } from "mathjs";
import { BlockMath, InlineMath } from "react-katex";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Calculator, AlertCircle, RefreshCw } from "lucide-react";

interface IterationData {
  n: number;
  a: number;
  b: number;
  x_i: number;
  fx_i: number;
}

export default function FalsePositionApp() {
  const [func, setFunc] = useState("x^3 - x - 1");
  const [valA, setValA] = useState("1");
  const [valB, setValB] = useState("2");
  const [tol, setTol] = useState("0.001");
  const [maxIter, setMaxIter] = useState("50");

  const [results, setResults] = useState<IterationData[]>([]);
  const [root, setRoot] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  const texFunc = useMemo(() => {
    try {
      if (!func.trim()) return "";
      return parse(func).toTex();
    } catch {
      return "\\text{...escribiendo...}";
    }
  }, [func]);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setResults([]);
    setRoot(null);
    setChartData([]);
    setHasCalculated(true);

    try {
      let a = parseFloat(valA);
      let b = parseFloat(valB);
      const tolerance = parseFloat(tol);
      const maxI = parseInt(maxIter);

      if (isNaN(a) || isNaN(b) || isNaN(tolerance) || isNaN(maxI)) {
        throw new Error("Por favor, ingresa valores numéricos válidos.");
      }

      const f = (x: number) => evaluate(func, { x });

      let f_a = f(a);
      let f_b = f(b);

      if (f_a * f_b >= 0) {
        throw new Error("Intervalo inválido: f(a) y f(b) deben tener signos opuestos.");
      }

      const iterData: IterationData[] = [];
      let iter = 0;
      let rootFound = false;
      let x_i = 0;
      let f_xi = 0;

      while (iter < maxI) {
        iter++;
        
        const denominator = f_b - f_a;
        if (Math.abs(denominator) < 1e-15) {
          throw new Error("División por cero en el cálculo de X_i.");
        }

        x_i = (a * f_b - b * f_a) / denominator;
        f_xi = f(x_i);

        iterData.push({
          n: iter,
          a: a,
          b: b,
          x_i: x_i,
          fx_i: f_xi,
        });

        if (Math.abs(f_xi) == 0) {
          rootFound = true;
          break;
        }

        if (Math.abs(f_xi) < tolerance) {
          rootFound = true;
          break;
        }

        if (f_a * f_xi < 0) {
          b = x_i;
          f_b = f_xi; // f_b is updated implicitly since b is updated
        } else {
          a = x_i;
          f_a = f_xi;
        }
      }

      setResults(iterData);

      if (rootFound) {
        setRoot(x_i);
      } else {
        setErrorMsg("El método no alcanzó la tolerancia en el número máximo de iteraciones.");
      }

      // Generate chart data for visualization
      const cData = [];
      const allX = [parseFloat(valA), parseFloat(valB), ...iterData.map(d => d.x_i)];
      const minX = Math.min(...allX) - 1;
      const maxX = Math.max(...allX) + 1;
      const step = (maxX - minX) / 200;
      for (let i = 0; i <= 200; i++) {
        const x = minX + i * step;
        cData.push({ x, y: f(x) });
      }
      setChartData(cData);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al evaluar la función. Verifica la sintaxis.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 shadow-sm py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
          <Calculator className="text-teal-600" size={28} />
          <h1 className="text-2xl font-bold text-slate-800">
            Método de la Regla Falsa
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Parámetros</h2>
            <form onSubmit={calculate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Función <InlineMath math="f(x)" />
                </label>
                <input
                  type="text"
                  value={func}
                  onChange={(e) => setFunc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono"
                  placeholder="ej. x^3 - x - 1"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto min-h-[4rem] flex items-center justify-center">
                <BlockMath math={`f(x) = ${texFunc}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Límite Inferior (<InlineMath math="a" />)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={valA}
                    onChange={(e) => setValA(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Límite Superior (<InlineMath math="b" />)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={valB}
                    onChange={(e) => setValB(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tolerancia
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tol}
                    onChange={(e) => setTol(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Iteraciones máx.
                  </label>
                  <input
                    type="number"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <RefreshCw size={18} />
                Calcular Raíz
              </button>
            </form>
          </div>
          
          {/* Formula Card */}
          <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
            <h3 className="text-sm font-semibold text-teal-900 mb-3 uppercase tracking-wider">Fórmula de Iteración</h3>
            <div className="text-center overflow-x-auto py-2">
              <BlockMath math="X_i = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}" />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>{errorMsg}</p>
            </div>
          )}

          {!hasCalculated && !errorMsg && (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400">
              <Calculator size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Ingresa los parámetros y presiona Calcular</p>
            </div>
          )}

          {hasCalculated && root !== null && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-emerald-800 font-semibold mb-1">Raíz Aproximada Encontrada</h3>
                <p className="text-emerald-600 text-sm">El método convergió exitosamente.</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-emerald-100">
                <span className="text-2xl font-bold text-emerald-700">
                  <InlineMath math={`x \\approx ${root.toFixed(6)}`} />
                </span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Tabla de Iteraciones</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Iter (<InlineMath math="n" />)</th>
                      <th className="px-6 py-3 font-medium"><InlineMath math="a" /></th>
                      <th className="px-6 py-3 font-medium"><InlineMath math="b" /></th>
                      <th className="px-6 py-3 font-medium"><InlineMath math="X_i" /></th>
                      <th className="px-6 py-3 font-medium"><InlineMath math="f(X_i)" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                      <tr key={r.n} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{r.n}</td>
                        <td className="px-6 py-4 font-mono">{r.a.toFixed(6)}</td>
                        <td className="px-6 py-4 font-mono">{r.b.toFixed(6)}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-teal-700">{r.x_i.toFixed(6)}</td>
                        <td className="px-6 py-4 font-mono">{r.fx_i.toExponential(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-6">Visualización de la Función</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="x" 
                      type="number" 
                      domain={['dataMin', 'dataMax']} 
                      tickFormatter={(val) => val.toFixed(1)}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value: any) => typeof value === 'number' ? value.toFixed(4) : value}
                      labelFormatter={(label: any) => typeof label === 'number' ? `x = ${label.toFixed(4)}` : label}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                    <Line 
                      type="monotone" 
                      dataKey="y" 
                      stroke="#0d9488" 
                      strokeWidth={2} 
                      dot={false}
                      name="f(x)"
                    />
                    {root !== null && (
                      <ReferenceDot 
                        x={root} 
                        y={0} 
                        r={6} 
                        fill="#10b981" 
                        stroke="#fff" 
                        strokeWidth={2} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
