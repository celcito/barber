"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SlideOver } from "@/components/ui/slide-over";
import { EmptyState } from "@/components/ui/empty-state";
import { ServicoForm } from "@/components/features/servico-form";
import { getServicos, deleteServico } from "@/lib/actions/servicos";

interface Servico {
  id: string;
  nome: string;
  duracao_min: number;
  preco: number;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editServico, setEditServico] = useState<Servico | undefined>();

  async function loadServicos() {
    setLoading(true);
    const data = await getServicos();
    setServicos(data as Servico[]);
    setLoading(false);
  }

  useEffect(() => {
    loadServicos();
  }, []);

  function handleEdit(servico: Servico) {
    setEditServico(servico);
    setSlideOpen(true);
  }

  function handleCreate() {
    setEditServico(undefined);
    setSlideOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    await deleteServico(id);
    loadServicos();
  }

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="flex justify-between items-end mb-stack-lg">
          <div>
            <span className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase">Gestão de Catálogo</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-2">Services</h2>
          </div>
          <div className="flex gap-gutter">
            <Button onClick={handleCreate} icon={<span className="material-symbols-outlined text-[20px]">add</span>}>
              NOVO SERVIÇO
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container border border-outline-variant p-stack-md rounded">
                <div className="h-5 w-2/3 bg-surface-container-highest rounded animate-shimmer mb-3" />
                <div className="h-4 w-1/3 bg-surface-container-highest rounded animate-shimmer" />
              </div>
            ))}
          </div>
        ) : servicos.length === 0 ? (
          <EmptyState
            icon={<span className="material-symbols-outlined text-[64px]">content_cut</span>}
            title="Nenhum serviço cadastrado"
            description="Adicione os serviços que seu salão oferece."
            action={{ label: "Criar Serviço", onClick: handleCreate }}
          />
        ) : (
          <div className="space-y-2">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="flex items-center justify-between group hover:bg-surface-container-highest/50 p-4 -mx-4 transition-all border-b border-outline-variant/30"
              >
                <div className="flex-grow">
                  <div className="flex items-center">
                    <span className="font-headline-sm text-[20px] text-on-surface">{servico.nome}</span>
                    <span className="dotted-leader" />
                    <span className="font-label-md text-label-md text-primary">
                      R$ {servico.preco.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {servico.duracao_min} min
                    </span>
                  </div>
                </div>
                <div className="ml-gutter flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(servico)} className="p-2 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">edit_note</span>
                  </button>
                  <button onClick={() => handleDelete(servico.id)} className="p-2 hover:text-error transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditServico(undefined); loadServicos(); }}
        title={editServico ? "Editar Serviço" : "Novo Serviço"}
      >
        <ServicoForm
          onClose={() => { setSlideOpen(false); setEditServico(undefined); loadServicos(); }}
          initialData={editServico}
        />
      </SlideOver>
    </div>
  );
}
