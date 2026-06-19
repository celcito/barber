"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateProfissionalHorarios } from "@/lib/actions/profissionais";
import { DIAS_SEMANA } from "@/lib/schemas/salao";
import type { ProfissionalComHorarios, ProfissionalHorario } from "@/lib/actions/profissionais";

interface DayConfig {
  aberto: boolean;
  inicio: string;
  fim: string;
}

interface ScheduleEditorProps {
  profissional: ProfissionalComHorarios;
  salaoHorarios: Record<string, { aberto: boolean; inicio: string; fim: string }>;
  onClose: () => void;
}

function buildInitialHorarios(
  profissional: ProfissionalComHorarios,
  salaoHorarios: Record<string, { aberto: boolean; inicio: string; fim: string }>
): Record<string, DayConfig> {
  const map: Record<string, DayConfig> = {};
  for (const dia of DIAS_SEMANA) {
    const found = profissional.horarios.find((h) => h.dia_semana === dia);
    if (found) {
      map[dia] = { aberto: found.aberto, inicio: found.inicio, fim: found.fim };
    } else {
      const salao = salaoHorarios[dia];
      map[dia] = salao
        ? { ...salao }
        : { aberto: dia !== "domingo", inicio: "09:00", fim: "19:00" };
    }
  }
  return map;
}

export function ScheduleEditor({ profissional, salaoHorarios, onClose }: ScheduleEditorProps) {
  const [usarHorariosSalao, setUsarHorariosSalao] = useState(profissional.usar_horarios_salao);
  const [horarios, setHorarios] = useState<Record<string, DayConfig>>(
    () => buildInitialHorarios(profissional, salaoHorarios)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDiaConfig(dia: string, field: keyof DayConfig, value: string | boolean) {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const horariosList: ProfissionalHorario[] = usarHorariosSalao
      ? []
      : Object.entries(horarios).map(([dia_semana, config]) => ({
          dia_semana,
          aberto: config.aberto,
          inicio: config.inicio,
          fim: config.fim,
        }));

    const result = await updateProfissionalHorarios(profissional.id, horariosList);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    onClose();
  }

  function handleToggleUsarSalao(checked: boolean) {
    setUsarHorariosSalao(checked);
    if (checked) {
      // Quando ativar "usar horários do salão", não precisa alterar horarios
      // pois serão ignorados no save
    } else {
      // Ao desativar, preencher com horários do salão se estiverem vazios
      setHorarios(buildInitialHorarios(profissional, salaoHorarios));
    }
  }

  return (
    <div className="border border-primary/20 bg-surface-container rounded p-stack-md mt-stack-sm animate-fade-in">
      <div className="flex items-center justify-between mb-stack-md">
        <h4 className="font-label-md text-label-md text-on-surface">
          Editando: {profissional.nome}
        </h4>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="mb-stack-md p-3 bg-surface-container-high rounded">
        <Checkbox
          checked={usarHorariosSalao}
          onCheckedChange={handleToggleUsarSalao}
          label="Usar horários do salão"
          description="Herda os horários configurados nas configurações da barbearia"
        />
      </div>

      {usarHorariosSalao ? (
        <div className="p-3 bg-surface-container-high rounded text-center">
          <span className="material-symbols-outlined text-primary align-middle mr-2">check_circle</span>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Usando horários padrão do salão
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {DIAS_SEMANA.map((dia) => {
            const config = horarios[dia];
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
                  <span className="font-label-md text-label-md text-on-surface">
                    {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                  </span>
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

      {error && (
        <p className="font-label-sm text-label-sm text-error mt-stack-sm">{error}</p>
      )}

      <div className="flex gap-3 mt-stack-md pt-stack-sm border-t border-outline-variant/30">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          icon={<span className="material-symbols-outlined text-[18px]">save</span>}
        >
          Salvar Horários
        </Button>
      </div>
    </div>
  );
}
