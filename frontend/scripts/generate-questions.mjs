import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../src/data/questions.json");

const categories = {
  LEGISLACAO: "LEGISLACAO",
  DIRECAO_DEFENSIVA: "DIRECAO_DEFENSIVA",
  PRIMEIROS_SOCORROS: "PRIMEIROS_SOCORROS",
  MEIO_AMBIENTE_CIDADANIA: "MEIO_AMBIENTE_CIDADANIA",
  MECANICA: "MECANICA",
};

const links = {
  ctb: "https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",
  resolucao168:
    "https://www.gov.br/transportes/pt-br/centrais-de-conteudo/resolucao-contran-168-04-compilada-pdf/view",
  sinalizacao:
    "https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito",
  prf: "https://www.gov.br/prf/pt-br/seguranca-viaria/educacao-para-o-transito",
  samu: "https://www.gov.br/saude/pt-br/composicao/saes/samu-192",
  senatran:
    "https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/",
  meioAmbiente: "https://www.gov.br/mma/pt-br/composicao/conama",
};

const variants3 = [
  "Na prova teorica para primeira habilitacao,",
  "Em uma situacao cotidiana de transito,",
  "Ao analisar uma questao de simulado do DETRAN,",
];

const variants2 = [
  "Na direcao preventiva,",
  "Em uma situacao real de conducao,",
];

function createQuestion(category, index, topic, intro) {
  return {
    id: `${category.toLowerCase()}-${String(index).padStart(3, "0")}`,
    enunciado: polishText(`${intro} ${topic.pergunta}`),
    alternativas: {
      A: polishText(topic.correta),
      B: polishText(topic.erradas[0]),
      C: polishText(topic.erradas[1]),
      D: polishText(topic.erradas[2]),
    },
    resposta_correta: "A",
    categoria: category,
    assunto: polishText(topic.assunto),
    explicacao: polishText(topic.explicacao),
    link_estudo: topic.link,
    imagem_url: topic.imagem_url ?? null,
  };
}

function polishText(value) {
  return [
    [/\bteorica\b/g, "teórica"],
    [/\btransito\b/g, "trânsito"],
    [/\bTransito\b/g, "Trânsito"],
    [/\bdirecao\b/g, "direção"],
    [/\bDirecao\b/g, "Direção"],
    [/\bconducao\b/g, "condução"],
    [/\bConducao\b/g, "Condução"],
    [/\bquestao\b/g, "questão"],
    [/\bquestoes\b/g, "questões"],
    [/\bsituacao\b/g, "situação"],
    [/\bsituacoes\b/g, "situações"],
    [/\bhabilitacao\b/g, "habilitação"],
    [/\batencao\b/g, "atenção"],
    [/\bseguranca\b/g, "segurança"],
    [/\bSeguranca\b/g, "Segurança"],
    [/\bemergencia\b/g, "emergência"],
    [/\bEmergencia\b/g, "Emergência"],
    [/\bveiculo\b/g, "veículo"],
    [/\bVeiculo\b/g, "Veículo"],
    [/\bveiculos\b/g, "veículos"],
    [/\bVeiculos\b/g, "Veículos"],
    [/\bvisivel\b/g, "visível"],
    [/\bvisiveis\b/g, "visíveis"],
    [/\bpossivel\b/g, "possível"],
    [/\bPossivel\b/g, "Possível"],
    [/\bproximo\b/g, "próximo"],
    [/\bproxima\b/g, "próxima"],
    [/\bpropria\b/g, "própria"],
    [/\bproprio\b/g, "próprio"],
    [/\balcool\b/g, "álcool"],
    [/\bAlcool\b/g, "Álcool"],
    [/\bdistancia\b/g, "distância"],
    [/\breacao\b/g, "reação"],
    [/\bsinalizacao\b/g, "sinalização"],
    [/\bfiscalizacao\b/g, "fiscalização"],
    [/\binfracao\b/g, "infração"],
    [/\binfracoes\b/g, "infrações"],
    [/\bpreferencia\b/g, "preferência"],
    [/\bambulancia\b/g, "ambulância"],
    [/\bvitima\b/g, "vítima"],
    [/\bvitimas\b/g, "vítimas"],
    [/\barea\b/g, "área"],
    [/\bagua\b/g, "água"],
    [/\boleo\b/g, "óleo"],
    [/\bpoluicao\b/g, "poluição"],
    [/\bemissoes\b/g, "emissões"],
    [/\bcombustivel\b/g, "combustível"],
    [/\bmecanica\b/g, "mecânica"],
    [/\bMecanica\b/g, "Mecânica"],
    [/\bbasica\b/g, "básica"],
    [/\bacustico\b/g, "acústico"],
    [/\beletrico\b/g, "elétrico"],
    [/\bbasico\b/g, "básico"],
    [/\btrafego\b/g, "tráfego"],
    [/\brapido\b/g, "rápido"],
    [/\brapidamente\b/g, "rapidamente"],
    [/\bate\b/g, "até"],
    [/\bsonolencia\b/g, "sonolência"],
    [/\be correta\b/g, "é correta"],
    [/\be recomendado\b/g, "é recomendado"],
    [/\be inadequado\b/g, "é inadequado"],
    [/\badequada e\b/g, "adequada é"],
    [/\badequado e\b/g, "adequado é"],
    [/\bdefensiva e\b/g, "defensiva é"],
    [/\bimportante e\b/g, "importante é"],
    [/\bsegura e\b/g, "segura é"],
    [/\binicial e\b/g, "inicial é"],
    [/\berrada e\b/g, "errada é"],
    [/\bAceleracao\b/g, "Aceleração"],
    [/\baceleracao\b/g, "aceleração"],
    [/\bconsequencia\b/g, "consequência"],
    [/\bperiodo\b/g, "período"],
    [/\bperiodos\b/g, "períodos"],
    [/\bfisico\b/g, "físico"],
    [/\bfisica\b/g, "física"],
    [/\bdigital valido\b/g, "digital válido"],
    [/\bmaxima\b/g, "máxima"],
    [/\bminimo\b/g, "mínimo"],
    [/\bcontrario\b/g, "contrário"],
    [/\bcontramao\b/g, "contramão"],
    [/\bultrapassagem\b/g, "ultrapassagem"],
    [/\bexcecoes\b/g, "exceções"],
    [/\btrajetoria\b/g, "trajetória"],
    [/\bvisao\b/g, "visão"],
    [/\blesao\b/g, "lesão"],
    [/\blesoes\b/g, "lesões"],
    [/\brespiracao\b/g, "respiração"],
    [/\baereas\b/g, "aéreas"],
    [/\bposicao\b/g, "posição"],
    [/\bcapacitacao\b/g, "capacitação"],
    [/\breciclagem\b/g, "reciclagem"],
    [/\blubrificante\b/g, "lubrificante"],
    [/\bmanutencao\b/g, "manutenção"],
    [/\bsubstituicao\b/g, "substituição"],
    [/\bcondicoes\b/g, "condições"],
    [/\bpocas d'água\b/g, "poças d'água"],
    [/\bpocas d'agua\b/g, "poças d'água"],
    [/\bvoce\b/g, "você"],
    [/\bê\b/g, "ê"],
  ].reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function expand(category, topics, variants, total) {
  const questions = [];

  for (const topic of topics) {
    for (const variant of variants) {
      questions.push(
        createQuestion(
          category,
          questions.length + 1,
          topic,
          `${variant}`
        )
      );

      if (questions.length === total) {
        return questions;
      }
    }
  }

  return questions;
}

const legislationTopics = [
  {
    assunto: "Art. 28 do CTB",
    pergunta:
      "qual atitude melhor representa o dever do condutor de manter dominio do veiculo?",
    correta:
      "Dirigir com atencao constante, dominio do veiculo e cuidados indispensaveis a seguranca.",
    erradas: [
      "Acelerar para acompanhar o fluxo mesmo quando a visibilidade estiver ruim.",
      "Conduzir apenas com uma das maos sempre que a via estiver livre.",
      "Confiar somente na preferencia de passagem e deixar de observar os demais usuarios.",
    ],
    explicacao:
      "O CTB exige que o condutor tenha dominio do veiculo e dirija com atencao e cuidados permanentes. A regra vale mesmo em vias conhecidas ou aparentemente tranquilas.",
    link: links.ctb,
  },
  {
    assunto: "Deslocamento lateral",
    pergunta:
      "antes de mudar de faixa, converter ou fazer retorno, qual deve ser a conduta correta?",
    correta:
      "Sinalizar com antecedencia, observar espelhos e pontos cegos e executar a manobra com seguranca.",
    erradas: [
      "Mudar de faixa rapidamente para evitar que outro veiculo ocupe o espaco.",
      "Acionar a seta apenas depois de iniciar a manobra.",
      "Usar a buzina para avisar que os demais devem abrir passagem.",
    ],
    explicacao:
      "Mudanca de faixa, conversao e retorno dependem de sinalizacao previa e verificacao das condicoes de seguranca, principalmente espelhos e pontos cegos.",
    link: links.ctb,
  },
  {
    assunto: "Alcool e direcao",
    pergunta:
      "se o condutor ingeriu bebida alcoolica, qual alternativa esta de acordo com a legislacao e a seguranca?",
    correta:
      "Nao dirigir e utilizar transporte alternativo ou condutor habilitado que nao tenha bebido.",
    erradas: [
      "Dirigir devagar, pois baixa velocidade elimina o risco.",
      "Tomar cafe e aguardar alguns minutos para reduzir os efeitos.",
      "Dirigir apenas em ruas pouco movimentadas.",
    ],
    explicacao:
      "Alcool compromete reflexos, julgamento e coordenacao. A conduta segura e legal e nao dirigir apos beber.",
    link: links.ctb,
  },
  {
    assunto: "Cinto de seguranca",
    pergunta:
      "qual afirmacao sobre o uso do cinto de seguranca esta correta?",
    correta:
      "O cinto deve ser usado pelo condutor e por todos os passageiros, inclusive no banco traseiro.",
    erradas: [
      "O cinto no banco traseiro e opcional em trajetos curtos.",
      "O cinto e necessario apenas em rodovias.",
      "Passageiros adultos podem escolher se desejam usar o cinto.",
    ],
    explicacao:
      "O cinto e equipamento obrigatorio e reduz a gravidade de lesoes. A exigencia vale para todos os ocupantes do veiculo.",
    link: links.ctb,
  },
  {
    assunto: "Limites de velocidade",
    pergunta:
      "ao perceber que esta acima da velocidade maxima permitida, o que o condutor deve fazer?",
    correta:
      "Reduzir gradualmente ate o limite permitido, mantendo distancia segura dos demais veiculos.",
    erradas: [
      "Frear bruscamente para ficar abaixo do limite imediatamente.",
      "Manter a velocidade se a via estiver vazia.",
      "Aumentar a velocidade para concluir o trajeto mais rapido.",
    ],
    explicacao:
      "O excesso de velocidade aumenta o risco e a gravidade dos sinistros. A reducao deve ser controlada, sem criar risco adicional.",
    link: links.ctb,
  },
  {
    assunto: "Licenciamento e documentos",
    pergunta:
      "qual documento comprova que o veiculo esta licenciado para circular?",
    correta:
      "O Certificado de Registro e Licenciamento de Veiculo, em meio fisico ou digital valido.",
    erradas: [
      "A nota fiscal de compra do veiculo.",
      "O comprovante de pagamento do seguro do veiculo.",
      "A carteira de identidade do proprietario.",
    ],
    explicacao:
      "O CRLV, fisico ou digital, comprova o licenciamento. Circular sem licenciamento regular pode gerar infracao e remocao do veiculo.",
    link: links.ctb,
  },
  {
    assunto: "Cruzamento nao sinalizado",
    pergunta:
      "em um cruzamento nao sinalizado entre vias de mesma importancia, quem tem preferencia?",
    correta:
      "O veiculo que vier pela direita do condutor.",
    erradas: [
      "O veiculo que estiver em maior velocidade.",
      "O veiculo maior ou mais pesado.",
      "O condutor que chegar primeiro, sem necessidade de reduzir.",
    ],
    explicacao:
      "Em cruzamento nao sinalizado de vias equivalentes, a regra geral de preferencia favorece quem vem pela direita, sem dispensar prudencia.",
    link: links.ctb,
  },
  {
    assunto: "Rotatoria",
    pergunta:
      "ao se aproximar de uma rotatoria sem sinalizacao especifica, qual veiculo tem preferencia?",
    correta:
      "O veiculo que ja estiver circulando pela rotatoria.",
    erradas: [
      "O veiculo que estiver entrando pela direita.",
      "O veiculo que buzinar primeiro.",
      "O veiculo de maior porte, independentemente da posicao.",
    ],
    explicacao:
      "A preferencia e de quem ja circula pela rotatoria. Quem pretende entrar deve reduzir e aguardar uma brecha segura.",
    link: links.ctb,
  },
  {
    assunto: "Faixa de pedestres",
    pergunta:
      "diante de pedestre atravessando na faixa, sem semaforo para pedestres, qual conduta e correta?",
    correta:
      "Reduzir e parar para permitir a travessia com seguranca.",
    erradas: [
      "Acelerar para passar antes do pedestre.",
      "Buzinar para que o pedestre atravesse mais depressa.",
      "Desviar pela contramao se nao houver veiculos vindo.",
    ],
    explicacao:
      "O pedestre tem prioridade na faixa quando a travessia esta em andamento ou demonstrada. A conduta defensiva e parar com seguranca.",
    link: links.ctb,
  },
  {
    assunto: "Placas de regulamentacao",
    pergunta:
      "qual e a finalidade principal das placas de regulamentacao?",
    correta:
      "Informar obrigacoes, proibicoes, restricoes ou condicoes de uso da via.",
    erradas: [
      "Apenas indicar pontos turisticos e servicos.",
      "Alertar sobre perigos sem impor obrigacao.",
      "Substituir todas as regras do CTB por orientacoes locais.",
    ],
    explicacao:
      "Placas de regulamentacao comunicam regras obrigatorias. Em geral usam fundo branco, orla vermelha e simbolos ou mensagens normativas.",
    link: links.sinalizacao,
  },
  {
    assunto: "Placas de advertencia",
    pergunta:
      "qual e a funcao das placas de advertencia?",
    correta:
      "Alertar o condutor sobre condicoes potencialmente perigosas adiante.",
    erradas: [
      "Aplicar penalidade imediata ao condutor.",
      "Indicar somente destinos e distancias.",
      "Liberar o condutor do dever de reduzir a velocidade.",
    ],
    explicacao:
      "A sinalizacao de advertencia prepara o condutor para riscos como curvas, escolas, animais ou obras, exigindo atencao e velocidade compativel.",
    link: links.sinalizacao,
  },
  {
    assunto: "Sinalizacao horizontal",
    pergunta:
      "o que uma linha continua amarela no eixo da pista geralmente indica?",
    correta:
      "Proibicao de ultrapassar ou transpor a faixa naquele trecho.",
    erradas: [
      "Autorizacao para ultrapassar com cuidado.",
      "Area exclusiva para estacionamento.",
      "Sentido unico obrigatorio para todos os veiculos.",
    ],
    explicacao:
      "Marcas continuas no pavimento indicam restricao de transposicao. A linha amarela separa fluxos opostos e reforca a proibicao de ultrapassagem.",
    link: links.sinalizacao,
  },
  {
    assunto: "Semaforo amarelo",
    pergunta:
      "diante do sinal amarelo, qual deve ser a interpretacao correta?",
    correta:
      "Atencao: parar antes da linha se houver seguranca para isso.",
    erradas: [
      "Acelerar sempre para cruzar antes do vermelho.",
      "Ignorar o sinal se nao houver fiscalizacao.",
      "Parar bruscamente em qualquer circunstancia.",
    ],
    explicacao:
      "O amarelo indica transicao e exige decisao segura. Se for possivel parar sem risco, o condutor deve parar antes da linha de retencao.",
    link: links.sinalizacao,
  },
  {
    assunto: "Estacionamento irregular",
    pergunta:
      "estacionar em local sinalizado como proibido representa que tipo de conduta?",
    correta:
      "Infracao de transito, sujeita a penalidade e medida administrativa quando prevista.",
    erradas: [
      "Conduta permitida se o pisca-alerta estiver ligado.",
      "Conduta permitida quando o motorista fica dentro do veiculo.",
      "Apenas falta de cortesia, sem consequencia legal.",
    ],
    explicacao:
      "A sinalizacao de proibicao de estacionamento deve ser obedecida. Pisca-alerta ou permanencia no veiculo nao tornam regular a parada indevida.",
    link: links.ctb,
  },
  {
    assunto: "Uso do celular",
    pergunta:
      "por que manusear o telefone celular ao volante e uma conduta perigosa e proibida?",
    correta:
      "Porque divide a atencao, reduz o tempo de reacao e aumenta o risco de sinistros.",
    erradas: [
      "Porque o problema ocorre apenas em rodovias.",
      "Porque so e proibido quando o veiculo esta acima de 60 km/h.",
      "Porque e permitido se o condutor usar apenas uma das maos.",
    ],
    explicacao:
      "O celular gera distracao visual, manual e cognitiva. Mesmo poucos segundos sem atencao podem ser suficientes para uma colisao.",
    link: links.ctb,
  },
  {
    assunto: "Motocicletas e capacete",
    pergunta:
      "qual regra basica se aplica ao condutor e passageiro de motocicleta?",
    correta:
      "Ambos devem usar capacete de seguranca adequado e afivelado.",
    erradas: [
      "Apenas o condutor precisa usar capacete em vias urbanas.",
      "O passageiro pode dispensar o capacete em trajetos curtos.",
      "Capacete e opcional quando a motocicleta circula devagar.",
    ],
    explicacao:
      "O capacete e item essencial de protecao para condutor e passageiro. Ele deve estar corretamente ajustado e afivelado.",
    link: links.ctb,
  },
  {
    assunto: "Transporte de criancas",
    pergunta:
      "qual e a orientacao correta para transportar criancas em automovel?",
    correta:
      "Usar dispositivo de retencao adequado a idade, peso e altura, no banco traseiro quando exigido.",
    erradas: [
      "Levar a crianca no colo de um adulto para aumentar a protecao.",
      "Permitir que a crianca use apenas o cinto adulto em qualquer idade.",
      "Dispensar o dispositivo em deslocamentos dentro do bairro.",
    ],
    explicacao:
      "Dispositivos como bebe-conforto, cadeirinha ou assento de elevacao reduzem lesoes e devem respeitar as regras aplicaveis.",
    link: links.ctb,
  },
  {
    assunto: "Veiculos de emergencia",
    pergunta:
      "ao ouvir sirene e ver luz intermitente de ambulancia em servico de urgencia, o condutor deve",
    correta:
      "Facilitar a passagem com seguranca, deslocando-se quando possivel e sem bloquear o caminho.",
    erradas: [
      "Acompanhar a ambulancia para aproveitar a passagem livre.",
      "Parar no meio da faixa em qualquer situacao.",
      "Ignorar se estiver dentro do limite de velocidade.",
    ],
    explicacao:
      "Veiculos de emergencia em servico tem prioridade. Os demais condutores devem abrir passagem de forma segura e previsivel.",
    link: links.ctb,
  },
  {
    assunto: "Ultrapassagem",
    pergunta:
      "em regra, por qual lado a ultrapassagem deve ser realizada?",
    correta:
      "Pela esquerda, salvo excecoes previstas e com seguranca.",
    erradas: [
      "Sempre pela direita, por ser o lado mais proximo do acostamento.",
      "Pelo lado com menor movimento, mesmo em faixa continua.",
      "Pelo acostamento, quando a pista estiver congestionada.",
    ],
    explicacao:
      "A ultrapassagem pela esquerda e a regra geral. Ela depende de sinalizacao, visibilidade e espaco suficientes para retornar com seguranca.",
    link: links.ctb,
  },
  {
    assunto: "Bicicletas na via",
    pergunta:
      "ao ultrapassar ciclista, qual cuidado e indispensavel?",
    correta:
      "Reduzir a velocidade e manter distancia lateral segura.",
    erradas: [
      "Buzinar continuamente para obrigar o ciclista a sair da pista.",
      "Passar o mais perto possivel para reduzir o tempo da manobra.",
      "Usar o acostamento para empurrar o ciclista para a direita.",
    ],
    explicacao:
      "Ciclistas sao usuarios vulneraveis. A ultrapassagem deve preservar distancia lateral e ser feita com velocidade compativel.",
    link: links.ctb,
  },
  {
    assunto: "Permissao para Dirigir",
    pergunta:
      "durante o periodo da Permissao para Dirigir, qual cuidado e essencial para obter a CNH definitiva?",
    correta:
      "Evitar infracoes graves, gravissimas ou reincidencia em infracao media.",
    erradas: [
      "Dirigir apenas em vias urbanas durante todo o primeiro ano.",
      "Fazer novo exame teorico a cada seis meses.",
      "Evitar somente infracoes com multa acima de valor especifico.",
    ],
    explicacao:
      "A obtencao da CNH definitiva depende do comportamento do permissionario durante o periodo da permissao, especialmente quanto a infracoes relevantes.",
    link: links.resolucao168,
  },
  {
    assunto: "Acostamento",
    pergunta:
      "qual e o uso correto do acostamento em rodovias?",
    correta:
      "Usa-lo apenas em situacoes permitidas, como emergencia, parada obrigatoria ou orientacao da autoridade.",
    erradas: [
      "Usa-lo como faixa adicional quando houver lentidao.",
      "Ultrapassar pela direita sempre que a pista estiver livre.",
      "Parar para conversar ou usar o celular sem necessidade.",
    ],
    explicacao:
      "O acostamento nao e faixa de circulacao comum. Seu uso indevido aumenta o risco para veiculos parados, pedestres e servicos de emergencia.",
    link: links.ctb,
  },
  {
    assunto: "Preferencia em via arterial",
    pergunta:
      "ao sair de uma via secundaria e entrar em via de maior fluxo, a conduta segura e",
    correta:
      "Aguardar uma brecha segura e respeitar a preferencia dos veiculos que ja circulam na via.",
    erradas: [
      "Entrar rapidamente para obrigar os demais a reduzir.",
      "Usar a buzina para conquistar preferencia.",
      "Avancar devagar bloqueando parte da faixa ate alguem parar.",
    ],
    explicacao:
      "Entradas em vias de maior fluxo exigem cautela. Preferencia nao substitui observacao, sinalizacao e espaco seguro.",
    link: links.ctb,
  },
];

const defensiveTopics = [
  {
    assunto: "Distancia de seguimento",
    pergunta:
      "qual medida reduz o risco de colisao traseira em fluxo normal?",
    correta:
      "Manter distancia suficiente para reagir e frear sem atingir o veiculo da frente.",
    erradas: [
      "Seguir bem proximo para impedir que outros entrem na faixa.",
      "Olhar apenas para o para-choque do veiculo da frente.",
      "Usar farol alto para pedir passagem constantemente.",
    ],
    explicacao:
      "Distancia de seguimento cria tempo de percepcao, reacao e frenagem. Ela deve aumentar com chuva, velocidade e carga.",
    link: links.prf,
  },
  {
    assunto: "Chuva",
    pergunta: "qual conduta e mais segura ao dirigir sob chuva forte?",
    correta:
      "Reduzir a velocidade, aumentar a distancia e manter limpadores e luzes em uso adequado.",
    erradas: [
      "Manter a velocidade para sair logo da chuva.",
      "Frear bruscamente em todas as pocas d'agua.",
      "Ligar o pisca-alerta enquanto o veiculo segue em movimento normal.",
    ],
    explicacao:
      "A chuva reduz aderencia e visibilidade. Dirigir de forma progressiva e previsivel evita derrapagens e colisoes.",
    link: links.prf,
  },
  {
    assunto: "Aquaplanagem",
    pergunta:
      "ao sentir o veiculo aquaplanar, qual reacao tende a ser mais adequada?",
    correta:
      "Segurar firme o volante, evitar freadas bruscas e aliviar o acelerador gradualmente.",
    erradas: [
      "Pisar forte no freio ate recuperar contato com o solo.",
      "Virar rapidamente o volante para o acostamento.",
      "Acelerar para atravessar a lamina de agua mais rapido.",
    ],
    explicacao:
      "Na aquaplanagem, os pneus perdem contato com o pavimento. Movimentos bruscos podem causar perda de controle quando a aderencia voltar.",
    link: links.prf,
  },
  {
    assunto: "Neblina",
    pergunta: "em neblina densa, qual procedimento e recomendado?",
    correta:
      "Reduzir a velocidade, aumentar a distancia e usar luz baixa ou farol de neblina se houver.",
    erradas: [
      "Usar farol alto para enxergar mais longe.",
      "Aproximar-se do veiculo da frente para seguir suas lanternas.",
      "Parar sobre a pista sem sinalizacao.",
    ],
    explicacao:
      "Farol alto reflete na neblina e piora a visibilidade. A direcao defensiva prioriza velocidade baixa, luz adequada e distancia.",
    link: links.prf,
  },
  {
    assunto: "Direcao noturna",
    pergunta: "qual cuidado deve ser reforcado na conducao noturna?",
    correta:
      "Reduzir a velocidade compativel com a visibilidade e evitar ofuscar outros condutores.",
    erradas: [
      "Usar farol alto o tempo todo, inclusive ao cruzar outros veiculos.",
      "Dirigir pelo centro da pista para enxergar as duas margens.",
      "Olhar diretamente para o farol do veiculo em sentido contrario.",
    ],
    explicacao:
      "A noite reduz percepcao de distancia, pedestres e obstaculos. O uso correto dos farois e a velocidade compativel sao essenciais.",
    link: links.prf,
  },
  {
    assunto: "Fadiga",
    pergunta:
      "se o condutor percebe sonolencia durante uma viagem, qual atitude e correta?",
    correta:
      "Parar em local seguro para descansar antes de continuar.",
    erradas: [
      "Abrir a janela e continuar dirigindo ate o destino.",
      "Aumentar o volume do som para permanecer acordado.",
      "Acelerar para reduzir o tempo de viagem.",
    ],
    explicacao:
      "Sono reduz reflexos e pode causar microsleeps. A unica medida realmente segura e interromper a conducao e descansar.",
    link: links.prf,
  },
  {
    assunto: "Pontos cegos",
    pergunta:
      "antes de mudar de faixa, por que e importante conferir os pontos cegos?",
    correta:
      "Porque ha areas que os espelhos podem nao mostrar, especialmente ao lado e atras do veiculo.",
    erradas: [
      "Porque os pontos cegos so existem em caminhoes.",
      "Porque olhar os espelhos dispensa sinalizacao.",
      "Porque a seta elimina a necessidade de observar a faixa.",
    ],
    explicacao:
      "Espelhos ajudam, mas nao cobrem tudo. Conferir pontos cegos evita fechar motocicletas, bicicletas e outros veiculos.",
    link: links.prf,
  },
  {
    assunto: "Frenagem de emergencia",
    pergunta:
      "em uma frenagem de emergencia, qual conduta ajuda a manter controle?",
    correta:
      "Frear de forma firme e direcionar o veiculo para uma area segura quando possivel.",
    erradas: [
      "Puxar o freio de estacionamento em alta velocidade.",
      "Fechar os olhos para evitar desvio de atencao.",
      "Virar bruscamente o volante antes de reduzir.",
    ],
    explicacao:
      "A frenagem deve ser firme e controlada. Veiculos com ABS permitem manter direcao enquanto se freia fortemente.",
    link: links.prf,
  },
  {
    assunto: "Curvas",
    pergunta: "qual e a forma defensiva de entrar em uma curva?",
    correta:
      "Reduzir antes da curva e manter trajetoria estavel durante a manobra.",
    erradas: [
      "Frear forte no meio da curva para ganhar aderencia.",
      "Acelerar antes de enxergar a saida da curva.",
      "Invadir a faixa contraria para abrir a trajetoria.",
    ],
    explicacao:
      "Reduzir antes da curva evita transferencia brusca de peso e perda de aderencia. A trajetoria deve permanecer dentro da faixa.",
    link: links.prf,
  },
  {
    assunto: "Ultrapassagem segura",
    pergunta: "antes de ultrapassar, o condutor deve confirmar principalmente",
    correta:
      "se ha sinalizacao permitindo, visibilidade, espaco livre e tempo suficiente para retornar.",
    erradas: [
      "se o veiculo da frente esta abaixo da velocidade desejada.",
      "se ha acostamento largo para usar como apoio.",
      "se outro condutor piscou o farol autorizando a manobra.",
    ],
    explicacao:
      "Ultrapassar exige avaliacao completa do ambiente. Visibilidade insuficiente, sinalizacao proibitiva ou pouco espaco tornam a manobra perigosa.",
    link: links.prf,
  },
  {
    assunto: "Rodovias",
    pergunta:
      "em rodovias, por que entradas e saidas exigem atencao redobrada?",
    correta:
      "Porque diferencas de velocidade e mudancas de faixa aumentam o risco de conflito.",
    erradas: [
      "Porque a preferencia e sempre de quem esta entrando.",
      "Porque o acostamento deve ser usado como faixa de aceleracao em qualquer caso.",
      "Porque os demais condutores devem parar para facilitar a entrada.",
    ],
    explicacao:
      "A direcao defensiva antecipa fluxos de entrada e saida, ajustando velocidade e faixa com previsibilidade.",
    link: links.prf,
  },
  {
    assunto: "Motociclistas",
    pergunta:
      "ao dividir a via com motociclistas, qual atitude demonstra direcao defensiva?",
    correta:
      "Manter distancia, sinalizar manobras e conferir pontos cegos antes de mudar de faixa.",
    erradas: [
      "Fechar o corredor para impedir passagem.",
      "Aproximar-se da motocicleta para ela acelerar.",
      "Ignorar motocicletas por ocuparem pouco espaco.",
    ],
    explicacao:
      "Motociclistas sao mais vulneraveis e podem ficar escondidos nos pontos cegos. Previsibilidade e distancia salvam vidas.",
    link: links.prf,
  },
  {
    assunto: "Pedestres e ciclistas",
    pergunta:
      "perto de escolas, parques ou areas residenciais, qual ajuste e recomendado?",
    correta:
      "Reduzir a velocidade e antecipar a presenca de pedestres e ciclistas.",
    erradas: [
      "Manter velocidade alta para evitar retenções.",
      "Usar buzina como substituta da reducao de velocidade.",
      "Circular pelo acostamento para fugir do fluxo.",
    ],
    explicacao:
      "Locais com usuarios vulneraveis exigem velocidade menor, atencao lateral e prontidao para parar.",
    link: links.prf,
  },
  {
    assunto: "Manutencao preventiva",
    pergunta:
      "por que a manutencao preventiva faz parte da direcao defensiva?",
    correta:
      "Porque reduz falhas mecanicas que podem causar perda de controle ou colisao.",
    erradas: [
      "Porque permite dirigir acima do limite com mais seguranca.",
      "Porque substitui a necessidade de revisao documental.",
      "Porque elimina todos os riscos externos da via.",
    ],
    explicacao:
      "Freios, pneus, luzes e direcao em bom estado ampliam a margem de seguranca e reduzem surpresas no transito.",
    link: links.prf,
  },
  {
    assunto: "Pneus e aderencia",
    pergunta:
      "pneus desgastados ou mal calibrados afetam principalmente",
    correta:
      "aderencia, estabilidade, frenagem e risco de aquaplanagem.",
    erradas: [
      "apenas o conforto acustico dentro do veiculo.",
      "somente o consumo de combustivel, sem impacto na seguranca.",
      "apenas a correcao do velocimetro.",
    ],
    explicacao:
      "Pneus sao o contato do veiculo com o solo. Desgaste e calibragem incorreta comprometem frenagem e controle.",
    link: links.prf,
  },
  {
    assunto: "Postura ao volante",
    pergunta:
      "qual postura favorece controle e reacao rapida?",
    correta:
      "Banco ajustado, maos firmes no volante e alcance confortavel dos pedais.",
    erradas: [
      "Banco muito reclinado para reduzir cansaco.",
      "Uma mao no volante e outra apoiada fora do veiculo.",
      "Pe distante dos pedais para evitar movimentos involuntarios.",
    ],
    explicacao:
      "Postura correta ajuda a esterçar, frear e observar o ambiente sem atraso ou desconforto excessivo.",
    link: links.prf,
  },
  {
    assunto: "Distracoes",
    pergunta:
      "qual exemplo caracteriza distracao perigosa ao volante?",
    correta:
      "Ler mensagens ou ajustar aplicativos enquanto o veiculo esta em movimento.",
    erradas: [
      "Observar os espelhos periodicamente.",
      "Sinalizar antes de mudar de faixa.",
      "Manter as duas maos no volante em trecho urbano.",
    ],
    explicacao:
      "Distracoes visuais, manuais e mentais reduzem a capacidade de perceber riscos e reagir a tempo.",
    link: links.prf,
  },
  {
    assunto: "Cruzamentos",
    pergunta:
      "ao se aproximar de cruzamento mesmo com preferencia, a atitude defensiva e",
    correta:
      "reduzir, observar os demais fluxos e estar preparado para parar.",
    erradas: [
      "acelerar para afirmar a preferencia.",
      "olhar apenas para o semaforo.",
      "buzinar e atravessar sem reduzir.",
    ],
    explicacao:
      "Preferencia nao elimina riscos. Outros usuarios podem errar, e a reducao aumenta o tempo de reacao.",
    link: links.prf,
  },
  {
    assunto: "Animais na pista",
    pergunta:
      "ao avistar animal na pista, qual conduta e mais segura?",
    correta:
      "Reduzir com cuidado, sinalizar se necessario e evitar desvios bruscos.",
    erradas: [
      "Desviar rapidamente para a contramao.",
      "Acelerar para passar antes que o animal se mova.",
      "Buzinar sem reduzir a velocidade.",
    ],
    explicacao:
      "Desvios bruscos podem causar capotamento ou colisao frontal. Reducao controlada e observacao sao mais seguras.",
    link: links.prf,
  },
  {
    assunto: "Carga no veiculo",
    pergunta:
      "como a carga mal distribuida pode afetar a conducao?",
    correta:
      "Pode alterar estabilidade, frenagem e controle do veiculo.",
    erradas: [
      "Aumenta sempre a aderencia em curvas.",
      "Nao interfere em veiculos leves.",
      "Compensa pneus em mau estado.",
    ],
    explicacao:
      "Peso e distribuicao influenciam centro de gravidade e distancia de frenagem. A carga deve estar presa e equilibrada.",
    link: links.prf,
  },
  {
    assunto: "Agressividade no transito",
    pergunta:
      "diante de um condutor agressivo, a resposta defensiva recomendada e",
    correta:
      "evitar disputa, manter distancia e priorizar a seguranca.",
    erradas: [
      "revidar para mostrar que tambem tem preferencia.",
      "fechar passagem para impedir comportamento errado.",
      "seguir o veiculo para anotar detalhes durante a conducao.",
    ],
    explicacao:
      "Conflitos aumentam risco. A direcao defensiva reduz exposicao e evita transformar erro alheio em sinistro.",
    link: links.prf,
  },
  {
    assunto: "Condicoes da via",
    pergunta:
      "em via com buracos, obras ou pavimento irregular, o condutor deve",
    correta:
      "reduzir a velocidade, manter atencao e evitar manobras repentinas.",
    erradas: [
      "aumentar a velocidade para passar mais rapido pelos obstaculos.",
      "transitar pela contramao sempre que encontrar buracos.",
      "frear somente depois de entrar no buraco.",
    ],
    explicacao:
      "Irregularidades reduzem controle e podem danificar pneus e suspensao. A reducao antecipada diminui riscos.",
    link: links.prf,
  },
  {
    assunto: "Tempo de reacao",
    pergunta:
      "o tempo de reacao do condutor aumenta quando ha",
    correta:
      "sono, alcool, distracao, estresse ou uso de medicamentos que causam sonolencia.",
    erradas: [
      "boa visibilidade e velocidade compativel.",
      "distancia segura e revisao do veiculo.",
      "planejamento do trajeto e pausa para descanso.",
    ],
    explicacao:
      "Fatores fisicos e cognitivos retardam a resposta ao perigo. Quanto maior o atraso, maior a distancia percorrida antes da frenagem.",
    link: links.prf,
  },
  {
    assunto: "Visibilidade",
    pergunta:
      "para ver e ser visto, especialmente em chuva ou fim de tarde, e recomendado",
    correta:
      "manter luzes em boas condicoes e usa-las conforme a situacao exige.",
    erradas: [
      "usar somente luz interna do veiculo.",
      "desligar as luzes para economizar bateria.",
      "usar pisca-alerta em movimento normal para substituir farois.",
    ],
    explicacao:
      "Luzes conservadas ajudam outros usuarios a perceberem o veiculo e permitem ao condutor identificar riscos mais cedo.",
    link: links.prf,
  },
  {
    assunto: "Planejamento de viagem",
    pergunta:
      "uma pratica defensiva antes de pegar estrada e",
    correta:
      "planejar rota, descanso, condicoes do veiculo e previsao do tempo.",
    erradas: [
      "sair sem pausas para chegar mais cedo.",
      "deixar a calibragem para depois da viagem.",
      "conferir apenas o combustivel.",
    ],
    explicacao:
      "Planejamento reduz pressa, improviso e exposicao a riscos previsiveis, como fadiga, chuva e pane.",
    link: links.prf,
  },
  {
    assunto: "Convivio com veiculos grandes",
    pergunta:
      "ao trafegar perto de onibus ou caminhoes, o condutor deve considerar que",
    correta:
      "esses veiculos tem pontos cegos maiores e precisam de mais espaco para manobrar e frear.",
    erradas: [
      "eles freiam sempre em menor distancia que carros leves.",
      "seus motoristas enxergam todos os lados sem pontos cegos.",
      "a melhor posicao e permanecer colado na traseira.",
    ],
    explicacao:
      "Veiculos grandes tem massa e dimensoes maiores. Evitar pontos cegos e manter distancia facilita reacoes seguras.",
    link: links.prf,
  },
  {
    assunto: "Emergencia mecanica",
    pergunta:
      "se o veiculo apresenta pane em via movimentada, a primeira preocupacao deve ser",
    correta:
      "proteger pessoas e sinalizar o local, afastando-se do fluxo quando possivel.",
    erradas: [
      "abrir o capo imediatamente no meio da faixa.",
      "empurrar o veiculo sem observar o transito.",
      "ficar atras do veiculo esperando ajuda.",
    ],
    explicacao:
      "Em pane, a prioridade e evitar novo sinistro. Sinalizacao, local seguro e acionamento de ajuda sao medidas fundamentais.",
    link: links.prf,
  },
  {
    assunto: "Velocidade compativel",
    pergunta:
      "mesmo abaixo do limite da via, a velocidade pode ser inadequada quando",
    correta:
      "nao for compativel com chuva, neblina, trafego, curva, pedestres ou estado da pista.",
    erradas: [
      "o velocimetro estiver funcionando corretamente.",
      "o condutor conhecer bem o trajeto.",
      "o veiculo tiver revisao recente.",
    ],
    explicacao:
      "Direcao defensiva exige adaptar a velocidade ao ambiente. O limite maximo nao e uma obrigacao de velocidade.",
    link: links.prf,
  },
];

const firstAidTopics = [
  {
    assunto: "Sinalizacao do local",
    pergunta: "qual deve ser uma das primeiras medidas ao encontrar um sinistro com vitimas?",
    correta:
      "Sinalizar o local e proteger a area para evitar novos sinistros.",
    erradas: [
      "Retirar a vitima imediatamente do veiculo em qualquer situacao.",
      "Dar agua para acalmar a vitima.",
      "Juntar curiosos para ajudar a decidir o que fazer.",
    ],
    explicacao:
      "Antes de prestar ajuda, e preciso reduzir riscos para vitimas, socorristas e demais usuarios. A sinalizacao evita novas colisoes.",
    link: links.samu,
  },
  {
    assunto: "Acionamento do socorro",
    pergunta: "ao acionar o servico de emergencia, que informacao e essencial?",
    correta:
      "Local exato, tipo de ocorrencia, numero aproximado de vitimas e riscos presentes.",
    erradas: [
      "A opiniao sobre quem teve culpa no sinistro.",
      "A marca e o valor dos veiculos envolvidos.",
      "Somente o nome do solicitante.",
    ],
    explicacao:
      "Informacoes objetivas ajudam a central a enviar recurso adequado e orientar as primeiras acoes.",
    link: links.samu,
  },
  {
    assunto: "Nao mover a vitima",
    pergunta: "por que nao se deve mover vitima de transito sem necessidade urgente?",
    correta:
      "Porque pode haver lesao na coluna ou trauma que piore com movimentacao inadequada.",
    erradas: [
      "Porque toda vitima deve ficar sozinha ate a ambulancia chegar.",
      "Porque movimentar a vitima sempre cancela o atendimento medico.",
      "Porque o socorro so atende vitimas dentro do veiculo.",
    ],
    explicacao:
      "Movimentacao sem tecnica pode agravar lesoes. A retirada so deve ocorrer em risco imediato, como incendio ou afogamento.",
    link: links.samu,
  },
  {
    assunto: "Hemorragia",
    pergunta: "em sangramento externo intenso, qual medida inicial costuma ser indicada?",
    correta:
      "Fazer compressao direta com pano limpo ou gaze, se houver seguranca para isso.",
    erradas: [
      "Lavar com alcool e deixar sangrar.",
      "Aplicar po de cafe ou terra para estancar.",
      "Dar comida para a vitima recuperar energia.",
    ],
    explicacao:
      "Compressao direta ajuda a controlar perda de sangue ate a chegada do socorro. Materiais contaminados nao devem ser usados.",
    link: links.samu,
  },
  {
    assunto: "Fraturas",
    pergunta: "em suspeita de fratura, a conduta adequada e",
    correta:
      "evitar movimentar o membro e aguardar atendimento, imobilizando apenas se souber fazer com seguranca.",
    erradas: [
      "Tentar recolocar o osso no lugar.",
      "Massagear vigorosamente a area dolorida.",
      "Pedir para a vitima caminhar para testar a lesao.",
    ],
    explicacao:
      "Fraturas podem piorar com manipulacao inadequada. A prioridade e conforto, imobilidade relativa e socorro especializado.",
    link: links.samu,
  },
  {
    assunto: "Queimaduras",
    pergunta: "em queimadura termica leve, qual cuidado inicial e adequado?",
    correta:
      "Resfriar a area com agua corrente limpa e nao aplicar produtos caseiros.",
    erradas: [
      "Passar manteiga, pasta de dente ou oleo.",
      "Estourar bolhas para aliviar a dor.",
      "Cobrir com algodao grudado na pele.",
    ],
    explicacao:
      "Agua corrente ajuda a reduzir calor residual. Produtos caseiros e rompimento de bolhas aumentam risco de infeccao.",
    link: links.samu,
  },
  {
    assunto: "Parada cardiorrespiratoria",
    pergunta:
      "se uma vitima esta inconsciente e nao respira normalmente, qual acao deve ser priorizada?",
    correta:
      "Acionar emergencia e iniciar manobras de ressuscitacao se tiver treinamento ou orientacao.",
    erradas: [
      "Dar agua imediatamente.",
      "Colocar a vitima sentada e esperar acordar.",
      "Sacudir a vitima repetidamente pelo pescoço.",
    ],
    explicacao:
      "Ausencia de respiracao normal e emergencia critica. Acionamento rapido e RCP aumentam a chance de sobrevivencia.",
    link: links.samu,
  },
  {
    assunto: "Vitima inconsciente respirando",
    pergunta:
      "se a vitima esta inconsciente, mas respira, e nao ha suspeita que impeça movimentacao, uma medida possivel e",
    correta:
      "mantê-la em posicao lateral de seguranca e monitorar ate o socorro chegar.",
    erradas: [
      "Dar liquidos para evitar desidratacao.",
      "Sentar a vitima bruscamente.",
      "Tampar o nariz para estimular a respiracao.",
    ],
    explicacao:
      "A posicao lateral ajuda a manter vias aereas livres e reduzir risco de aspiracao, quando a movimentacao e segura.",
    link: links.samu,
  },
  {
    assunto: "Capacete em motociclista",
    pergunta:
      "em regra, o que fazer com o capacete de motociclista acidentado?",
    correta:
      "Nao retirar, salvo risco imediato ou necessidade vital com tecnica adequada.",
    erradas: [
      "Retirar sempre para a vitima respirar melhor.",
      "Girar o capacete para verificar ferimentos.",
      "Puxar rapidamente pelo queixo.",
    ],
    explicacao:
      "Retirada inadequada pode agravar lesao cervical. Profissionais treinados devem avaliar a necessidade.",
    link: links.samu,
  },
  {
    assunto: "Estado de choque",
    pergunta:
      "vitima palida, fria e confusa apos sinistro pode estar em choque. O correto e",
    correta:
      "acionar socorro, manter a vitima aquecida e monitorar respiracao, sem oferecer alimentos ou bebidas.",
    erradas: [
      "Dar bebida alcoolica para aquecer.",
      "Mandar caminhar para melhorar a circulacao.",
      "Aplicar medicamentos por conta propria.",
    ],
    explicacao:
      "Choque e emergencia. Manter calor, tranquilizar e aguardar socorro sao medidas seguras para leigos.",
    link: links.samu,
  },
  {
    assunto: "Engasgo",
    pergunta: "em obstrucao grave das vias aereas, o mais importante e",
    correta:
      "acionar ajuda e aplicar manobras apropriadas se souber executa-las com seguranca.",
    erradas: [
      "Dar agua a qualquer custo.",
      "Colocar os dedos na boca sem ver o objeto.",
      "Mandar a pessoa deitar de costas imediatamente.",
    ],
    explicacao:
      "Manobras incorretas podem piorar a obstrucao. Em emergencia, seguir orientacao do servico de socorro e treinamento recebido.",
    link: links.samu,
  },
  {
    assunto: "Incendio no veiculo",
    pergunta:
      "se ha principio de incendio apos colisao, a prioridade deve ser",
    correta:
      "afastar pessoas do risco e acionar emergencia, usando extintor apenas se for seguro e souber operar.",
    erradas: [
      "Abrir completamente o capo sem avaliar chamas.",
      "Jogar agua em qualquer foco eletrico.",
      "Permanecer perto para filmar a ocorrencia.",
    ],
    explicacao:
      "Fogo e fumaca oferecem risco rapido. Segurança pessoal e acionamento do socorro vêm antes de qualquer tentativa de combate.",
    link: links.samu,
  },
  {
    assunto: "Prioridade de atendimento",
    pergunta:
      "em local com varias vitimas, a ajuda leiga deve priorizar",
    correta:
      "seguranca da cena, acionamento do socorro e orientacoes da central de emergencia.",
    erradas: [
      "atender primeiro quem grita mais alto, sempre.",
      "mover todas as vitimas para o acostamento.",
      "decidir sozinho procedimentos medicos complexos.",
    ],
    explicacao:
      "Triagem e procedimento medico cabem a profissionais. O leigo contribui muito protegendo a cena e informando corretamente.",
    link: links.samu,
  },
  {
    assunto: "Seguranca do socorrista",
    pergunta:
      "por que o socorrista leigo deve avaliar riscos antes de se aproximar?",
    correta:
      "Porque ele tambem pode se tornar vitima se houver trafego, fogo, fios ou vazamento.",
    erradas: [
      "Porque a lei proibe qualquer ajuda.",
      "Porque so bombeiros podem telefonar para emergencia.",
      "Porque curiosos sempre devem assumir a cena.",
    ],
    explicacao:
      "Uma cena insegura pode gerar novas vitimas. Aproximacao segura, sinalizacao e chamada de emergencia sao essenciais.",
    link: links.samu,
  },
  {
    assunto: "Medicamentos",
    pergunta:
      "oferecer medicamentos a vitima desconhecida apos sinistro e inadequado porque",
    correta:
      "pode causar alergias, interacoes ou mascarar sintomas importantes.",
    erradas: [
      "todo medicamento perde efeito em via publica.",
      "somente comprimidos coloridos oferecem risco.",
      "a vitima sempre sabe a dose correta em situacao de trauma.",
    ],
    explicacao:
      "Medicacao sem avaliacao profissional pode piorar o quadro. O correto e aguardar orientacao do servico de emergencia.",
    link: links.samu,
  },
  {
    assunto: "Acalmar a vitima",
    pergunta:
      "ao conversar com uma vitima consciente, a postura recomendada e",
    correta:
      "falar com calma, explicar que o socorro foi chamado e evitar promessas impossiveis.",
    erradas: [
      "culpar a vitima para que ela fique alerta.",
      "dizer que nao houve nada grave sem avaliar.",
      "estimular a vitima a levantar rapidamente.",
    ],
    explicacao:
      "Comunicação calma reduz ansiedade e facilita cooperacao, sem substituir avaliacao profissional.",
    link: links.samu,
  },
];

const environmentTopics = [
  {
    assunto: "Poluicao atmosferica",
    pergunta: "qual atitude ajuda a reduzir emissões de poluentes no transito?",
    correta:
      "Manter o veiculo regulado e evitar aceleracoes desnecessarias.",
    erradas: [
      "Retirar filtros do veiculo para aumentar potencia.",
      "Manter pneus murchos para aumentar aderencia.",
      "Acelerar parado para aquecer o motor por longos periodos.",
    ],
    explicacao:
      "Motor regulado, pneus calibrados e conducao suave reduzem consumo e emissões, alem de preservar o veiculo.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Poluicao sonora",
    pergunta: "o uso inadequado da buzina e do som automotivo pode causar",
    correta:
      "poluicao sonora, estresse e risco por distrair usuarios da via.",
    erradas: [
      "melhora comprovada da fluidez em todos os cruzamentos.",
      "prioridade legal para quem esta com pressa.",
      "eliminacao de riscos para pedestres.",
    ],
    explicacao:
      "Ruido excessivo prejudica convivencia e pode distrair. Buzina deve ser usada de forma breve e quando necessaria.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Descarte de oleo",
    pergunta: "qual destino deve ser dado a oleo lubrificante usado?",
    correta:
      "Encaminhar a ponto de coleta, oficina ou servico autorizado para descarte adequado.",
    erradas: [
      "Jogar em bueiros para diluir com a agua da chuva.",
      "Descartar no solo em pequena quantidade.",
      "Misturar ao lixo comum sem embalagem.",
    ],
    explicacao:
      "Oleo lubrificante contamina agua e solo. Oficinas e pontos adequados reduzem danos ambientais.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Convivio social",
    pergunta: "qual conduta expressa cidadania no transito?",
    correta:
      "Respeitar regras, dar passagem quando devido e agir com paciencia e previsibilidade.",
    erradas: [
      "Disputar espaco para nao perder tempo.",
      "Usar o veiculo para intimidar pedestres.",
      "Ignorar sinalizacao quando nao houver fiscalizacao.",
    ],
    explicacao:
      "Transito seguro depende de cooperacao. Cidadania inclui respeito a usuarios vulneraveis e cumprimento das normas.",
    link: links.prf,
  },
  {
    assunto: "Pedestres vulneraveis",
    pergunta:
      "ao perceber idoso ou pessoa com mobilidade reduzida atravessando, o condutor deve",
    correta:
      "aguardar com paciencia e garantir tempo seguro para a travessia.",
    erradas: [
      "buzinar para acelerar a travessia.",
      "avancar lentamente para pressionar a pessoa.",
      "desviar pela faixa contraria sem observar riscos.",
    ],
    explicacao:
      "Usuarios vulneraveis precisam de mais tempo e protecao. A pressa do condutor nao justifica risco.",
    link: links.prf,
  },
  {
    assunto: "Compartilhamento da via",
    pergunta: "compartilhar a via com bicicletas exige",
    correta:
      "distancia, reducao de velocidade e respeito ao espaco do ciclista.",
    erradas: [
      "fechar a passagem para evitar que a bicicleta avance.",
      "usar buzina longa como regra.",
      "ultrapassar sem mudar a trajetoria.",
    ],
    explicacao:
      "Ciclistas tem direito de circulacao conforme a via e sao vulneraveis. Respeitar espaco lateral evita quedas e colisões.",
    link: links.prf,
  },
  {
    assunto: "Lixo na via",
    pergunta: "jogar lixo pela janela do veiculo e uma conduta incorreta porque",
    correta:
      "suja a cidade, pode entupir drenagem e oferece risco a outros usuarios.",
    erradas: [
      "e permitido se o material for pequeno.",
      "ajuda garis a identificar vias movimentadas.",
      "nao tem impacto se o veiculo estiver em baixa velocidade.",
    ],
    explicacao:
      "Residuos na via afetam meio ambiente, drenagem e seguranca. O correto e guardar e descartar em local apropriado.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Consumo de combustivel",
    pergunta: "qual pratica tende a economizar combustivel e reduzir emissões?",
    correta:
      "Aceleracao suave, antecipacao do trafego e manutencao preventiva.",
    erradas: [
      "Aceleracoes bruscas seguidas de freadas fortes.",
      "Rodar com pneus sempre abaixo da calibragem.",
      "Carregar peso desnecessario permanentemente.",
    ],
    explicacao:
      "Conducao suave e veiculo em bom estado consomem menos combustivel e emitem menos poluentes.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Transporte coletivo",
    pergunta: "usar transporte coletivo, bicicleta ou carona planejada pode contribuir para",
    correta:
      "reduzir congestionamentos, emissões e demanda por espaco viario.",
    erradas: [
      "aumentar obrigatoriamente o numero de veiculos nas ruas.",
      "eliminar a necessidade de regras de transito.",
      "impedir qualquer deslocamento individual.",
    ],
    explicacao:
      "Escolhas de mobilidade influenciam poluicao, tempo de deslocamento e qualidade de vida urbana.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Manutencao ambiental",
    pergunta: "fumaça excessiva saindo do escapamento indica",
    correta:
      "possivel falha mecanica que aumenta poluicao e deve ser verificada.",
    erradas: [
      "motor mais potente e eficiente.",
      "sinal normal em qualquer veiculo novo.",
      "dispensa manutencao se o consumo estiver normal.",
    ],
    explicacao:
      "Fumaça anormal pode indicar queima inadequada de combustivel ou oleo. A revisao protege meio ambiente e seguranca.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Respeito aos agentes",
    pergunta: "o relacionamento adequado com agentes e operadores de transito deve ser",
    correta:
      "respeitoso, seguindo orientacoes legais e mantendo a calma.",
    erradas: [
      "agressivo quando houver discordancia.",
      "baseado em ignorar ordens para evitar atraso.",
      "feito por discussoes no meio da pista.",
    ],
    explicacao:
      "Agentes organizam fluxo e seguranca. Discordancias devem ser tratadas por meios adequados, sem risco na via.",
    link: links.prf,
  },
  {
    assunto: "Faixa exclusiva",
    pergunta: "respeitar faixa exclusiva de onibus ajuda principalmente a",
    correta:
      "melhorar a eficiencia do transporte coletivo e a organizacao do fluxo.",
    erradas: [
      "garantir atalho livre para carros particulares.",
      "permitir estacionamento rapido em qualquer horario.",
      "reduzir a prioridade de passageiros do transporte publico.",
    ],
    explicacao:
      "Faixas exclusivas favorecem transporte coletivo e previsibilidade. O uso irregular prejudica muitas pessoas.",
    link: links.prf,
  },
  {
    assunto: "Animais e meio ambiente",
    pergunta: "ao ver animal silvestre proximo a rodovia, a conduta correta e",
    correta:
      "reduzir com seguranca, nao buzinar excessivamente e avisar autoridades se houver risco.",
    erradas: [
      "perseguir o animal para afasta-lo.",
      "jogar objetos para que ele saia da pista.",
      "parar em local perigoso para fotografar.",
    ],
    explicacao:
      "Animais podem reagir de forma imprevisivel. A seguranca da via e a protecao ambiental exigem conduta cautelosa.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Educacao no transito",
    pergunta: "educacao para o transito busca principalmente",
    correta:
      "formar atitudes seguras, solidarias e responsaveis entre todos os usuarios.",
    erradas: [
      "ensinar apenas mecanica avancada.",
      "substituir fiscalizacao e sinalizacao.",
      "beneficiar somente condutores profissionais.",
    ],
    explicacao:
      "Educacao no transito envolve valores, comportamento seguro e respeito compartilhado no espaco publico.",
    link: links.prf,
  },
  {
    assunto: "Baterias e pneus usados",
    pergunta: "baterias e pneus inserviveis devem ser",
    correta:
      "entregues a pontos de coleta ou estabelecimentos que façam destinacao adequada.",
    erradas: [
      "abandonados em terrenos vazios.",
      "queimados para reduzir volume.",
      "jogados em cursos d'agua.",
    ],
    explicacao:
      "Esses residuos podem contaminar o ambiente e acumular agua. A destinacao correta reduz impactos e riscos de saude publica.",
    link: links.meioAmbiente,
  },
  {
    assunto: "Empatia no transito",
    pergunta: "agir com empatia no transito significa",
    correta:
      "considerar erros e limitações dos outros, evitando atitudes que aumentem riscos.",
    erradas: [
      "abrir mao de todas as regras para ser gentil.",
      "dirigir sempre mais devagar que o minimo necessario.",
      "usar o veiculo para corrigir outros condutores.",
    ],
    explicacao:
      "Empatia nao elimina regras; ela reforca paciencia, previsibilidade e cuidado com usuarios vulneraveis.",
    link: links.prf,
  },
];

const mechanicsTopics = [
  {
    assunto: "Calibragem dos pneus",
    pergunta: "pneus devem ser calibrados preferencialmente",
    correta:
      "conforme recomendacao do fabricante, com os pneus frios sempre que possivel.",
    erradas: [
      "somente quando parecem vazios visualmente.",
      "sempre no maior valor indicado no calibrador.",
      "apenas antes da vistoria anual.",
    ],
    explicacao:
      "Calibragem correta melhora estabilidade, frenagem, consumo e vida util dos pneus.",
    link: links.senatran,
  },
  {
    assunto: "Oleo do motor",
    pergunta: "qual cuidado basico se aplica ao oleo do motor?",
    correta:
      "Verificar nivel e prazo de troca conforme manual do veiculo.",
    erradas: [
      "Completar com qualquer oleo disponivel, sem especificacao.",
      "Trocar apenas quando o motor falhar.",
      "Usar oleo acima do nivel maximo para proteger mais.",
    ],
    explicacao:
      "Oleo lubrifica e ajuda a refrigerar componentes. Nivel incorreto ou especificacao errada pode causar danos.",
    link: links.senatran,
  },
  {
    assunto: "Freios",
    pergunta: "ruido anormal ou pedal de freio baixo pode indicar",
    correta:
      "necessidade de inspecao imediata do sistema de freios.",
    erradas: [
      "funcionamento normal em todo veiculo usado.",
      "problema apenas no sistema de som.",
      "sinal de pneus calibrados demais.",
    ],
    explicacao:
      "Freios sao item critico. Alteracoes no pedal, ruido ou perda de eficiencia exigem manutencao.",
    link: links.senatran,
  },
  {
    assunto: "Arrefecimento",
    pergunta: "se a luz de temperatura acende no painel, o condutor deve",
    correta:
      "parar em local seguro e verificar orientacoes do manual, evitando abrir o reservatorio quente.",
    erradas: [
      "continuar acelerando para ventilar o motor.",
      "abrir imediatamente a tampa quente do radiador.",
      "jogar agua fria no motor em movimento.",
    ],
    explicacao:
      "Superaquecimento pode causar danos e queimaduras. O sistema pressurizado quente nao deve ser aberto sem cuidado.",
    link: links.senatran,
  },
  {
    assunto: "Bateria",
    pergunta: "dificuldade para dar partida pode estar relacionada a",
    correta:
      "bateria descarregada, terminais oxidados ou problema no sistema eletrico.",
    erradas: [
      "excesso de calibragem nos pneus.",
      "nivel alto do fluido do limpador.",
      "uso correto do cinto de seguranca.",
    ],
    explicacao:
      "Partida depende de bateria e sistema eletrico em boas condicoes. Revisao evita pane inesperada.",
    link: links.senatran,
  },
  {
    assunto: "Sistema de iluminacao",
    pergunta: "por que farois, lanternas e setas devem ser verificados?",
    correta:
      "Porque permitem ver, ser visto e comunicar manobras aos demais usuarios.",
    erradas: [
      "Porque servem apenas para estetica do veiculo.",
      "Porque substituem a obrigacao de reduzir velocidade.",
      "Porque dispensam o uso dos espelhos.",
    ],
    explicacao:
      "Iluminacao e sinalizacao do veiculo sao componentes diretos de seguranca e comunicacao no transito.",
    link: links.senatran,
  },
  {
    assunto: "Limpador de para-brisa",
    pergunta: "palhetas ressecadas do limpador podem causar",
    correta:
      "perda de visibilidade em chuva e aumento do risco de sinistros.",
    erradas: [
      "maior eficiencia dos freios.",
      "redução automatica de velocidade.",
      "aumento da potencia do motor.",
    ],
    explicacao:
      "Boa visibilidade e essencial. Palhetas ruins espalham agua e sujeira no para-brisa.",
    link: links.senatran,
  },
  {
    assunto: "Alinhamento e balanceamento",
    pergunta: "veiculo puxando para um lado pode indicar",
    correta:
      "problema de alinhamento, pneus ou suspensao que precisa de verificacao.",
    erradas: [
      "sinal de combustivel de melhor qualidade.",
      "funcionamento ideal da direcao.",
      "necessidade de aumentar o volume do som.",
    ],
    explicacao:
      "Desvios na trajetoria afetam controle e desgaste de pneus. Inspecao evita perda de estabilidade.",
    link: links.senatran,
  },
  {
    assunto: "Correias do motor",
    pergunta: "rachaduras ou ruido em correias podem indicar",
    correta:
      "desgaste e necessidade de substituicao conforme orientacao tecnica.",
    erradas: [
      "que a correia esta nova e ajustada.",
      "que o veiculo nao precisa de revisao.",
      "apenas excesso de combustivel no tanque.",
    ],
    explicacao:
      "Correias acionam sistemas importantes. Rupturas podem causar pane e danos ao motor.",
    link: links.senatran,
  },
  {
    assunto: "Equipamentos obrigatorios",
    pergunta: "triangulo de sinalizacao, chave de roda e macaco devem estar",
    correta:
      "em condicoes de uso quando aplicaveis ao veiculo.",
    erradas: [
      "guardados em casa para evitar furto.",
      "substituidos por pisca-alerta em qualquer pane.",
      "presentes apenas em viagens interestaduais.",
    ],
    explicacao:
      "Equipamentos obrigatorios permitem sinalizar e resolver emergencias simples, como troca de pneu, com mais seguranca.",
    link: links.ctb,
  },
];

const questions = [
  ...expand(categories.LEGISLACAO, legislationTopics, variants3, 64),
  ...expand(categories.DIRECAO_DEFENSIVA, defensiveTopics, variants2, 54),
  ...expand(categories.PRIMEIROS_SOCORROS, firstAidTopics, ["Em primeiros socorros no transito,"], 16),
  ...expand(
    categories.MEIO_AMBIENTE_CIDADANIA,
    environmentTopics,
    ["Em cidadania e meio ambiente no transito,"],
    16
  ),
  ...expand(categories.MECANICA, mechanicsTopics, ["Em mecanica basica veicular,"], 10),
];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(`${outputPath}`, `${JSON.stringify(questions, null, 2)}\n`);

const counts = questions.reduce((acc, question) => {
  acc[question.categoria] = (acc[question.categoria] ?? 0) + 1;
  return acc;
}, {});

console.log(`Generated ${questions.length} questions`);
console.table(counts);
