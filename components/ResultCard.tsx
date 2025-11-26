import React from 'react';
import { ScanResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ResultCardProps {
  result: ScanResult | null;
  isScanning: boolean;
  onScan: () => void;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isScanning, onScan, onReset }) => {
  if (isScanning) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col items-center justify-center h-48 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-mono text-blue-400">PROCESSANDO...</p>
        <p className="text-xs text-gray-500 mt-2">ANALISANDO ROIs • OCR • VALIDANDO</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col items-center justify-center h-48">
        <p className="text-gray-400 mb-4">Posicione o par de sapatos e pressione Scan</p>
        <button 
          onClick={onScan}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-lg transition-transform active:scale-95 w-full md:w-auto"
        >
          SCAN AGORA
        </button>
      </div>
    );
  }

  // Determine styles based on status
  let bgClass = "bg-gray-800";
  let borderClass = "border-gray-700";
  let textClass = "text-white";
  let icon = null;
  let mainMessage = "";
  let detailMessage = "";

  switch (result.status) {
    case 'OK':
      bgClass = "bg-green-900/40";
      borderClass = "border-green-500";
      textClass = "text-green-400";
      icon = <CheckCircle size={64} className="text-green-500" />;
      mainMessage = "APROVADO";
      detailMessage = `${result.left.chosen || '?'} | ${result.right.chosen || '?'}`;
      break;
    case 'ERROR':
      bgClass = "bg-red-900/40";
      borderClass = "border-red-500";
      textClass = "text-red-400";
      icon = <XCircle size={64} className="text-red-500" />;
      mainMessage = "ERRO - CHECAR PAR";
      detailMessage = `${result.left.chosen || '?'} | ${result.right.chosen || '?'}`;
      break;
    case 'WARNING':
      bgClass = "bg-yellow-900/40";
      borderClass = "border-yellow-500";
      textClass = "text-yellow-400";
      icon = <AlertTriangle size={64} className="text-yellow-500" />;
      mainMessage = "REPOSICIONAR";
      detailMessage = "Numeração BR não encontrada";
      break;
  }

  return (
    <div className={`${bgClass} border-4 ${borderClass} rounded-xl p-4 shadow-2xl flex flex-col items-center justify-between h-auto min-h-[14rem]`}>
      <div className="flex items-center space-x-4 mb-2">
        {icon}
        <div className="text-center">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${textClass}`}>
            {mainMessage}
          </h2>
          <p className="text-3xl font-mono text-white font-bold mt-1">
            {detailMessage}
          </p>
        </div>
      </div>

      <div className="w-full bg-black/30 rounded p-2 flex justify-between text-xs text-gray-400 font-mono mb-4">
        <span>L Conf: {(result.left.confidence * 100).toFixed(0)}%</span>
        <span>Time: {(result.processing_time_ms / 1000).toFixed(2)}s</span>
        <span>R Conf: {(result.right.confidence * 100).toFixed(0)}%</span>
      </div>

      {result.notes && (
        <div className="text-sm text-center mb-4 font-semibold text-white bg-black/20 py-1 px-3 rounded">
            {result.notes}
        </div>
      )}

      <div className="flex gap-4 w-full">
        <button 
          onClick={onScan}
          className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3 px-4 rounded transition-colors uppercase"
        >
          Próximo
        </button>
        <button 
          onClick={onReset}
          className="bg-transparent hover:bg-white/5 text-gray-400 border border-gray-600 py-3 px-4 rounded"
          aria-label="Reset"
        >
          <RefreshCw size={24} />
        </button>
      </div>
    </div>
  );
};
