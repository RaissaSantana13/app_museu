export interface ObraDetalhes {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  img: any;
  categories: string[];
  year?: string;
  artist?: string;
  material?: string;
}

export interface EventoDetalhes {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageSource: any;
  isSoldOut?: boolean;
}

export interface ExposicaoDetalhes {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageSource: any;
}

export interface EscolaDetalhes {
  id: string;
  name: string;
  cnpj: string;
}

export interface TurmaDetalhes {
  id: string;
  schoolId: string;
  representativeId: string;
  name: string;
  totalStudents: number;
}

export interface RepresentanteDetalhes {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const ARTWORKS_DATA: ObraDetalhes[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Troféu Locomotiva de Bronze",
    description:
      "Prêmio comemorativo institucional em formato de locomotiva sobre base metálica",
    fullDescription:
      "Um troféu ou placa de homenagem institucional intitulado 'Locomotiva de Prata', concedido à Agatha Dafine Velani pelo Real Seguros (agência 123-8 - São Caetano / Sucursal Santo André). A peça traz a inscrição 'Nossa Maior Conquista: Ação do Vida', celebrando metas ou conquistas alcançadas em julho de 2006. Apresenta uma miniatura detalhada de uma locomotiva a vapor sobre trilhos, fixada em uma base retangular robusta, inteiramente com acabamento prateado.",
    img: require("../assets/images/train.jpg"),
    categories: [
      "Premiações",
      "Memorabilia Corporativa",
      "Anos 2000",
      "Ferromodelismo",
    ],
    year: "2006",
    artist: "Real Seguros",
    material: "Metal com acabamento prateado",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Microfone Condensador Behringer B-1",
    description:
      "Microfone de estúdio condensador de grande diafragma com padrão polar cardioide.",
    fullDescription:
      "O Behringer B-1 é um microfone condensador de grande diafragma projetado para gravação em estúdio. Possui uma cápsula banhada a ouro, padrão de captação cardioide que reduz ruídos laterais, e chaves físicas no corpo para atenuação de entrada (-10 dB) e filtro de corte de graves (low-cut). É um equipamento clássico de áudio profissional, ideal para vozes e instrumentos acústicos, exigindo alimentação Phantom Power (+48V) para funcionamento.",
    img: require("../assets/images/microphone.png"),
    categories: ["Áudio Profissional", "Equipamento de Estúdio", "Microfones"],
    year: "2000-Presente",
    artist: "Behringer",
    material: "Metal niquelado e componentes eletrônicos",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Cálice de Madeira Indígena",
    description:
      "Cálice artesanal esculpido em madeira nobre com acabamento polido, de origem indígena.",
    fullDescription:
      "Um cálice utilitário ou ritualístico, confeccionado artesanalmente a partir de um único bloco de madeira de lei. A peça apresenta linhas orgânicas e elegantes, uma copa ogival profunda e uma base circular de sustentação bem definida. O trabalho de tornearia ou escultura manual destaca os veios naturais escuros da madeira, recebendo um polimento fino que confere um aspecto acetinado e sofisticado ao objeto.",
    img: require("../assets/images/cup.jpg"),
    categories: [
      "Arte Indígena",
      "Artesanato",
      "Utensílios de Madeira",
      "Arte Sacra e Ritualistica",
    ],
    year: "1600-1800",
    artist: "Artesão Indígena Desconhecido",
    material: "Madeira maciça",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Telefone de Parede Antigo",
    description:
      "Telefone de parede vintage em madeira e metal com sistema de manivela magnética do início do século XX.",
    fullDescription:
      "Um clássico telefone de parede do final do século XIX ou início do século XX, montado em uma estrutura de madeira nobre. O aparelho possui um sistema de campainha dupla de metal no topo, um bocal/receptor conectado por cabo de tecido e uma manivela lateral utilizada para gerar corrente e chamar a telefonista. Este tipo de objeto representa um marco na evolução das telecomunicações globais.",
    img: require("../assets/images/old_telephone.jpg"),
    categories: ["Antiguidades", "Telecomunicações", "História da Tecnologia"],
    year: "1890-1920",
    artist: "LM Ericsson & Co.",
    material: "Madeira, ferro e latão",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Jarro de Terracota",
    description:
      "Jarro de terracota artesanal, com acabamento único e detalhes handcrafted.",
    fullDescription:
      "Este recipiente de terracota, marcado pelo tempo e com o bocal quebrado, era utilizado pelos primeiros habitantes de Birigui-SP para armazenar e refrescar água. Hoje, a peça é um importante registro histórico que simboliza o trabalho, a simplicidade e a resiliência dos pioneiros no interior paulista.",
    img: require("../assets/images/terracota_jug.jpg"),
    categories: [
      "Arte Indígena",
      "Artesanato",
      "Utensílios de Argila",
      "Arte Sacra e Ritualistica",
    ],
    year: "1901-2000",
    artist: "Artesão Indígena Desconhecido",
    material: "Argila cozida",
  },
];

export const EVENTS_DATA: EventoDetalhes[] = [
  {
    id: "1",
    title: "O solo vira arte",
    startDate: "24 maio 26",
    endDate: "3 junho 26",
    imageSource: require("../assets/images/react-logo.png"), // Corrigido de ../../ para ../
    isSoldOut: true,
  },
  {
    id: "2",
    title: "Sons do Passado",
    startDate: "28 maio 26",
    endDate: "10 junho 26",
    imageSource: require("../assets/images/react-logo.png"), // Corrigido de ../../ para ../
    isSoldOut: false,
  },
];

export const EXHIBITIONS_DATA: ExposicaoDetalhes[] = [
  {
    id: "1",
    title: "O solo vira arte",
    startDate: "24 maio 26",
    endDate: "3 junho 26",
    imageSource: require("../assets/images/react-logo.png"), // Corrigido de ../../ para ../
  },
  {
    id: "2",
    title: "Mundo em Cores",
    startDate: "24 maio 26",
    endDate: "3 junho 26",
    imageSource: require("../assets/images/react-logo.png"), // Corrigido de ../../ para ../
  },
];

export const SCHOOLS_DATA: EscolaDetalhes[] = [
  {
    id: "1",
    name: "E.E. Prof. Stélio Machado Loureiro",
    cnpj: "46.123.456/0001-89",
  },
  {
    id: "2",
    name: "E.E. Dr. Carlos Carvalho Rosa",
    cnpj: "12.345.678/0001-90",
  },
];

export const GROUPS_DATA: TurmaDetalhes[] = [
  {
    id: "1",
    schoolId: "1",
    representativeId: "1",
    name: "9º Ano B",
    totalStudents: 32,
  },
  {
    id: "2",
    schoolId: "1",
    representativeId: "2",
    name: "8º Ano A",
    totalStudents: 28,
  },
  {
    id: "3",
    schoolId: "2",
    representativeId: "3",
    name: "3º Ano A",
    totalStudents: 25,
  },
];

export const REPRESENTATIVES_DATA: RepresentanteDetalhes[] = [
  {
    id: "1",
    name: "Mariana Souza Silva",
    email: "mariana@educacao.sp.gov.br",
    phone: "(18) 99123-4567",
  },
  {
    id: "2",
    name: "Carlos Oliveira Santos",
    email: "carlos@example.com",
    phone: "(18) 99234-5678",
  },
  {
    id: "3",
    name: "Ana Paula Costa",
    email: "ana@example.com",
    phone: "(18) 99345-6789",
  },
];
