import React from 'react';
import { ScanResult } from '../types';

interface HistoryLogProps {
  history: ScanResult[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-2xl mx-auto">
      <h3 className="text-gray-500 text-sm font-bold uppercase mb-2 tracking-wider">Histórico de Sessão</h3>
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900 text-gray-300 sticky top-0">
              <tr>
                <th className="p-3">Hora</th>
                <th className="p-3">L | R</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 font-mono">
              {history.map((scan, idx) => (
                <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-3">{new Date(scan.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</td>
                  <td className="p-3 font-bold text-white">
                    {scan.left.chosen || '-'} | {scan.right.chosen || '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      scan.status === 'OK' ? 'bg-green-900 text-green-300' :
                      scan.status === 'ERROR' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">{scan.processing_time_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Latest JSON Debug */}
      <div className="mt-4">
        <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-300 mb-2">Ver JSON do último scan</summary>
            <pre className="bg-black p-4 rounded overflow-x-auto border border-gray-800 text-green-500 font-mono">
                {JSON.stringify(history[0], null, 2)}
            </pre>
        </details>
      </div>
    </div>
  );
};
