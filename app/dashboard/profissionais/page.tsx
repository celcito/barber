"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SlideOver } from "@/components/ui/slide-over";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ProfissionalForm } from "@/components/features/profissional-form";
import { getProfissionais, deleteProfissional } from "@/lib/actions/profissionais";

interface Profissional {
  id: string;
  nome: string;
  ativo: boolean;
  foto_url?: string | null;
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editProfissional, setEditProfissional] = useState<Profissional | undefined>();

  async function loadProfissionais() {
    setLoading(true);
    const data = await getProfissionais();
    setProfissionais(data as Profissional[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProfissionais();
  }, []);

  function handleEdit(profissional: Profissional) {
    setEditProfissional(profissional);
    setSlideOpen(true);
  }

  function handleCreate() {
    setEditProfissional(undefined);
    setSlideOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    await deleteProfissional(id);
    loadProfissionais();
  }

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="flex justify-between items-end mb-stack-lg">
          <div>
            <span className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase">Gestão de Pessoas</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-2">Equipe</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{profissionais.length} Barbeiros</p>
          </div>
          <Button onClick={handleCreate} icon={<span className="material-symbols-outlined text-[20px]">person_add</span>}>
            NOVA EQUIPE
          </Button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 bg-surface-container p-4 border border-outline-variant rounded">
                <div className="w-24 h-24 bg-surface-container-highest animate-shimmer rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 bg-surface-container-highest animate-shimmer rounded" />
                  <div className="h-4 w-1/3 bg-surface-container-highest animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : profissionais.length === 0 ? (
          <EmptyState
            icon={<span className="material-symbols-outlined text-[64px]">group</span>}
            title="Nenhum profissional cadastrado"
            description="Adicione os profissionais que trabalham no seu salão."
            action={{ label: "Criar Profissional", onClick: handleCreate }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {profissionais.map((profissional) => (
              <div key={profissional.id} className="flex gap-4 bg-surface-container p-4 border border-outline-variant hover:border-primary transition-all group rounded">
                <div className="w-24 h-24 bg-surface-container-highest overflow-hidden rounded flex items-center justify-center relative">
                  {profissional.foto_url ? (
                    <Image
                      src={profissional.foto_url}
                      alt={profissional.nome}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[40px] text-primary/40">person</span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h5 className="font-headline-sm text-[18px] text-on-surface">{profissional.nome}</h5>
                  <Badge variant={profissional.ativo ? "confirmado" : "cancelado"} className="mb-2 w-fit">
                    {profissional.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => handleEdit(profissional)} className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(profissional.id)} className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditProfissional(undefined); loadProfissionais(); }}
        title={editProfissional ? "Editar Profissional" : "Novo Profissional"}
      >
        <ProfissionalForm
          onClose={() => { setSlideOpen(false); setEditProfissional(undefined); loadProfissionais(); }}
          initialData={editProfissional}
        />
      </SlideOver>
    </div>
  );
}
