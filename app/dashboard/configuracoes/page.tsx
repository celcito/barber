"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getSalao, updateSalao } from "@/lib/actions/salao";
import { getHorarioExcessoes, createHorarioExcesso, deleteHorarioExcesso } from "@/lib/actions/horario-excessoes";
import { DIAS_SEMANA } from "@/lib/schemas/salao";

interface SalaoData {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string | null;
  endereco: Record<string, string> | null;
  config: Record<string, unknown>;
}

interface HorarioConfig {
  aberto: boolean;
  inicio: string;
  fim: string;
}

interface HorarioExcesso {
  id: string;
  data_inicio: string;
  data_fim: string;
  tipo: "bloqueado" | "aberto_excessao";
  descricao: string;
}

function getHorarios(config: Record<string, unknown>): Record<string, HorarioConfig> {
  const defaultHorarios: Record<string, HorarioConfig> = {};
  for (const dia of DIAS_SEMANA) {
    defaultHorarios[dia] = {
      aberto: dia !== "domingo",
      inicio: "09:00",
      fim: "19:00",
    };
  }
  const saved = config.horarios as Record<string, HorarioConfig> | undefined;
  return saved || defaultHorarios;
}

function defaultNotificacoes() {
  return {
    lembretes_ativos: true,
    lembretes_email_ativos: false,
    intervalo_lembrete: 120,
    template: "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.",
    notificar_dono: true,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateTime(iso: string) {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

export default function ConfiguracoesPage() {
  const [salao, setSalao] = useState<SalaoData | null>(null);
  const [excessoes, setExcessoes] = useState<HorarioExcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [excessoOpen, setExcessoOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  async function loadSalao() {
    setLoading(true);
    const [salaoData, excessoData] = await Promise.all([
      getSalao(),
      getHorarioExcessoes(),
    ]);
    if (salaoData) {
      setSalao({
        id: salaoData.id,
        nome: salaoData.nome,
        slug: salaoData.slug,
        whatsapp: salaoData.whatsapp,
        endereco: salaoData.endereco as Record<string, string> | null,
        config: (salaoData.config ?? {}) as Record<string, unknown>,
      });
      setNome(salaoData.nome || "");
      setSlug(salaoData.slug || "");
      setWhatsapp(salaoData.whatsapp || "");
    }
    setExcessoes(excessoData as HorarioExcesso[]);
    setLoading(false);
  }

  useEffect(() => {
    loadSalao();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    const formEl = e.currentTarget;
    const formData = new FormData();

    formData.set("nome", nome);
    formData.set("slug", slug);
    formData.set("whatsapp", whatsapp);

    const fieldsToCopy = [
      "endereco_logradouro", "endereco_numero", "endereco_complemento",
      "endereco_bairro", "endereco_cidade", "endereco_estado", "endereco_cep",
      "rede_instagram", "rede_facebook", "rede_tiktok", "rede_website",
      "intervalo", "intervalo_lembrete", "template",
    ];
    for (const name of fieldsToCopy) {
      const input = formEl.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (input) formData.set(name, input.value);
    }

    for (const dia of DIAS_SEMANA) {
      const checkbox = formEl.elements.namedItem(`horario_${dia}_aberto`) as HTMLInputElement | null;
      if (checkbox?.value) formData.set(`horario_${dia}_aberto`, checkbox.value);

      const inicio = formEl.elements.namedItem(`horario_${dia}_inicio`) as HTMLInputElement | null;
      if (inicio) formData.set(`horario_${dia}_inicio`, inicio.value);

      const fim = formEl.elements.namedItem(`horario_${dia}_fim`) as HTMLInputElement | null;
      if (fim) formData.set(`horario_${dia}_fim`, fim.value);
    }

    const toggleFields = ["notificar_dono", "lembretes_ativos", "lembretes_email_ativos"];
    for (const name of toggleFields) {
      const cb = formEl.elements.namedItem(name) as HTMLInputElement | null;
      if (cb?.value) formData.set(name, cb.value);
    }

    const result = await updateSalao(formData);

    if (result?.error) {
      setErrors(result.error as Record<string, string[]>);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    loadSalao();
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleAddExcesso(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createHorarioExcesso(formData);
    if (result?.error) {
      alert(result.error);
      return;
    }
    setExcessoOpen(false);
    loadSalao();
  }

  async function handleDeleteExcesso(id: string) {
    if (!confirm("Remover esta exceção de horário?")) return;
    await deleteHorarioExcesso(id);
    loadSalao();
  }

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const form = e.target.closest("form");
          if (form) {
            const setInput = (name: string, value: string) => {
              const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement;
              if (input && value) input.value = value;
            };
            setInput("endereco_logradouro", data.logradouro);
            setInput("endereco_bairro", data.bairro);
            setInput("endereco_cidade", data.localidade);
            setInput("endereco_estado", data.uf);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  }

  if (loading) {
    return (
      <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="h-8 w-48 bg-surface-container-highest rounded animate-shimmer mb-10" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface-container border border-outline-variant p-stack-md rounded">
                <div className="h-16 w-full bg-surface-container-highest rounded animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const horarios = salao ? getHorarios(salao.config) : null;
  const notifConfig = (salao?.config?.notificacoes ?? defaultNotificacoes()) as {
    lembretes_ativos: boolean;
    lembretes_email_ativos: boolean;
    intervalo_lembrete: number;
    template: string;
    notificar_dono: boolean;
  };
  const endereco = (salao?.endereco || {}) as Record<string, string>;
  const redesSociais = (salao?.config?.redes_sociais ?? {}) as Record<string, string>;

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="mb-stack-lg flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Configurações</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Gerencie o funcionamento da barbearia, canais de comunicação e preferências globais.
            </p>
          </div>
          <div className="flex gap-4">
            <Button type="submit" form="settings-form" size="md" loading={saving}>
              Salvar Alterações
            </Button>
          </div>
        </header>

        {success && (
          <div className="mb-6 p-4 rounded bg-primary/10 border border-primary/20 font-body-md text-primary text-center animate-fade-in">
            Configurações salvas com sucesso!
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 rounded bg-error/10 border border-error/30">
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

        <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 lg:col-span-7 space-y-gutter">
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">storefront</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Perfil da Barbearia</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Nome do Estabelecimento
                  </label>
                  <input
                    name="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="Ex: The Grooming Ritual"
                  />
                  {errors.nome?.[0] && (
                    <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.nome[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Link de Agendamento
                  </label>
                  <div className="flex items-stretch bg-surface-container-high border-b border-outline-variant focus-within:border-primary transition-all">
                    <span className="text-on-surface-variant font-body-sm pl-3 pr-1 py-3 flex items-center select-none">
                      seusite.com/
                    </span>
                    <input
                      name="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      required
                      pattern="[a-z0-9-]+"
                      title="Apenas letras minúsculas, números e hífens"
                      className="w-full bg-transparent text-on-surface py-3 pr-3 focus:ring-0 outline-hidden"
                      placeholder="minha-barbearia"
                    />
                  </div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                    Este é o link que você enviará para os clientes (apenas minúsculas e hífens).
                  </p>
                  {errors.slug?.[0] && (
                    <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.slug[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Horários de Funcionamento</h3>
              </div>
              <div className="space-y-4">
                {DIAS_SEMANA.map((dia) => {
                  const config = horarios?.[dia];
                  return (
                    <div key={dia} className="flex items-center justify-between py-3 border-b border-outline-variant/30 group hover:bg-surface-container-highest/20 transition-colors px-2">
                      <div className="w-1/3 flex items-center gap-4">
                        <Checkbox
                          name={`horario_${dia}_aberto`}
                          value="true"
                          defaultChecked={config?.aberto ?? dia !== "domingo"}
                        />
                        <span className="font-label-md text-label-md text-on-surface">{dia}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="time"
                          name={`horario_${dia}_inicio`}
                          defaultValue={config?.inicio ?? "09:00"}
                          className="bg-transparent border-b border-outline focus:border-primary focus:ring-0 text-on-surface font-label-md text-label-md p-1"
                        />
                        <span className="text-outline-variant font-label-sm">até</span>
                        <input
                          type="time"
                          name={`horario_${dia}_fim`}
                          defaultValue={config?.fim ?? "19:00"}
                          className="bg-transparent border-b border-outline focus:border-primary focus:ring-0 text-on-surface font-label-md text-label-md p-1"
                        />
                      </div>
                      <div className="text-right w-24">
                        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          {config?.aberto ?? dia !== "domingo" ? "Aberto" : "Fechado"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-container-high border border-outline-variant p-6 flex items-start gap-4 rounded">
              <span className="material-symbols-outlined text-tertiary">info</span>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-1">Datas Excepcionais</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Para feriados ou eventos especiais, configure abaixo as exceções de horário.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Endereço do Estabelecimento</h3>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Logradouro / Rua
                  </label>
                  <input
                    name="endereco_logradouro"
                    defaultValue={endereco.logradouro || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="Av. Paulista"
                  />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Número
                  </label>
                  <input
                    name="endereco_numero"
                    defaultValue={endereco.numero || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="1000"
                  />
                </div>
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Complemento
                  </label>
                  <input
                    name="endereco_complemento"
                    defaultValue={endereco.complemento || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="Sala 42, Bloco B"
                  />
                </div>
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Bairro
                  </label>
                  <input
                    name="endereco_bairro"
                    defaultValue={endereco.bairro || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="Bela Vista"
                  />
                </div>
                <div className="col-span-12 md:col-span-5 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Cidade
                  </label>
                  <input
                    name="endereco_cidade"
                    defaultValue={endereco.cidade || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="São Paulo"
                  />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Estado
                  </label>
                  <input
                    name="endereco_estado"
                    defaultValue={endereco.estado || ""}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    CEP
                  </label>
                  <input
                    name="endereco_cep"
                    defaultValue={endereco.cep || ""}
                    onChange={handleCepChange}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                    placeholder="01310-100"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-5 space-y-gutter">
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">chat</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">WhatsApp</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Notificações de novos agendamentos e contato direto no site.
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Número de Telefone
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">call</span>
                    <input
                      name="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant text-[11px] mt-1">
                    Formato internacional com DDD e prefixo.
                  </p>
                  {errors.whatsapp?.[0] && (
                    <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.whatsapp[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-4 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        name="notificar_dono"
                        value="true"
                        defaultChecked={notifConfig.notificar_dono}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </div>
                    <span className="font-label-md text-label-md text-on-surface">Notificar novos agendamentos</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">share</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Redes Sociais</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Links que serão enviados no e-mail de lembrete e exibidos no rodapé do agendamento.
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Instagram
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">photo_camera</span>
                    <input
                      name="rede_instagram"
                      defaultValue={redesSociais.instagram || ""}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
                      placeholder="@suabarbearia"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Facebook
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">brand_awareness</span>
                    <input
                      name="rede_facebook"
                      defaultValue={redesSociais.facebook || ""}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
                      placeholder="facebook.com/suabarbearia"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    TikTok
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">alternate_email</span>
                    <input
                      name="rede_tiktok"
                      defaultValue={redesSociais.tiktok || ""}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
                      placeholder="@suabarbearia"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Website / URL Principal
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">public</span>
                    <input
                      name="rede_website"
                      defaultValue={redesSociais.website || ""}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
                      placeholder="https://suabarbearia.com.br"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">timer</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Intervalo</h3>
              </div>
              <select
                name="intervalo"
                defaultValue={((salao?.config?.intervalo ?? 30) as number).toString()}
                className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
              >
                <option value="15">15 minutos</option>
                <option value="20">20 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">notifications</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Lembretes</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      name="lembretes_ativos"
                      value="true"
                      defaultChecked={notifConfig.lembretes_ativos}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">Lembretes automáticos (WhatsApp)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      name="lembretes_email_ativos"
                      value="true"
                      defaultChecked={notifConfig.lembretes_email_ativos}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">Lembretes por E-mail</span>
                </label>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2">
                    Enviar lembrete
                  </label>
                  <select
                    name="intervalo_lembrete"
                    defaultValue={notifConfig.intervalo_lembrete.toString()}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden"
                  >
                    <option value="60">1 hora antes</option>
                    <option value="120">2 horas antes</option>
                    <option value="1440">24 horas antes</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2">
                    Mensagem
                  </label>
                  <textarea
                    name="template"
                    defaultValue={notifConfig.template}
                    rows={3}
                    className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 transition-all outline-hidden resize-none"
                  />
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    Variáveis: {`{{nome}}, {{horario}}, {{servico}}, {{salao}}`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12">
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">event</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Exceções de Horário</h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={<span className="material-symbols-outlined text-[18px]">add</span>}
                  onClick={() => setExcessoOpen(true)}
                >
                  Adicionar
                </Button>
              </div>
              {excessoes.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">Nenhuma exceção configurada</p>
              ) : (
                <div className="space-y-2">
                  {excessoes.map((exc) => (
                    <div key={exc.id} className="flex items-center justify-between p-4 rounded bg-surface-container border border-outline-variant">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${exc.tipo === "bloqueado" ? "bg-error" : "bg-primary"}`} />
                          <span className="font-label-md text-label-md text-on-surface">
                            {exc.tipo === "bloqueado" ? "Bloqueado" : "Aberto (exceção)"}
                          </span>
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                          {formatDateTime(exc.data_inicio)} — {formatDateTime(exc.data_fim)}
                        </p>
                        {exc.descricao && (
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{exc.descricao}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExcesso(exc.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </form>

        {excessoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs" onClick={() => setExcessoOpen(false)} />
            <div className="relative bg-surface-container border border-outline-variant p-stack-lg max-w-md w-full rounded">
              <h3 className="font-headline-md text-headline-md text-primary mb-stack-md">Nova Exceção</h3>
              <form onSubmit={handleAddExcesso} className="space-y-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Tipo</label>
                  <select
                    name="tipo"
                    required
                    className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface"
                  >
                    <option value="bloqueado">Bloqueado (indisponível)</option>
                    <option value="aberto_excessao">Aberto (fora do horário)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Data início</label>
                    <input type="date" name="data_inicio" required
                      className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Hora início</label>
                    <input type="time" name="hora_inicio" required defaultValue="09:00"
                      className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Data fim</label>
                    <input type="date" name="data_fim" required
                      className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Hora fim</label>
                    <input type="time" name="hora_fim" required defaultValue="19:00"
                      className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface" />
                  </div>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Descrição</label>
                  <input type="text" name="descricao" placeholder="Ex: Feriado, manutenção..."
                    className="w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-hidden py-3 px-4 transition-all text-on-surface" />
                </div>
                <div className="flex justify-end gap-4 mt-stack-lg">
                  <button type="button" onClick={() => setExcessoOpen(false)}
                    className="font-label-md text-label-md text-on-surface-variant px-6 py-2 hover:text-on-surface transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="bg-primary text-on-primary px-8 py-3 font-label-md text-label-md rounded hover:brightness-110 active:scale-[0.98] transition-all">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
