import type { Orcamento } from "@radar/shared";

/**
 * ⚠️ DADOS 100% FICTÍCIOS — criados para demonstrar a interface.
 *
 * Nenhuma empresa, cliente ou valor abaixo corresponde a um cliente real.
 * Nenhum destes orçamentos foi enviado pelo Radar (o sistema ainda não envia
 * mensagens e nenhuma integração com WhatsApp está configurada).
 */

/** Data de referência do painel: hoje, calculado em tempo de execução. */
function iso(diasAtras: number): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

export const AVISO_DADOS_FICTICIOS =
  "Dados fictícios para demonstração. Nenhuma venda ou receita real foi recuperada pelo Radar — o produto está em validação de mercado.";

export const PERIODO_DEMO = { inicio: iso(30), fim: iso(0) };

export const ORCAMENTOS_FICTICIOS: Orcamento[] = [
  {
    id: "orc-001",
    cliente: { nome: "Clima Conforto Manutenção", telefone: "(11) 9****-1111" },
    servico: "Instalação de split 18.000 BTUs — 2 unidades",
    valor: 3180,
    dataEnvio: iso(9),
    dataValidade: iso(-5),
    diasSemResposta: 9,
    status: "em_followup",
    responsavel: "Marcos",
    ultimoContato: { canal: "whatsapp", data: iso(3), statusEnvio: "entregue" },
    aguardandoFollowUp: true,
  },
  {
    id: "orc-002",
    cliente: { nome: "Oficina do Zé", telefone: "(11) 9****-2222" },
    servico: "Limpeza e carga de gás — 3 aparelhos",
    valor: 640,
    dataEnvio: iso(7),
    dataValidade: iso(-1),
    diasSemResposta: 7,
    status: "enviado",
    responsavel: "Marcos",
    ultimoContato: null,
    aguardandoFollowUp: true,
  },
  {
    id: "orc-003",
    cliente: { nome: "Padaria São Jorge", telefone: "(11) 9****-3333" },
    servico: "Manutenção preventiva mensal — câmara fria",
    valor: 890,
    dataEnvio: iso(6),
    dataValidade: iso(1),
    diasSemResposta: 6,
    status: "em_followup",
    responsavel: "Renata",
    ultimoContato: { canal: "telefone", data: iso(2), statusEnvio: "enviado" },
    aguardandoFollowUp: true,
  },
  {
    id: "orc-004",
    cliente: { nome: "Clínica Bem Estar", telefone: "(11) 9****-4444" },
    servico: "Troca de condensadora + suporte",
    valor: 4750,
    dataEnvio: iso(12),
    dataValidade: iso(-3),
    diasSemResposta: 12,
    status: "fechado",
    responsavel: "Renata",
    ultimoContato: { canal: "whatsapp", data: iso(5), statusEnvio: "lido" },
    aguardandoFollowUp: false,
  },
  {
    id: "orc-005",
    cliente: { nome: "Mercadinho da Esquina", telefone: "(11) 9****-5555" },
    servico: "Instalação de split 12.000 BTUs",
    valor: 1450,
    dataEnvio: iso(11),
    dataValidade: iso(-2),
    diasSemResposta: 11,
    status: "fechado",
    responsavel: "Marcos",
    ultimoContato: { canal: "whatsapp", data: iso(8), statusEnvio: "lido" },
    aguardandoFollowUp: false,
  },
  {
    id: "orc-006",
    cliente: { nome: "Studio Movimento", telefone: "(11) 9****-6666" },
    servico: "Projeto de climatização — sala 40 m²",
    valor: 2260,
    dataEnvio: iso(8),
    dataValidade: iso(2),
    diasSemResposta: 8,
    status: "respondido",
    responsavel: "Renata",
    ultimoContato: { canal: "whatsapp", data: iso(4), statusEnvio: "lido" },
    aguardandoFollowUp: false,
  },
  {
    id: "orc-007",
    cliente: { nome: "Escola Aprender", telefone: "(11) 9****-7777" },
    servico: "Contrato de manutenção preventiva — 6 salas",
    valor: 1980,
    dataEnvio: iso(4),
    dataValidade: iso(4),
    diasSemResposta: 4,
    status: "enviado",
    responsavel: "Renata",
    ultimoContato: null,
    aguardandoFollowUp: true,
  },
  {
    id: "orc-008",
    cliente: { nome: "Restante Bom Sabor", telefone: "(11) 9****-8888" },
    servico: "Reparo de vazamento — ilha refrigerada",
    valor: 720,
    dataEnvio: iso(3),
    dataValidade: iso(6),
    diasSemResposta: 3,
    status: "enviado",
    responsavel: "Marcos",
    ultimoContato: null,
    aguardandoFollowUp: true,
  },
  {
    id: "orc-009",
    cliente: { nome: "Escritório Central 45", telefone: "(11) 9****-9999" },
    servico: "Instalação de 4 splits de teto",
    valor: 8600,
    dataEnvio: iso(14),
    dataValidade: iso(-4),
    diasSemResposta: 14,
    status: "recusado",
    responsavel: "Renata",
    ultimoContato: { canal: "email", data: iso(6), statusEnvio: "entregue" },
    aguardandoFollowUp: false,
  },
  {
    id: "orc-010",
    cliente: { nome: "Lavanderia Cristal", telefone: "(11) 9****-0000" },
    servico: "Substituição de evaporadora",
    valor: 2040,
    dataEnvio: iso(5),
    dataValidade: iso(3),
    diasSemResposta: 5,
    status: "fechado",
    responsavel: "Marcos",
    ultimoContato: { canal: "telefone", data: iso(1), statusEnvio: "lido" },
    aguardandoFollowUp: false,
  },
  {
    id: "orc-011",
    cliente: { nome: "Condomínio Vista Alegre", telefone: "(11) 9****-1234" },
    servico: "Laudos de climatização — 12 unidades",
    valor: 3400,
    dataEnvio: iso(2),
    dataValidade: iso(8),
    diasSemResposta: 2,
    status: "enviado",
    responsavel: "Renata",
    ultimoContato: null,
    aguardandoFollowUp: true,
  },
  {
    id: "orc-012",
    cliente: { nome: "Café Aroma", telefone: "(11) 9****-4321" },
    servico: "Manutenção preventiva trimestral — 2 casas de máquinas",
    valor: 1180,
    dataEnvio: iso(10),
    dataValidade: iso(-1),
    diasSemResposta: 10,
    status: "expirado",
    responsavel: "Marcos",
    ultimoContato: { canal: "whatsapp", data: iso(7), statusEnvio: "falhou" },
    aguardandoFollowUp: false,
  },
];
