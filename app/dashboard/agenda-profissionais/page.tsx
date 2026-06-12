"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ScheduleEditor } from "@/components/features/schedule-editor";
import {
  getAllProfissionaisComHorarios,
  getSalaoHorariosConfig,
  updateProfissionalHorarios,
} from "@/lib/actions/profissionais";
import type { ProfissionalComHorarios } from "@/lib/actions/profissionais";

export default function AgendaProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<ProfissionalComHorarios[]>([]);
  const [salaoHorarios, setSalaoHorarios] = useState<
    Record<string, { aberto: boolean; inicio: string; fim: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copyingAll, setCopyingAll] = useState(false);

  async function loadData() {
    setLoading(true);
    const [profs, horarios] = await Promise.all([
      getAllProfissionaisComHorarios(),
      getSalaoHorariosConfig(),
    ]);
    setProfissionais(profs);
    setSalaoHorarios(horarios);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = profissionais.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  }

  async function handleCopyAll() {
    if (!confirm("Copiar horários do salão para todos os profissionais? Isso substituirá horários personalizados.")) {
      return;
    }

    setCopyingAll(true);
    const promises = profissionais
      .filter((p) => !p.usar_horarios_salao)
      .map((p) => updateProfissionalHorarios(p.id, []));
    await Promise.all(promises);
    await loadData();
    setCopyingAll(false);
  }

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="flex justify-between items-end mb-stack-lg">
          <div>
            <span className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase">Gestão de Horários</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-2">Horários da Equipe</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {profissionais.length} Profissionais
            </p>
          </div>
          <Button
            onClick={handleCopyAll}
            loading={copyingAll}
            icon={<span className="material-symbols-outlined text-[18px]">content_copy</span>}
          >
            COPIAR P/ TODOS
          </Button>
        </header>

        <div className="relative mb-stack-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar profissional..."
            className="w-full bg-surface-container border border-outline-variant rounded pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container border border-outline-variant rounded p-stack-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-highest animate-shimmer rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 bg-surface-container-highest animate-shimmer rounded" />
                    <div className="h-4 w-1/3 bg-surface-container-highest animate-shimmer rounded" />
                  </div>
                  <div className="h-8 w-24 bg-surface-container-highest animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50">search_off</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">
              Nenhum profissional encontrado para &ldquo;{search}&rdquo;
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span className="material-symbols-outlined text-[64px]">schedule</span>}
            title="Nenhum profissional cadastrado"
            description="Cadastre profissionais para gerenciar os horários de cada um."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {filtered.map((profissional) => (
              <div key={profissional.id}>
                <div
                  className={`bg-surface-container border rounded p-stack-md transition-all ${
                    selectedId === profissional.id
                      ? "border-primary"
                      : "border-outline-variant hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-primary text-[24px]">person</span>
                      </div>
                      <div>
                        <h5 className="font-headline-sm text-[18px] text-on-surface">{profissional.nome}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={profissional.ativo ? "confirmado" : "cancelado"}>
                            {profissional.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          {profissional.usar_horarios_salao && (
                            <span className="font-label-sm text-label-sm text-primary">Horário padrão</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedId === profissional.id ? "primary" : "secondary"}
                      onClick={() => handleSelect(profissional.id)}
                      icon={
                        <span className="material-symbols-outlined text-[16px]">
                          {selectedId === profissional.id ? "close" : "edit"}
                        </span>
                      }
                    >
                      {selectedId === profissional.id ? "Fechar" : "Selecionar"}
                    </Button>
                  </div>
                </div>

                {selectedId === profissional.id && (
                  <ScheduleEditor
                    profissional={profissional}
                    salaoHorarios={salaoHorarios}
                    onClose={() => {
                      setSelectedId(null);
                      loadData();
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
