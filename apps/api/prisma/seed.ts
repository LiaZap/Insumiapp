import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Clínicas-clientes para a demo do back-office
const clinicasSeed = [
  { nome: 'Dra. Marina Costa', email: 'marina@clinicaviva.com.br', empresa: 'Clínica Viva Estética' },
  { nome: 'Dr. Rafael Lima', email: 'rafael@belezapura.com.br', empresa: 'Beleza Pura Pinheiros' },
  { nome: 'Dra. Camila Souza', email: 'camila@dermaplus.com.br', empresa: 'DermaPlus Jardins' },
  { nome: 'Dr. Bruno Almeida', email: 'bruno@institutoface.com.br', empresa: 'Instituto Face' },
  { nome: 'Dra. Patrícia Reis', email: 'patricia@esteticapremium.com.br', empresa: 'Estética Premium' },
  { nome: 'Dra. Juliana Martins', email: 'juliana@clinicabella.com.br', empresa: 'Clínica Bella Moema' },
  { nome: 'Dr. Thiago Nunes', email: 'thiago@harmoniaclinica.com.br', empresa: 'Harmonia Clínica' },
  { nome: 'Dra. Fernanda Dias', email: 'fernanda@reviveestetica.com.br', empresa: 'Revive Estética' },
];

const STATUS_FLOW = [
  'aguardando_cotacao',
  'cotado',
  'confirmado',
  'em_separacao',
  'enviado',
  'entregue',
] as const;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// Catálogo extraído do Figma (Busca de Medicamento 118:186)
const medicamentosSeed = [
  // Neuromoduladores
  { nome: 'Botox', principioAtivo: 'Toxina Botulínica Tipo A', fabricante: 'Allergan', apresentacao: 'Frasco', dosagem: '100u', categoria: 'neuromoduladores', precoUnitario: 1850.0, receituario: true },
  { nome: 'Dysport', principioAtivo: 'Toxina Botulínica Tipo A', fabricante: 'Ipsen', apresentacao: 'Frasco', dosagem: '500u', categoria: 'neuromoduladores', precoUnitario: 1490.0, receituario: true },
  { nome: 'Xeomin', principioAtivo: 'Toxina Botulínica Tipo A', fabricante: 'Merz', apresentacao: 'Frasco', dosagem: '100u', categoria: 'neuromoduladores', precoUnitario: 1620.0, receituario: true },

  // Bioestimuladores
  { nome: 'Sculptra', principioAtivo: 'Ácido Poli-L-Láctico', fabricante: 'Galderma', apresentacao: 'Frasco', dosagem: '150mg', categoria: 'bioestimuladores', precoUnitario: 2150.0 },
  { nome: 'Radiesse', principioAtivo: 'Hidroxiapatita de Cálcio', fabricante: 'Merz', apresentacao: 'Seringa', dosagem: '1.5ml', categoria: 'bioestimuladores', precoUnitario: 1980.0 },
  { nome: 'Ellansé', principioAtivo: 'Policaprolactona', fabricante: 'Sinclair', apresentacao: 'Seringa', dosagem: '1ml', categoria: 'bioestimuladores', precoUnitario: 2750.0 },

  // Preenchedores
  { nome: 'Juvederm Voluma', principioAtivo: 'Ácido Hialurônico', fabricante: 'Allergan', apresentacao: 'Seringa', dosagem: '1ml', categoria: 'preenchedores', precoUnitario: 1450.0 },
  { nome: 'Restylane Lyft', principioAtivo: 'Ácido Hialurônico', fabricante: 'Galderma', apresentacao: 'Seringa', dosagem: '1ml', categoria: 'preenchedores', precoUnitario: 1380.0 },
  { nome: 'Belotero Volume', principioAtivo: 'Ácido Hialurônico', fabricante: 'Merz', apresentacao: 'Seringa', dosagem: '1ml', categoria: 'preenchedores', precoUnitario: 1290.0 },

  // Enzimas
  { nome: 'Hialuronidase', principioAtivo: 'Hialuronidase', fabricante: 'Halex Istar', apresentacao: 'Frasco', dosagem: '1500u', categoria: 'enzimas', precoUnitario: 89.0, receituario: true },

  // Anestésicos
  { nome: 'EMLA', principioAtivo: 'Lidocaína + Prilocaína', fabricante: 'Astrazeneca', apresentacao: 'Bisnaga', dosagem: '30g', categoria: 'anestesicos', precoUnitario: 75.0 },
  { nome: 'Dermomax', principioAtivo: 'Lidocaína', fabricante: 'Aché', apresentacao: 'Bisnaga', dosagem: '30g', categoria: 'anestesicos', precoUnitario: 58.0 },

  // Antissépticos & Soluções
  { nome: 'Clorexidina Alcoólica 0,5%', principioAtivo: 'Clorexidina', fabricante: 'Rioquímica', apresentacao: 'Frasco', dosagem: '100ml', categoria: 'antissepticos', precoUnitario: 18.5 },
  { nome: 'Soro Fisiológico 0,9%', principioAtivo: 'NaCl 0,9%', fabricante: 'Equiplex', apresentacao: 'Frasco', dosagem: '500ml', categoria: 'solucoes', precoUnitario: 9.9 },

  // Corticoides
  { nome: 'Diprospan', principioAtivo: 'Betametasona', fabricante: 'Organon', apresentacao: 'Ampola', dosagem: '1ml', categoria: 'corticoides', precoUnitario: 42.0, receituario: true },

  // Insumos
  { nome: 'Agulha 30G x 13mm', fabricante: 'BD', apresentacao: 'Caixa', dosagem: '100un', categoria: 'insumos', precoUnitario: 38.0 },
  { nome: 'Seringa 1ml Luer Lock', fabricante: 'BD', apresentacao: 'Caixa', dosagem: '100un', categoria: 'insumos', precoUnitario: 95.0 },
];

async function main() {
  for (const m of medicamentosSeed) {
    const exists = await prisma.medicamento.findFirst({
      where: { nome: m.nome, fabricante: m.fabricante ?? undefined },
    });
    if (!exists) {
      await prisma.medicamento.create({ data: m });
    }
  }

  // Custo (para cálculo de margem na cotação) — 55-72% do preço
  const todosMedicamentos = await prisma.medicamento.findMany();
  for (const med of todosMedicamentos) {
    if (med.custo == null) {
      const fator = 0.55 + Math.random() * 0.17;
      await prisma.medicamento.update({
        where: { id: med.id },
        data: { custo: Math.round(Number(med.precoUnitario) * fator * 100) / 100 },
      });
    }
  }

  // Seed inicial de estoque (apenas pra produtos que ainda não têm)
  const meds = await prisma.medicamento.findMany();
  for (const med of meds) {
    const has = await prisma.estoqueItem.findFirst({
      where: { medicamentoId: med.id },
    });
    if (!has) {
      // Quantidades variando — alguns com estoque baixo p/ visualizar status
      const qty =
        med.nome === 'Radiesse' ? 3 : med.nome === 'Ellansé' ? 8 : 50 + Math.floor(Math.random() * 950);
      await prisma.estoqueItem.create({
        data: {
          medicamentoId: med.id,
          quantidade: qty,
          localizacao: 'Almoxarifado A',
        },
      });
    }
  }

  // Clínicas-clientes
  const senhaHash = await bcrypt.hash('demo12345', 10);
  const clientes: { id: string }[] = [];
  for (const c of clinicasSeed) {
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    const user =
      existing ??
      (await prisma.user.create({
        data: {
          nome: c.nome,
          email: c.email,
          empresa: c.empresa,
          passwordHash: senhaHash,
          role: 'comprador',
        },
      }));
    clientes.push({ id: user.id });
  }

  // Pedidos históricos — regenera dataset de demo se houver poucos pedidos
  const pedidosExistentes = await prisma.pedido.count();
  if (pedidosExistentes < 60) {
    // Limpa pedidos/contas antigos para um dataset de demo consistente
    await prisma.conta.deleteMany({ where: { pedidoId: { not: null } } });
    await prisma.pedidoItem.deleteMany({});
    await prisma.pedido.deleteMany({});

    const todosMeds = await prisma.medicamento.findMany();
    const TOTAL = 150;
    for (let i = 0; i < TOTAL; i++) {
      const cliente = pick(clientes);
      // Viés recente: maioria nos últimos 30 dias, cauda até 90
      const diasAtras = Math.floor(Math.pow(Math.random(), 1.6) * 90);
      const criadoEm = new Date();
      criadoEm.setDate(criadoEm.getDate() - diasAtras);
      criadoEm.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

      // Status proporcional à idade: pedidos antigos mais avançados
      const maxStep = diasAtras > 50 ? 6 : diasAtras > 20 ? 5 : diasAtras > 7 ? 4 : 3;
      let status: string = STATUS_FLOW[Math.floor(Math.random() * maxStep)]!;
      if (Math.random() < 0.08) status = 'cancelado';

      const nItens = 1 + Math.floor(Math.random() * 4);
      const itens = Array.from({ length: nItens }).map(() => {
        const med = pick(todosMeds);
        return {
          medicamentoId: med.id,
          quantidade: 1 + Math.floor(Math.random() * 6),
          precoUnitario: Number(med.precoUnitario),
        };
      });
      const total = itens.reduce((s, it) => s + it.precoUnitario * it.quantidade, 0);
      const numero = `PED-${(700000 + i).toString(36).toUpperCase()}`;

      const pedido = await prisma.pedido.create({
        data: { numero, status: status as never, total, usuarioId: cliente.id, criadoEm, itens: { create: itens } },
      });

      // Conta a pagar correspondente
      const venc = new Date(criadoEm);
      venc.setDate(venc.getDate() + 7);
      const contaPaga = status === 'entregue' || Math.random() < 0.4;
      await prisma.conta.create({
        data: {
          tipo: 'pagar',
          descricao: `Pedido ${numero}`,
          valor: total,
          vencimento: venc,
          pedidoId: pedido.id,
          status: contaPaga ? 'paga' : 'aberta',
          pagoEm: contaPaga ? new Date(venc.getTime() - 86400000) : null,
        },
      });
    }
  }

  // Backfill de agrupamentos — todo item de pedido pendente entra num
  // agrupamento aberto do seu medicamento (compra coletiva).
  const itensSemAgrupamento = await prisma.pedidoItem.findMany({
    where: {
      agrupamentoId: null,
      pedido: { status: { in: ['aguardando_cotacao', 'cotado'] } },
    },
  });
  // 1 agrupamento aberto por medicamento
  const agrupamentoPorMed = new Map<string, string>();
  for (const item of itensSemAgrupamento) {
    let agrId = agrupamentoPorMed.get(item.medicamentoId);
    if (!agrId) {
      const existente = await prisma.agrupamento.findFirst({
        where: { medicamentoId: item.medicamentoId, status: 'aberto' },
      });
      if (existente) {
        agrId = existente.id;
      } else {
        const numero = `AGR-${Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase()}`;
        const novo = await prisma.agrupamento.create({
          data: { numero, medicamentoId: item.medicamentoId, status: 'aberto' },
        });
        agrId = novo.id;
      }
      agrupamentoPorMed.set(item.medicamentoId, agrId);
    }
    await prisma.pedidoItem.update({
      where: { id: item.id },
      data: { agrupamentoId: agrId },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seed ok: ${medicamentosSeed.length} medicamentos + estoque + ${clinicasSeed.length} clínicas + pedidos + ${agrupamentoPorMed.size} agrupamentos`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
