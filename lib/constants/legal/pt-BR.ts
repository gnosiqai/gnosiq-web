/**
 * @file lib/constants/legal/pt-BR.ts
 * @description Textos jurídicos canônicos do locale pt-BR. Texto verbatim:
 * cada constante tem o sha256 fixado em teste, então qualquer mudança de
 * letra quebra o build até ser revisada.
 */

/** Consentimento no início da avaliação (checkbox obrigatório, desmarcado por padrão). */
export const CONSENT_ASSESSMENT_PT =
  'Entendo que minhas respostas serão usadas para gerar meu relatório e que elas são dados sensíveis pela LGPD. Elas serão processadas por um provedor de inteligência artificial fora do Brasil, sem meu nome ou e-mail, sob contrato que proíbe uso para treinamento de modelos. Posso revogar este consentimento ou pedir a eliminação dos meus dados a qualquer momento, dentro do produto ou pelo e-mail hello@gnosiq.ai.'

/** Texto informativo na tela de feedback. */
export const CONSENT_FEEDBACK_PT =
  'Seu feedback (nota, precisão percebida, sinais por seção e comentário) é usado apenas para melhorar o produto e fica armazenado junto ao seu relatório, sob as mesmas regras de privacidade e eliminação.'

/** Consentimento opcional e revogável para uso do comentário como depoimento público. */
export const CONSENT_TESTIMONIAL_PT =
  'Autorizo a GnosIQ a usar meu comentário como depoimento público, identificado como [ ] primeiro nome e sobrenome [ ] apenas iniciais [ ] anônimo. Posso revogar quando quiser, dentro do produto ou pelo e-mail hello@gnosiq.ai, e o comentário deixará de ser usado em novos materiais.'

/** Aviso de conteúdo gerado por IA, na página 1 do relatório, antes do disclaimer clínico. */
export const AI_GENERATED_NOTICE_PT =
  'Este relatório foi gerado por inteligência artificial a partir das suas respostas. A pontuação do GnoScore é calculada por software da GnosIQ; os textos são escritos por IA e verificados automaticamente. Não é avaliação psicológica, laudo ou diagnóstico clínico.'

/** Limitação metodológica, de presença obrigatória no relatório. */
export const METHOD_LIMITATION_PT =
  'Seus resultados descrevem você a partir das suas próprias respostas: mostram quais das suas habilidades se destacam em relação às outras e como você descreve o seu jeito de ser. Eles não comparam você com outras pessoas, porque este instrumento ainda não tem uma base de referência populacional.'

/** Bloco de segurança, exibido por código na submissão e na seção afetada do relatório. */
export const SAFETY_NOTICE_PT =
  'Se você está passando por um momento difícil ou pensando em se machucar, procure ajuda agora. CVV: ligue 188 (24 horas, gratuito) ou acesse cvv.com.br. Em risco imediato: SAMU 192 ou o pronto-socorro mais próximo. Atendimento contínuo: procure o CAPS da sua cidade. Este aviso aparece automaticamente e ninguém da GnosIQ acompanha suas respostas em tempo real; por isso, se precisar, procure um desses canais agora.'

/** Canais do bloco de segurança em forma estruturada, para links e botões de discagem. */
export const SAFETY_RESOURCES_PT = {
  cvv: { phone: '188', url: 'https://www.cvv.com.br' },
  samu: { phone: '192' },
  caps: { label: 'CAPS da sua cidade' },
} as const
