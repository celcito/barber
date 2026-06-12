"use client";

import { useEffect, useState } from "react";
import { getClientesAgregados, type ClienteAgregado } from "@/lib/actions/clientes";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteAgregado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getClientesAgregados().then((data) => {
      setClientes(data);
      setLoading(false);
    });
  }, []);

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.whatsapp.includes(search)
  );

  function openWhatsApp(numero: string) {
    const limpo = numero.replace(/\D/g, "");
    if (limpo) {
      window.open(`https://wa.me/55${limpo}`, "_blank");
    }
  }

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Clientes</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Histórico e base consolidada de clientes da barbearia.
            </p>
          </div>
          <div className="w-full md:w-72 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-full pl-10 pr-4 py-2 text-on-surface focus:border-primary outline-hidden transition-colors font-body-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="bg-surface-container border border-outline-variant rounded-lg p-8 text-center animate-pulse">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="font-body-md text-on-surface-variant">Carregando lista de clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="bg-surface-container border border-outline-variant rounded-lg p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">contacts</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Nenhum cliente encontrado</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
              {search ? "Nenhum cliente corresponde à sua busca." : "A base de clientes começará a ser preenchida assim que o primeiro agendamento for realizado."}
            </p>
          </div>
        ) : (
          <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant">
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Cliente</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-center">Total de Agendamentos</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Último Agendamento</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.whatsapp} className="hover:bg-surface-container-highest/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-headline-sm text-primary uppercase shrink-0">
                            {cliente.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{cliente.nome}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{cliente.whatsapp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-label-md">
                          {cliente.total_agendamentos}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          {new Date(cliente.ultimo_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-label-sm text-[11px] text-on-surface-variant opacity-70 block mt-0.5">
                          {new Date(cliente.ultimo_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openWhatsApp(cliente.whatsapp)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all transform group-hover:scale-105"
                          title="Enviar WhatsApp"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
