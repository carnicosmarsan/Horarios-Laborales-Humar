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

    // Normalize: remove dots, spaces, commas to match regardless of format
    const normalize = (val: string) => val.replace(/[\.\s,]/g, '').toLowerCase();
    const searchTerm = normalize(searchId);

    const member = data.rows.find(row => 
      normalize(row.cedula) === searchTerm
    );

    if (member) {
      setSelectedMember(member);
    } else {
      setError('No se encontró ningún colaborador con esa cédula. Intenta sin puntos o espacios.');
      setTimeout(() => setError(null), 4000);
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
               !h.includes('expedicion') &&
               !h.includes('expedición') &&
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
      <aside className="w-full md:w-[320px] bg-sidebar border-b md:border-b-0 md:border-r border-border p-10 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen shadow-sm z-20">
        <div className="mb-10 text-center flex flex-col items-center group">
          <div className="w-full max-w-[240px] h-28 mb-8 rounded-xl overflow-hidden bg-white p-2 transition-transform group-hover:scale-105 duration-500">
            <img 
              src="https://lh3.googleusercontent.com/d/1zRQz5rurIMEiMVkkXqsLVmLXh9pFlIY6" 
              alt="Humar / Marsan Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback for logo if external link still fails
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/humar/200/100?blur=10";
              }}
            />
          </div>
          <div className="text-2xl font-black tracking-tighter text-text-main uppercase leading-none">
            Humar / <span className="text-brand-red">Marsan</span>
          </div>
          <div className="text-[10px] text-primary mt-2 font-black uppercase tracking-[0.3em] bg-primary/5 px-2 py-1 rounded border border-primary/20">
            Horarios Laborales 2026
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[10px] font-black text-text-main uppercase tracking-widest mb-3 border-l-2 border-brand-red pl-2">
            Consulta de Colaborador
          </label>
          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Número de cédula (con o sin puntos)..."
              className="w-full p-4 border border-border rounded-lg text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-text-muted/30 font-bold bg-white text-text-main uppercase"
              required
            />
            <button
              type="submit"
              className="w-full p-4 bg-primary hover:bg-black text-white rounded-lg font-black text-xs tracking-widest transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 active:scale-95 uppercase"
            >
              <Search className="w-4 h-4" />
              Ingresar al Panel
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
              {/* Header con Nombre Completo */}
              <div className="border-l-4 border-brand-red pl-6 py-2">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">Colaborador</div>
                <h1 className="text-3xl md:text-5xl font-black text-text-main uppercase tracking-tighter leading-none">
                  {selectedMember.nombre}
                </h1>
              </div>

              {/* Stats Section */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border border-border rounded-lg shadow-sm group hover:border-brand-red transition-colors duration-500">
                  <div className="text-[10px] text-text-main font-black uppercase tracking-widest border-b border-border pb-2 mb-3">
                    Documento de Identidad
                  </div>
                  <div className="text-2xl font-semibold text-brand-red flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {selectedMember.cedula}
                  </div>
                  {Object.keys(selectedMember).find(k => k.toLowerCase().includes('expedici')) && (
                    <div className="text-[10px] text-text-muted font-medium mt-2 uppercase tracking-tighter">
                      Expedida en: {selectedMember[Object.keys(selectedMember).find(k => k.toLowerCase().includes('expedici'))!]}
                    </div>
                  )}
                </div>
                <div className="bg-white p-6 border border-border rounded-lg shadow-sm group hover:border-brand-red transition-colors duration-500">
                  <div className="text-[10px] text-text-main font-black uppercase tracking-widest border-b border-border pb-2 mb-3">
                    Jornada Programada
                  </div>
                  <div className="text-2xl font-semibold text-brand-red flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {scheduleInfo[0]?.value || 'Programado'}
                  </div>
                </div>
                <div className="bg-white p-6 border border-border rounded-lg shadow-sm group hover:border-brand-red transition-colors duration-500">
                  <div className="text-[10px] text-text-main font-black uppercase tracking-widest border-b border-border pb-2 mb-3">
                    Estado Colaborador
                  </div>
                  <div className="text-2xl font-semibold text-brand-red flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    ACTIVO
                  </div>
                </div>
              </section>

              {/* Grid Section - Reorganized for long text handling */}
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main mb-[-1.5rem] flex items-center gap-3">
                <div className="h-px bg-primary flex-1"></div>
                Cuerpo del Cronograma
                <div className="h-px bg-primary flex-1"></div>
              </div>

              <section className="flex flex-col gap-3">
                {scheduleInfo.map((info, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "group relative bg-white border border-border rounded-xl flex items-stretch min-h-[80px] transition-all duration-300 hover:shadow-lg hover:border-brand-red overflow-hidden",
                      idx === 0 && "border-2 border-brand-red shadow-md"
                    )}
                  >
                    {/* Day Anchor */}
                    <div className={cn(
                      "w-24 md:w-32 flex flex-col items-center justify-center border-r border-border px-4 shrink-0",
                      idx === 0 ? "bg-brand-red text-white" : "bg-accent/50 text-text-main"
                    )}>
                      <div className="text-[12px] font-black uppercase tracking-widest text-center leading-tight">
                        {info.label}
                      </div>
                    </div>

                    {/* Schedule Content */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-start gap-5">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                          idx === 0 ? "bg-brand-red/5 border-brand-red/20 text-brand-red" : "bg-primary/5 border-primary/20 text-primary"
                        )}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-2 py-1">
                          {info.value.split(/[/|\n]/).map((line, lIdx) => {
                            const isLunch = line.toLowerCase().includes('almuerzo');
                            return (
                              <p 
                                key={lIdx} 
                                className={cn(
                                  "uppercase tracking-tight leading-tight",
                                  isLunch 
                                    ? "text-[10px] md:text-xs font-bold text-text-muted mt-1 italic border-l-2 border-primary/30 pl-2" 
                                    : "text-sm md:text-base font-medium text-text-main"
                                )}
                              >
                                {line.trim()}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                      <Building2 className="w-10 h-10 text-primary -rotate-12 translate-x-4 translate-y--4" />
                    </div>
                  </motion.div>
                ))}
              </section>

              {/* Information Notice */}
              <div className="mt-4 p-5 bg-info-bg border border-info-border rounded-xl flex items-start gap-4">
                <div className="w-6 h-6 bg-info-icon text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  !
                </div>
                <div className="text-xs text-info-text leading-relaxed font-medium">
                  <strong className="block mb-1 font-black text-[10px] uppercase tracking-wider text-brand-red">Comunicado de Gestión Humana:</strong>
                  Ante cualquier solicitud, reporte de irregularidades o inquietudes relacionadas con su cronograma de actividades, por favor comuníquese directamente con el departamento de **Gestión Humana**. Esta plataforma es un medio oficial de consulta interna.
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


