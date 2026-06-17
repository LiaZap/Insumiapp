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

// Catálogo "soft" — produtos cosméticos, descartáveis e materiais de uso geral.
// Evita itens que possam preocupar revisores de app store (medicamentos
// controlados, anestésicos, toxinas). Foco em estética e higiene.
const medicamentosSeed = [
  // Estética — cosméticos
  { nome: 'Esmalte Vermelho 9ml', fabricante: 'Risqué', apresentacao: 'Frasco', dosagem: '9ml', categoria: 'estetica', precoUnitario: 8.9 },
  { nome: 'Esmalte Nude 9ml', fabricante: 'Risqué', apresentacao: 'Frasco', dosagem: '9ml', categoria: 'estetica', precoUnitario: 8.9 },
  { nome: 'Esmalte Base Fortalecedora', fabricante: 'Risqué', apresentacao: 'Frasco', dosagem: '8ml', categoria: 'estetica', precoUnitario: 12.5 },
  { nome: 'Removedor de Esmalte sem Acetona', fabricante: 'Granado', apresentacao: 'Frasco', dosagem: '100ml', categoria: 'estetica', precoUnitario: 9.9 },
  { nome: 'Óleo de Cutícula', fabricante: 'Mãe Terra', apresentacao: 'Frasco', dosagem: '7ml', categoria: 'estetica', precoUnitario: 14.0 },
  { nome: 'Creme Hidratante para Mãos', fabricante: 'Granado', apresentacao: 'Bisnaga', dosagem: '100g', categoria: 'estetica', precoUnitario: 22.0 },
  { nome: 'Máscara Facial Hidratante', fabricante: 'Vult', apresentacao: 'Sachê', dosagem: '8g', categoria: 'estetica', precoUnitario: 18.0 },

  // Higiene
  { nome: 'Álcool em Gel 70%', fabricante: 'Asseptgel', apresentacao: 'Frasco', dosagem: '500ml', categoria: 'higiene', precoUnitario: 14.9 },
  { nome: 'Sabonete Líquido Antibacteriano', fabricante: 'Asseptgel', apresentacao: 'Frasco', dosagem: '250ml', categoria: 'higiene', precoUnitario: 11.5 },

  // Descartáveis
  { nome: 'Luvas de Procedimento Tamanho M', fabricante: 'Descarpack', apresentacao: 'Caixa', dosagem: '100un', categoria: 'descartaveis', precoUnitario: 38.0 },
  { nome: 'Luvas de Procedimento Tamanho P', fabricante: 'Descarpack', apresentacao: 'Caixa', dosagem: '100un', categoria: 'descartaveis', precoUnitario: 38.0 },
  { nome: 'Máscara Cirúrgica Tripla', fabricante: 'Descarpack', apresentacao: 'Caixa', dosagem: '50un', categoria: 'descartaveis', precoUnitario: 19.9 },
  { nome: 'Touca Descartável Sanfonada', fabricante: 'Descarpack', apresentacao: 'Pacote', dosagem: '100un', categoria: 'descartaveis', precoUnitario: 16.0 },
  { nome: 'Avental Descartável TNT', fabricante: 'Descarpack', apresentacao: 'Pacote', dosagem: '10un', categoria: 'descartaveis', precoUnitario: 24.0 },
  { nome: 'Lençol Descartável para Maca', fabricante: 'Descarpack', apresentacao: 'Rolo', dosagem: '50m', categoria: 'descartaveis', precoUnitario: 32.0 },

  // Material
  { nome: 'Gaze Estéril 7,5x7,5cm', fabricante: 'Cremer', apresentacao: 'Pacote', dosagem: '10un', categoria: 'material', precoUnitario: 4.5 },
  { nome: 'Algodão Hidrófilo', fabricante: 'Cremer', apresentacao: 'Pacote', dosagem: '100g', categoria: 'material', precoUnitario: 7.9 },
  { nome: 'Cotonete Hastes Flexíveis', fabricante: 'Johnson', apresentacao: 'Caixa', dosagem: '75un', categoria: 'material', precoUnitario: 5.9 },
  { nome: 'Espátula de Madeira', fabricante: 'Theoto', apresentacao: 'Pacote', dosagem: '100un', categoria: 'material', precoUnitario: 9.5 },
  { nome: 'Toalha de Papel Descartável', fabricante: 'Scott', apresentacao: 'Pacote', dosagem: '100un', categoria: 'material', precoUnitario: 18.0 },

  // Antissépticos & Soluções
  { nome: 'Clorexidina Aquosa 2%', fabricante: 'Rioquímica', apresentacao: 'Frasco', dosagem: '100ml', categoria: 'antissepticos', precoUnitario: 16.0 },
  { nome: 'Soro Fisiológico 0,9%', fabricante: 'Equiplex', apresentacao: 'Frasco', dosagem: '500ml', categoria: 'solucoes', precoUnitario: 9.9 },

  // Insumos
  { nome: 'Frasco Dosador 30ml', fabricante: 'Cralplast', apresentacao: 'Pacote', dosagem: '10un', categoria: 'insumos', precoUnitario: 14.0 },
  { nome: 'Pote para Creme 50g', fabricante: 'Cralplast', apresentacao: 'Pacote', dosagem: '12un', categoria: 'insumos', precoUnitario: 22.0 },
];

async function main() {
  // Se o banco ainda tem catálogo antigo (medicamentos controlados), zera tudo
  // que depende disso antes de cadastrar o catálogo novo.
  const catalogoAntigo = await prisma.medicamento.findFirst({
    where: { nome: { in: ['Botox', 'Dysport', 'Xeomin', 'EMLA', 'Dermomax'] } },
  });
  if (catalogoAntigo) {
    await prisma.conta.deleteMany({ where: { pedidoId: { not: null } } });
    await prisma.lance.deleteMany({});
    await prisma.movimentacao.deleteMany({});
    await prisma.pedidoItem.deleteMany({});
    await prisma.pedido.deleteMany({});
    await prisma.estoqueItem.deleteMany({});
    await prisma.agrupamento.deleteMany({});
    await prisma.medicamento.deleteMany({});
  }

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

  // Conta admin do cliente (Valério) — login do back-office.
  // upsert garante que o nome seja atualizado mesmo se a conta já existir.
  const senhaHash = await bcrypt.hash('demo12345', 10);
  const valerio = await prisma.user.upsert({
    where: { email: 'valerio@insumia.app' },
    update: { nome: 'Valério', empresa: 'Insumia', role: 'admin' },
    create: {
      nome: 'Valério',
      email: 'valerio@insumia.app',
      empresa: 'Insumia',
      passwordHash: senhaHash,
      role: 'admin',
    },
  });

  // Clínicas-clientes
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

  // Estoque + movimentações POR CLÍNICA — cada uma tem o seu próprio estoque.
  const usuariosComEstoque = [valerio.id, ...clientes.map((c) => c.id)];
  const estoqueExistente = await prisma.estoqueItem.count();
  if (estoqueExistente === 0) {
    const meds = await prisma.medicamento.findMany();
    for (const usuarioId of usuariosComEstoque) {
      for (const med of meds) {
        // ~80% dos medicamentos presentes no estoque de cada clínica
        if (Math.random() < 0.2) continue;
        // Alguns itens baixos/esgotados p/ visualizar status
        const qty =
          Math.random() < 0.15
            ? Math.floor(Math.random() * 9)
            : 12 + Math.floor(Math.random() * 180);

        // Validade variada (FEFO — alimenta o alerta de vencimento)
        const r = Math.random();
        const validade = new Date();
        if (r < 0.12) validade.setDate(validade.getDate() - Math.floor(10 + Math.random() * 60));
        else if (r < 0.35) validade.setDate(validade.getDate() + Math.floor(5 + Math.random() * 55));
        else validade.setDate(validade.getDate() + Math.floor(120 + Math.random() * 600));

        await prisma.estoqueItem.create({
          data: {
            usuarioId,
            medicamentoId: med.id,
            quantidade: qty,
            validade,
            lote: `LT-${Math.floor(100000 + Math.random() * 900000)}`,
            localizacao: 'Almoxarifado',
          },
        });
      }

      // Histórico de movimentações (últimos 30 dias) — alimenta o gráfico
      const nMov = 20 + Math.floor(Math.random() * 25);
      for (let i = 0; i < nMov; i++) {
        const med = pick(meds);
        const criadoEm = new Date();
        criadoEm.setDate(criadoEm.getDate() - Math.floor(Math.random() * 30));
        criadoEm.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        await prisma.movimentacao.create({
          data: {
            medicamentoId: med.id,
            usuarioId,
            tipo: Math.random() < 0.7 ? 'saida' : 'entrada',
            quantidade: 1 + Math.floor(Math.random() * 5),
            criadoEm,
          },
        });
      }
    }
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

  // Fornecedores de exemplo
  const fornecedoresSeed = [
    { nome: 'Distribuidora Alfa Med', cnpj: '12.345.678/0001-90', email: 'comercial@alfamed.com.br' },
    { nome: 'MedSupply Beta', cnpj: '23.456.789/0001-01', email: 'vendas@medsupply.com.br' },
    { nome: 'Estética Distribuição Gama', cnpj: '34.567.890/0001-12', email: 'contato@gamadist.com.br' },
    { nome: 'BioInsumos Delta', cnpj: '45.678.901/0001-23', email: 'cotacao@bioinsumos.com.br' },
  ];
  for (const f of fornecedoresSeed) {
    const existe = await prisma.fornecedor.findFirst({ where: { nome: f.nome } });
    if (!existe) await prisma.fornecedor.create({ data: f });
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
