"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import {
  createProfissional,
  updateProfissional,
  updateProfissionalHorarios,
  getProfissionalHorarios,
  getSalaoHorariosConfig,
  type ProfissionalHorario,
} from "@/lib/actions/profissionais";
import { DIAS_SEMANA } from "@/lib/schemas/salao";

interface ProfissionalFormProps {
  onClose: () => void;
  initialData?: {
    id: string;
    nome: string;
    ativo: boolean;
    foto_url?: string | null;
  };
}

interface DayConfig {
  aberto: boolean;
  inicio: string;
  fim: string;
}

function defaultHorarios(): Record<string, DayConfig> {
  const map: Record<string, DayConfig> = {};
  for (const dia of DIAS_SEMANA) {
    map[dia] = {
      aberto: dia !== "domingo",
      inicio: "09:00",
      fim: "19:00",
    };
  }
  return map;
}

export function ProfissionalForm({ onClose, initialData }: ProfissionalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [usarHorariosSalao, setUsarHorariosSalao] = useState(true);
  const [horariosProf, setHorariosProf] = useState<Record<string, DayConfig>>(defaultHorarios());
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLoadingHorarios(true);
      Promise.all([
        getProfissionalHorarios(initialData.id),
        getSalaoHorariosConfig(),
      ]).then(([profHorarios, salaoHorarios]) => {
        if (profHorarios.length > 0) {
          setUsarHorariosSalao(false);
          const map: Record<string, DayConfig> = {};
          for (const dia of DIAS_SEMANA) {
            const found = profHorarios.find((h) => h.dia_semana === dia);
            if (found) {
              map[dia] = { aberto: found.aberto, inicio: found.inicio, fim: found.fim };
            } else {
              const salao = salaoHorarios[dia];
              map[dia] = salao ? { ...salao } : { aberto: dia !== "domingo", inicio: "09:00", fim: "19:00" };
            }
          }
          setHorariosProf(map);
        }
        setLoadingHorarios(false);
      });
    }
  }, [initialData]);

  function updateDiaConfig(dia: string, field: keyof DayConfig, value: string | boolean) {
    setHorariosProf((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = initialData
      ? await updateProfissional(initialData.id, formData)
      : await createProfissional(formData);

    if (result?.error) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    if (initialData && !usarHorariosSalao) {
      const horariosList: ProfissionalHorario[] = Object.entries(horariosProf).map(
        ([dia_semana, config]) => ({
          dia_semana,
          aberto: config.aberto,
          inicio: config.inicio,
          fim: config.fim,
        })
      );
      await updateProfissionalHorarios(initialData.id, horariosList);
    }

    if (initialData && usarHorariosSalao) {
      await updateProfissionalHorarios(initialData.id, []);
    }

    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-md">
      {/* Avatar */}
      <div className="flex justify-center py-2">
        <AvatarPicker
          name="foto_url"
          currentUrl={initialData?.foto_url}
        />
        {errors.foto_url?.[0] && (
          <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {errors.foto_url[0]}
          </p>
        )}
      </div>

      <Input
        id="nome"
        name="nome"
        label="Nome do Profissional"
        defaultValue={initialData?.nome}
        error={errors.nome?.[0]}
        required
      />

      <Checkbox
        name="ativo"
        value="true"
        defaultChecked={initialData?.ativo ?? true}
        label="Profissional ativo"
      />

      {initialData && (
        <div className="border-t border-outline-variant pt-stack-md mt-stack-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Horários de Funcionamento</h3>
            {loadingHorarios && (
              <span className="text-on-surface-variant animate-pulse font-label-sm">Carregando...</span>
            )}
          </div>

          <div className="mb-4 p-3 bg-surface-container-high rounded">
            <Checkbox
              checked={usarHorariosSalao}
              onCheckedChange={setUsarHorariosSalao}
              label="Usar horários do salão"
              description="Herda os horários configurados nas configurações da barbearia"
            />
          </div>

          {!usarHorariosSalao && (
            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => {
                const config = horariosProf[dia];
                return (
                  <div
                    key={dia}
                    className="flex items-center justify-between py-2 border-b border-outline-variant/30"
                  >
                    <div className="flex items-center gap-3 w-1/3">
                      <Checkbox
                        size="sm"
                        checked={config?.aberto ?? true}
                        onCheckedChange={(v) => updateDiaConfig(dia, "aberto", v)}
                      />
                      <span className="font-label-md text-label-md text-on-surface">{dia}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={config?.inicio ?? "09:00"}
                        onChange={(e) => updateDiaConfig(dia, "inicio", e.target.value)}
                        disabled={!config?.aberto}
                        className="bg-transparent border-b border-outline focus:border-primary focus:ring-0 text-on-surface font-label-md text-label-md p-1 disabled:opacity-30"
                      />
                      <span className="text-outline-variant font-label-sm">até</span>
                      <input
                        type="time"
                        value={config?.fim ?? "19:00"}
                        onChange={(e) => updateDiaConfig(dia, "fim", e.target.value)}
                        disabled={!config?.aberto}
                        className="bg-transparent border-b border-outline focus:border-primary focus:ring-0 text-on-surface font-label-md text-label-md p-1 disabled:opacity-30"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded bg-error/10 border border-error/30">
          <p className="font-label-md text-label-md text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            Corrija os erros antes de salvar.
          </p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, msgs]) => (
              <li key={field} className="font-body-sm text-body-sm text-error/80">
                {field === "_form" ? msgs[0] : `${field}: ${msgs[0]}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} icon={<span className="material-symbols-outlined text-[18px]">save</span>}>
          {initialData ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
