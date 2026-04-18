/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, User, Clock, AlertCircle, ChevronLeft, Building2 } from 'lucide-react';
import { fetchSheetData } from './services/sheetService';
import { ScheduleMember, SheetData } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [selectedMember, setSelectedMember] = useState<ScheduleMember | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sheetData = await fetchSheetData();
        setData(sheetData);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la información de los horarios. Por favor intente más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!data) return;

    const member = data.rows.find(row => 
      row.cedula.toLowerCase() === searchId.trim().toLowerCase()
    );

    if (member) {
      setSelectedMember(member);
    } else {
      setError('No se encontró ningún colaborador con esa cédula.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const scheduleInfo = useMemo(() => {
    if (!selectedMember || !data) return [];
    
    return data.headers
      .filter(header => {
        const h = header.toLowerCase();
        return !h.includes('cedula') && 
               !h.includes('cédula') && 
               !h.includes('colaborador') &&
               !h.includes('nombre') &&
               selectedMember[header] &&
               selectedMember[header].trim() !== '';
      })
      .map(header => ({
        label: header,
        value: selectedMember[header]
      }));
  }, [selectedMember, data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-text-muted font-medium text-center">Gestión de Horarios Laborales...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg text-text-main">
      {/* Sidebar */}
      <aside className="w-full md:w-[320px] bg-sidebar border-b md:border-b-0 md:border-r border-border p-10 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-xl ring-2 ring-primary/20 bg-white p-2">
            <img 
              src="https://drive.google.com/uc?export=view&id=1zRQz5rurIMEiMVkkXqsLVmLXh9pFlIY6" 
              alt="Humar / Marsan Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-xl font-black tracking-tighter text-text-main uppercase">
            Humar / <span className="text-brand-red">Marsan</span>
          </div>
          <div className="text-[10px] text-primary mt-1 font-black uppercase tracking-[0.2em]">
            Horarios Laborales 2026
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">
            Consultar Colaborador
          </label>
          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Cédula..."
              className="w-full p-4 border-2 border-border rounded-xl text-sm focus:border-primary outline-none transition-all placeholder:text-text-muted/40 font-bold bg-white"
              required
            />
            <button
              type="submit"
              className="w-full p-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              CONSULTAR
            </button>
          </form>

          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-start gap-2 border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-auto pt-6 border-t border-border"
          >
            <div className="font-bold text-sm truncate">{selectedMember.nombre}</div>
            <div className="text-xs text-text-muted mt-0.5">Colaborador Activo • 2026</div>
          </motion.div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-8 min-w-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedMember ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-20"
            >
              <div className="w-20 h-20 border-2 border-dashed border-text-muted rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-text-muted" />
              </div>
              <h2 className="text-xl font-bold text-text-main">Sin Datos de Consulta</h2>
              <p className="max-w-[280px] text-sm text-text-muted mt-2">
                Ingresa tu número de identidad en el panel lateral para visualizar tu planificación semanal.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              {/* Stats Section */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 border border-border rounded-xl shadow-sm">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    Cédula Identidad
                  </div>
                  <div className="text-lg font-black mt-1 text-brand-red">
                    {selectedMember.cedula}
                  </div>
                </div>
                <div className="bg-white p-5 border border-border rounded-xl shadow-sm">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    Turno Semanal
                  </div>
                  <div className="text-lg font-black mt-1 text-primary">
                    {scheduleInfo[0]?.value || 'Programado'}
                  </div>
                </div>
                <div className="bg-white p-5 border border-border rounded-xl shadow-sm">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    Próximo Periodo
                  </div>
                  <div className="text-lg font-black mt-1 text-text-main">
                    Semana Actual 2026
                  </div>
                </div>
              </section>

              {/* Grid Section */}
              <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-7 gap-3">
                {scheduleInfo.map((info, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "group bg-white border border-border rounded-xl flex flex-col h-full transition-all hover:border-primary/50 shadow-sm",
                      idx === 0 && "border-2 border-primary ring-2 ring-primary/5"
                    )}
                  >
                    <div className={cn(
                      "p-3 text-center border-b border-border text-[10px] font-black uppercase tracking-wider",
                      idx === 0 ? "bg-primary text-white" : "bg-accent/50 text-text-muted"
                    )}>
                      {info.label}
                    </div>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center gap-1">
                      <div className="text-sm font-black text-primary group-hover:scale-110 transition-transform">
                        {info.value}
                      </div>
                      <div className="text-[9px] text-brand-red font-black opacity-80 uppercase tracking-tighter">
                        Humar / Marsan
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Information Notice */}
              <div className="mt-4 p-5 bg-info-bg border border-info-border rounded-xl flex items-start gap-4">
                <div className="w-6 h-6 bg-info-icon text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  !
                </div>
                <div className="text-xs text-info-text leading-relaxed">
                  <strong className="block mb-1 font-bold">Nota Administrativa:</strong>
                  Cualquier ajuste en la planificación debe reportarse con 48 horas de antelación al supervisor de planta. La información aquí presentada es para fines de consulta interna del personal.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-auto pt-6 text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] border-t border-border/50 text-center md:text-left">
          &copy; 2026 Humar Inversiones / Cárnicos Marsan • Sistema de Consulta
        </footer>
      </main>
    </div>
  );
}


